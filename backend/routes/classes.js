const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const classValidation = [
  body('class_name').isLength({ min: 1, max: 100 }).trim(),
  body('class_code').isLength({ min: 1, max: 20 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('teacher_id').optional().isInt({ min: 1 }),
  body('academic_year').isLength({ min: 1, max: 20 }).trim(),
  body('semester').isInt({ min: 1, max: 3 })
];

// GET /api/classes - Get all classes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, teacher_id, active_only } = req.query;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramIndex = 1;

    if (teacher_id) {
      whereClause += ` AND c.teacher_id = $${paramIndex}`;
      queryParams.push(teacher_id);
      paramIndex++;
    }

    if (active_only === 'true') {
      whereClause += ` AND c.is_active = true`;
    }

    const classesResult = await query(
      `SELECT c.id, c.class_name, c.class_code, c.description, c.teacher_id, 
              c.academic_year, c.semester, c.is_active, c.created_at, c.updated_at,
              u.full_name as teacher_name,
              COUNT(DISTINCT cs.student_id) as student_count,
              COUNT(DISTINCT d.id) as document_count
       FROM classes c
       LEFT JOIN users u ON c.teacher_id = u.id
       LEFT JOIN class_students cs ON c.id = cs.class_id
       LEFT JOIN documents d ON c.id = d.class_id
       ${whereClause}
       GROUP BY c.id, u.full_name
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM classes c ${whereClause}`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        classes: classesResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total)
        }
      }
    });

  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting classes'
    });
  }
});

// GET /api/classes/:id - Get class by ID
router.get('/:id', 
  authenticateToken,
  [param('id').isInt({ min: 1 })],
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

      const { id } = req.params;

      const classResult = await query(
        `SELECT c.*, u.full_name as teacher_name,
                COUNT(DISTINCT cs.student_id) as student_count,
                COUNT(DISTINCT d.id) as document_count
         FROM classes c
         LEFT JOIN users u ON c.teacher_id = u.id
         LEFT JOIN class_students cs ON c.id = cs.class_id
         LEFT JOIN documents d ON c.id = d.class_id
         WHERE c.id = $1
         GROUP BY c.id, u.full_name`,
        [id]
      );

      if (classResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      res.json({
        success: true,
        data: {
          class: classResult.rows[0]
        }
      });

    } catch (error) {
      console.error('Get class error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error getting class'
      });
    }
  }
);

