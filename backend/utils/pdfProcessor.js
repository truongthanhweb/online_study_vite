const pdf = require('pdf-poppler');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// PDF processing options
const PDF_OPTIONS = {
  format: 'jpeg',
  out_dir: 'uploads/pages',
  out_prefix: '',
  page: null, // Convert all pages
  quality: parseInt(process.env.PDF_QUALITY) || 150
};

/**
 * Convert PDF to images
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} documentId - Document ID for naming
 * @returns {Promise<Array>} Array of page information
 */
const convertPdfToImages = async (pdfPath, documentId) => {
  try {
    console.log(`📄 Starting PDF conversion for document ${documentId}`);
    
    // Create unique directory for this document's pages
    const pageDir = path.join('uploads/pages', documentId.toString());
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }

    // Set up conversion options
    const options = {
      ...PDF_OPTIONS,
      out_dir: pageDir,
      out_prefix: `page_${documentId}_`
    };

    // Convert PDF to images
    const convertResult = await pdf.convert(pdfPath, options);
    console.log(`✅ PDF converted successfully: ${convertResult}`);

    // Get list of generated images
    const pageFiles = fs.readdirSync(pageDir)
      .filter(file => file.startsWith(`page_${documentId}_`))
      .sort((a, b) => {
        // Sort by page number
        const pageA = parseInt(a.match(/page_\d+_(\d+)/)?.[1] || '0');
        const pageB = parseInt(b.match(/page_\d+_(\d+)/)?.[1] || '0');
        return pageA - pageB;
      });

    console.log(`📊 Generated ${pageFiles.length} page images`);

    // Process each page image and get dimensions
    const pages = [];
    for (let i = 0; i < pageFiles.length; i++) {
      const filename = pageFiles[i];
      const imagePath = path.join(pageDir, filename);
      
      try {
        // Get image dimensions using sharp
        const metadata = await sharp(imagePath).metadata();
        
        // Optimize image if needed (compress large images)
        if (metadata.width > 2000 || metadata.height > 2000) {
          await sharp(imagePath)
            .resize(2000, 2000, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toFile(imagePath + '_optimized');
          
          // Replace original with optimized version
          fs.renameSync(imagePath + '_optimized', imagePath);
          
          // Update metadata
          const newMetadata = await sharp(imagePath).metadata();
          metadata.width = newMetadata.width;
          metadata.height = newMetadata.height;
        }

        pages.push({
          pageNumber: i + 1,
          filename: filename,
          imagePath: imagePath.replace(/\\/g, '/'), // Normalize path separators
          width: metadata.width,
          height: metadata.height,
          size: fs.statSync(imagePath).size
        });

        console.log(`📄 Processed page ${i + 1}: ${metadata.width}x${metadata.height}`);
      } catch (error) {
        console.error(`❌ Error processing page ${i + 1}:`, error);
        // Create placeholder for failed page
        pages.push({
          pageNumber: i + 1,
          filename: filename,
          imagePath: imagePath.replace(/\\/g, '/'),
          width: 800,
          height: 1000,
          size: 0,
          error: 'Failed to process page'
        });
      }
    }

    return pages;
  } catch (error) {
    console.error('❌ PDF conversion error:', error);
    throw new Error(`Failed to convert PDF: ${error.message}`);
  }
};

/**
 * Get PDF page count without converting
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<number>} Number of pages
 */
const getPdfPageCount = async (pdfPath) => {
  try {
    // Use pdf-poppler to get info about the PDF
    const info = await pdf.info(pdfPath);
    return info.pages || 0;
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    return 0;
  }
};

/**
 * Clean up page images for a document
 * @param {string} documentId - Document ID
 */
const cleanupPageImages = (documentId) => {
  try {
    const pageDir = path.join('uploads/pages', documentId.toString());
    if (fs.existsSync(pageDir)) {
      fs.rmSync(pageDir, { recursive: true, force: true });
      console.log(`🗑️ Cleaned up page images for document ${documentId}`);
    }
  } catch (error) {
    console.error('Error cleaning up page images:', error);
  }
};

/**
 * Create thumbnail for document
 * @param {string} firstPagePath - Path to first page image
 * @param {string} documentId - Document ID
 * @returns {Promise<string>} Path to thumbnail
 */
const createThumbnail = async (firstPagePath, documentId) => {
  try {
    const thumbnailDir = path.join('uploads/thumbnails');
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }

    const thumbnailPath = path.join(thumbnailDir, `thumb_${documentId}.jpeg`);
    
    await sharp(firstPagePath)
      .resize(300, 400, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    console.log(`🖼️ Created thumbnail for document ${documentId}`);
    return thumbnailPath.replace(/\\/g, '/');
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return null;
  }
};

/**
 * Validate PDF file
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<boolean>} True if valid PDF
 */
const validatePdf = async (pdfPath) => {
  try {
    await pdf.info(pdfPath);
    return true;
  } catch (error) {
    console.error('PDF validation failed:', error);
    return false;
  }
};

module.exports = {
  convertPdfToImages,
  getPdfPageCount,
  cleanupPageImages,
  createThumbnail,
  validatePdf
};
