const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacherOrAdmin, requireClassAccess } = require('../middleware/auth');
const { uploadDocument, handleUploadError, cleanupFile, getFileInfo } = require('../middleware/upload');
const { convertPdfToImages, getPdfPageCount, cleanupPageImages, createThumbnail, validatePdf } = require('../utils/pdfProcessor');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Validation rules
const uploadValidation = [
  body('title').isLength({ min: 1, max: 255 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('classId').isInt({ min: 1 }),
  body('lessonDate').isISO8601(),
  body('lessonTopic').optional().isLength({ max: 255 }).trim()
];

// POST /api/documents/upload - Upload document (Admin only)
router.post('/upload', 
  authenticateToken, 
  requireAdmin, 
  uploadDocument, 
  uploadValidation, 
  async (req, res) => {
    let uploadedFile = null;
    
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) cleanupFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      uploadedFile = req.file;
      const fileInfo = getFileInfo(uploadedFile);
      const { title, description, classId, lessonDate, lessonTopic } = req.body;

      // Verify class exists
      const classResult = await query(
        'SELECT id, class_name FROM classes WHERE id = $1',
        [classId]
      );

      if (classResult.rows.length === 0) {
        cleanupFile(uploadedFile.path);
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      // Insert document record
      const documentResult = await query(
        `INSERT INTO documents (title, description, original_filename, file_path, file_size, 
                               file_type, mime_type, class_id, lesson_date, lesson_topic, 
                               uploaded_by, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING id`,
        [
          title,
          description || null,
          fileInfo.originalName,
          fileInfo.path,
          fileInfo.size,
          fileInfo.extension,
          fileInfo.mimetype,
          classId,
          lessonDate,
          lessonTopic || null,
          req.user.id,
          'processing'
        ]
      );

      const documentId = documentResult.rows[0].id;

      // Process PDF files
      if (fileInfo.extension === '.pdf') {
        try {
          console.log(`📄 Processing PDF document ${documentId}`);
          
          // Validate PDF
          const isValidPdf = await validatePdf(fileInfo.path);
          if (!isValidPdf) {
            throw new Error('Invalid PDF file');
          }

          // Get page count
          const pageCount = await getPdfPageCount(fileInfo.path);
          
          // Convert PDF to images
          const pages = await convertPdfToImages(fileInfo.path, documentId);
          
          // Update document with page count
          await query(
            'UPDATE documents SET total_pages = $1, status = $2 WHERE id = $3',
            [pageCount, 'completed', documentId]
          );

          // Insert page records
          for (const page of pages) {
            await query(
              `INSERT INTO document_pages (document_id, page_number, image_path, image_width, image_height) 
               VALUES ($1, $2, $3, $4, $5)`,
              [documentId, page.pageNumber, page.imagePath, page.width, page.height]
            );
          }

          // Create thumbnail from first page
          if (pages.length > 0) {
            await createThumbnail(pages[0].imagePath, documentId);
          }

          console.log(`✅ PDF processing completed for document ${documentId}`);

        } catch (pdfError) {
          console.error('PDF processing error:', pdfError);
          
          // Update document status to failed
          await query(
            'UPDATE documents SET status = $1 WHERE id = $2',
            ['failed', documentId]
          );

          // Clean up any partial page images
          cleanupPageImages(documentId);
        }
      } else {
        // For non-PDF files, mark as completed
        await query(
          'UPDATE documents SET status = $1 WHERE id = $2',
          ['completed', documentId]
        );
      }

      // Get the complete document info
      const finalDocumentResult = await query(
        `SELECT d.*, c.class_name, u.full_name as uploaded_by_name,
                COUNT(dp.id) as page_count
         FROM documents d
         JOIN classes c ON d.class_id = c.id
         JOIN users u ON d.uploaded_by = u.id
         LEFT JOIN document_pages dp ON d.id = dp.document_id
         WHERE d.id = $1
         GROUP BY d.id, c.class_name, u.full_name`,
        [documentId]
      );

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          document: finalDocumentResult.rows[0]
        }
      });

    } catch (error) {
      console.error('Document upload error:', error);
      
      // Clean up uploaded file on error
      if (uploadedFile) {
        cleanupFile(uploadedFile.path);
      }

      res.status(500).json({
        success: false,
        message: 'Server error during document upload'
      });
    }
  }
);

// Handle upload errors
router.use(handleUploadError);