// POST /api/classes - Create new class (Admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  classValidation, 
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { class_name, class_code, description, teacher_id, academic_year, semester } = req.body;

      // Check if class code already exists
      const existingClass = await query(
        'SELECT id FROM classes WHERE class_code = $1',
        [class_code]
      );

      if (existingClass.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Class code already exists'
        });
      }

      // Verify teacher exists if provided
      if (teacher_id) {
        const teacherResult = await query(
          'SELECT id FROM users WHERE id = $1 AND role = $2',
          [teacher_id, 'teacher']
        );

        if (teacherResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid teacher ID'
          });
        }
      }

      // Create class
      const newClassResult = await query(
        `INSERT INTO classes (class_name, class_code, description, teacher_id, academic_year, semester) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [class_name, class_code, description || null, teacher_id || null, academic_year, semester]
      );

      // Get class with teacher name
      const classWithTeacher = await query(
        `SELECT c.*, u.full_name as teacher_name
         FROM classes c
         LEFT JOIN users u ON c.teacher_id = u.id
         WHERE c.id = $1`,
        [newClassResult.rows[0].id]
      );

      res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: {
          class: classWithTeacher.rows[0]
        }
      });

    } catch (error) {
      console.error('Create class error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating class'
      });
    }
  }
);

// PUT /api/classes/:id - Update class (Admin only)
router.put('/:id', 
  authenticateToken, 
  requireAdmin,
  [param('id').isInt({ min: 1 })],
  classValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { class_name, class_code, description, teacher_id, academic_year, semester } = req.body;

      // Check if class exists
      const existingClass = await query('SELECT id FROM classes WHERE id = $1', [id]);
      if (existingClass.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      // Check if class code already exists (excluding current class)
      const duplicateClass = await query(
        'SELECT id FROM classes WHERE class_code = $1 AND id != $2',
        [class_code, id]
      );

      if (duplicateClass.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Class code already exists'
        });
      }

      // Verify teacher exists if provided
      if (teacher_id) {
        const teacherResult = await query(
          'SELECT id FROM users WHERE id = $1 AND role = $2',
          [teacher_id, 'teacher']
        );

        if (teacherResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid teacher ID'
          });
        }
      }

      // Update class
      await query(
        `UPDATE classes 
         SET class_name = $1, class_code = $2, description = $3, teacher_id = $4, 
             academic_year = $5, semester = $6, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $7`,
        [class_name, class_code, description || null, teacher_id || null, academic_year, semester, id]
      );

      // Get updated class with teacher name
      const updatedClass = await query(
        `SELECT c.*, u.full_name as teacher_name
         FROM classes c
         LEFT JOIN users u ON c.teacher_id = u.id
         WHERE c.id = $1`,
        [id]
      );

      res.json({
        success: true,
        message: 'Class updated successfully',
        data: {
          class: updatedClass.rows[0]
        }
      });

    } catch (error) {
      console.error('Update class error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating class'
      });
    }
  }
);

// DELETE /api/classes/:id - Delete class (Admin only)
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
          message: 'Invalid class ID',
          errors: errors.array()
        });
      }

      const { id } = req.params;

      // Check if class exists
      const existingClass = await query('SELECT id FROM classes WHERE id = $1', [id]);
      if (existingClass.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      // Delete class (cascades to class_students and documents)
      await query('DELETE FROM classes WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Class deleted successfully'
      });

    } catch (error) {
      console.error('Delete class error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting class'
      });
    }
  }
);

// GET /api/classes/:id/students - Get students in class
router.get('/:id/students', 
  authenticateToken,
  [param('id').isInt({ min: 1 })],
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

      const { id } = req.params;

      // Check if class exists
      const classExists = await query('SELECT id FROM classes WHERE id = $1', [id]);
      if (classExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      // Get students in class
      const studentsResult = await query(
        `SELECT u.id, u.username, u.email, u.full_name, u.is_active, cs.enrolled_at
         FROM class_students cs
         JOIN users u ON cs.student_id = u.id
         WHERE cs.class_id = $1
         ORDER BY u.full_name`,
        [id]
      );

      res.json({
        success: true,
        data: {
          students: studentsResult.rows
        }
      });

    } catch (error) {
      console.error('Get class students error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error getting class students'
      });
    }
  }
);

// POST /api/classes/:id/students - Add student to class (Admin only)
router.post('/:id/students', 
  authenticateToken, 
  requireAdmin,
  [
    param('id').isInt({ min: 1 }),
    body('studentId').isInt({ min: 1 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { studentId } = req.body;

      // Check if class exists
      const classExists = await query('SELECT id FROM classes WHERE id = $1', [id]);
      if (classExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Class not found'
        });
      }

      // Check if student exists and is a student
      const studentExists = await query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [studentId, 'student']
      );
      if (studentExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if student is already in class
      const alreadyEnrolled = await query(
        'SELECT id FROM class_students WHERE class_id = $1 AND student_id = $2',
        [id, studentId]
      );
      if (alreadyEnrolled.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Student is already enrolled in this class'
        });
      }

      // Add student to class
      await query(
        'INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)',
        [id, studentId]
      );

      res.json({
        success: true,
        message: 'Student added to class successfully'
      });

    } catch (error) {
      console.error('Add student to class error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error adding student to class'
      });
    }
  }
);

// DELETE /api/classes/:id/students/:studentId - Remove student from class (Admin only)
router.delete('/:id/students/:studentId', 
  authenticateToken, 
  requireAdmin,
  [
    param('id').isInt({ min: 1 }),
    param('studentId').isInt({ min: 1 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id, studentId } = req.params;

      // Check if enrollment exists
      const enrollmentExists = await query(
        'SELECT id FROM class_students WHERE class_id = $1 AND student_id = $2',
        [id, studentId]
      );
      if (enrollmentExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student is not enrolled in this class'
        });
      }

      // Remove student from class
      await query(
        'DELETE FROM class_students WHERE class_id = $1 AND student_id = $2',
        [id, studentId]
      );

      res.json({
        success: true,
        message: 'Student removed from class successfully'
      });

    } catch (error) {
      console.error('Remove student from class error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error removing student from class'
      });
    }
  }
);

module.exports = router;
