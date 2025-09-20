const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult, param } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const userValidation = [
  body('username').isLength({ min: 3, max: 50 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('fullName').isLength({ min: 2, max: 100 }).trim(),
  body('role').isIn(['admin', 'teacher', 'student'])
];

const createUserValidation = [
  ...userValidation,
  body('password').isLength({ min: 6 })
];

const updateUserValidation = [
  ...userValidation,
  body('password').optional().isLength({ min: 6 })
];

// GET /api/users - Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0, role, search } = req.query;

    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramIndex = 1;

    if (role) {
      whereClause += ` AND u.role = $${paramIndex}`;
      queryParams.push(role);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const usersResult = await query(
      `SELECT u.id, u.username, u.email, u.full_name, u.role, u.avatar_url, 
              u.is_active, u.created_at, u.updated_at,
              COUNT(DISTINCT CASE WHEN u.role = 'teacher' THEN c.id END) as classes_teaching,
              COUNT(DISTINCT CASE WHEN u.role = 'student' THEN cs.id END) as classes_enrolled
       FROM users u
       LEFT JOIN classes c ON u.id = c.teacher_id AND u.role = 'teacher'
       LEFT JOIN class_students cs ON u.id = cs.student_id AND u.role = 'student'
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      queryParams
    );

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < parseInt(countResult.rows[0].total)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting users'
    });
  }
});

// GET /api/users/:id - Get user by ID (Admin only)
router.get('/:id', 
  authenticateToken, 
  requireAdmin,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
          errors: errors.array()
        });
      }

      const { id } = req.params;

      const userResult = await query(
        `SELECT u.id, u.username, u.email, u.full_name, u.role, u.avatar_url, 
                u.is_active, u.created_at, u.updated_at,
                COUNT(DISTINCT CASE WHEN u.role = 'teacher' THEN c.id END) as classes_teaching,
                COUNT(DISTINCT CASE WHEN u.role = 'student' THEN cs.id END) as classes_enrolled
         FROM users u
         LEFT JOIN classes c ON u.id = c.teacher_id AND u.role = 'teacher'
         LEFT JOIN class_students cs ON u.id = cs.student_id AND u.role = 'student'
         WHERE u.id = $1
         GROUP BY u.id`,
        [id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: userResult.rows[0]
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error getting user'
      });
    }
  }
);

// POST /api/users - Create new user (Admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  createUserValidation, 
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

      const { username, email, password, fullName, role } = req.body;

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUserResult = await query(
        `INSERT INTO users (username, email, password_hash, full_name, role) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, username, email, full_name, role, is_active, created_at`,
        [username, email, passwordHash, fullName, role]
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: newUserResult.rows[0]
        }
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating user'
      });
    }
  }
);

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id', 
  authenticateToken, 
  requireAdmin,
  [param('id').isInt({ min: 1 })],
  updateUserValidation,
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
      const { username, email, password, fullName, role } = req.body;

      // Check if user exists
      const existingUser = await query('SELECT id FROM users WHERE id = $1', [id]);
      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email or username already exists (excluding current user)
      const duplicateUser = await query(
        'SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3',
        [email, username, id]
      );

      if (duplicateUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email or username already exists'
        });
      }

      // Prepare update query
      let updateQuery = 'UPDATE users SET username = $1, email = $2, full_name = $3, role = $4, updated_at = CURRENT_TIMESTAMP';
      let queryParams = [username, email, fullName, role];
      let paramIndex = 5;

      // Add password to update if provided
      if (password) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        updateQuery += `, password_hash = $${paramIndex}`;
        queryParams.push(passwordHash);
        paramIndex++;
      }

      updateQuery += ` WHERE id = $${paramIndex} RETURNING id, username, email, full_name, role, is_active, created_at, updated_at`;
      queryParams.push(id);

      // Update user
      const updatedUserResult = await query(updateQuery, queryParams);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user: updatedUserResult.rows[0]
        }
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating user'
      });
    }
  }
);

// DELETE /api/users/:id - Delete user (Admin only)
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
          message: 'Invalid user ID',
          errors: errors.array()
        });
      }

      const { id } = req.params;

      // Check if user exists
      const existingUser = await query('SELECT id, role FROM users WHERE id = $1', [id]);
      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent deleting the last admin
      if (existingUser.rows[0].role === 'admin') {
        const adminCount = await query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']);
        if (parseInt(adminCount.rows[0].count) <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete the last admin user'
          });
        }
      }

      // Delete user
      await query('DELETE FROM users WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting user'
      });
    }
  }
);

// PATCH /api/users/:id/toggle-active - Toggle user active status (Admin only)
router.patch('/:id/toggle-active', 
  authenticateToken, 
  requireAdmin,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
          errors: errors.array()
        });
      }

      const { id } = req.params;

      // Check if user exists
      const existingUser = await query('SELECT id, is_active, role FROM users WHERE id = $1', [id]);
      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = existingUser.rows[0];

      // Prevent deactivating the last admin
      if (user.role === 'admin' && user.is_active) {
        const activeAdminCount = await query(
          'SELECT COUNT(*) as count FROM users WHERE role = $1 AND is_active = true',
          ['admin']
        );
        if (parseInt(activeAdminCount.rows[0].count) <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot deactivate the last active admin user'
          });
        }
      }

      // Toggle active status
      const updatedUserResult = await query(
        `UPDATE users 
         SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING id, username, email, full_name, role, is_active, created_at, updated_at`,
        [id]
      );

      res.json({
        success: true,
        message: `User ${updatedUserResult.rows[0].is_active ? 'activated' : 'deactivated'} successfully`,
        data: {
          user: updatedUserResult.rows[0]
        }
      });

    } catch (error) {
      console.error('Toggle user active error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error toggling user active status'
      });
    }
  }
);

module.exports = router;