// GET /api/documents/class/:classId - Get documents for a class
router.get('/class/:classId', 
  authenticateToken, 
  requireClassAccess,
  [param('classId').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid class ID',
          errors: errors.array()
        });
      }

      const { classId } = req.params;
      const { date, limit = 50, offset = 0 } = req.query;

      let whereClause = 'WHERE d.class_id = $1';
      let queryParams = [classId];

      // Filter by date if provided
      if (date) {
        whereClause += ' AND d.lesson_date = $2';
        queryParams.push(date);
      }

      const documentsResult = await query(
        `SELECT d.id, d.title, d.description, d.original_filename, d.file_size, 
                d.file_type, d.lesson_date, d.lesson_topic, d.status, d.total_pages,
                d.created_at, c.class_name, u.full_name as uploaded_by_name,
                COUNT(dp.id) as page_count
         FROM documents d
         JOIN classes c ON d.class_id = c.id
         JOIN users u ON d.uploaded_by = u.id
         LEFT JOIN document_pages dp ON d.id = dp.document_id
         ${whereClause}
         GROUP BY d.id, c.class_name, u.full_name
         ORDER BY d.lesson_date DESC, d.created_at DESC
         LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
        [...queryParams, limit, offset]
      );

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM documents d ${whereClause}`,
        queryParams
      );

      res.json({
        success: true,
        data: {
          documents: documentsResult.rows,
          pagination: {
            total: parseInt(countResult.rows[0].total),
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total)
          }
        }
      });

    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error getting documents'
      });
    }
  }
);

// GET /api/documents/:id - Get document details
router.get('/:id', 
  authenticateToken,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document ID',
          errors: errors.array()
        });
      }

      const { id } = req.params;

      // Get document with class info
      const documentResult = await query(
        `SELECT d.*, c.class_name, c.class_code, u.full_name as uploaded_by_name
         FROM documents d
         JOIN classes c ON d.class_id = c.id
         JOIN users u ON d.uploaded_by = u.id
         WHERE d.id = $1`,
        [id]
      );

      if (documentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      const document = documentResult.rows[0];

      // Check if user has access to this document's class
      const hasAccess = await checkClassAccess(req.user, document.class_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this document'
        });
      }

      // Get pages if it's a PDF
      let pages = [];
      if (document.file_type === '.pdf') {
        const pagesResult = await query(
          `SELECT page_number, image_path, image_width, image_height 
           FROM document_pages 
           WHERE document_id = $1 
           ORDER BY page_number`,
          [id]
        );
        pages = pagesResult.rows;
      }

      // Log access
      await query(
        `INSERT INTO document_access_logs (document_id, user_id, access_type, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, req.user.id, 'view', req.ip, req.get('User-Agent')]
      );

      res.json({
        success: true,
        data: {
          document,
          pages
        }
      });

    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error getting document'
      });
    }
  }
);

// GET /api/documents/:id/download - Download original document
router.get('/:id/download', 
  authenticateToken,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document ID',
          errors: errors.array()
        });
      }

      const { id } = req.params;

      // Get document
      const documentResult = await query(
        `SELECT d.*, c.class_name 
         FROM documents d
         JOIN classes c ON d.class_id = c.id
         WHERE d.id = $1`,
        [id]
      );

      if (documentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      const document = documentResult.rows[0];

      // Check if user has access to this document's class
      const hasAccess = await checkClassAccess(req.user, document.class_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this document'
        });
      }

      // Check if file exists
      if (!fs.existsSync(document.file_path)) {
        return res.status(404).json({
          success: false,
          message: 'Document file not found'
        });
      }

      // Log download
      await query(
        `INSERT INTO document_access_logs (document_id, user_id, access_type, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, req.user.id, 'download', req.ip, req.get('User-Agent')]
      );

      // Send file
      res.download(document.file_path, document.original_filename, (err) => {
        if (err) {
          console.error('Download error:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Error downloading file'
            });
          }
        }
      });

    } catch (error) {
      console.error('Download document error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error downloading document'
      });
    }
  }
);

// DELETE /api/documents/:id - Delete document (Admin only)
router.delete('/:id', 
  authenticateToken, 
  requireAdmin,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document ID',
          errors: errors.array()
        });
      }

      const { id } = req.params;

      // Get document info
      const documentResult = await query(
        'SELECT file_path, file_type FROM documents WHERE id = $1',
        [id]
      );

      if (documentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      const document = documentResult.rows[0];

      // Delete document record (cascades to pages and logs)
      await query('DELETE FROM documents WHERE id = $1', [id]);

      // Clean up files
      try {
        // Delete original file
        if (fs.existsSync(document.file_path)) {
          fs.unlinkSync(document.file_path);
        }

        // Delete page images if PDF
        if (document.file_type === '.pdf') {
          cleanupPageImages(id);
        }

        // Delete thumbnail
        const thumbnailPath = path.join('uploads/thumbnails', `thumb_${id}.jpeg`);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      } catch (fileError) {
        console.error('Error cleaning up files:', fileError);
      }

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });

    } catch (error) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting document'
      });
    }
  }
);

// Helper function to check class access
async function checkClassAccess(user, classId) {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'teacher') {
    const teacherClassResult = await query(
      'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2',
      [classId, user.id]
    );
    return teacherClassResult.rows.length > 0;
  }

  if (user.role === 'student') {
    const studentClassResult = await query(
      'SELECT cs.id FROM class_students cs WHERE cs.class_id = $1 AND cs.student_id = $2',
      [classId, user.id]
    );
    return studentClassResult.rows.length > 0;
  }

  return false;
}

module.exports = router;
