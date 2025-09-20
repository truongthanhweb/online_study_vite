const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and are active
    const userResult = await query(
      'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = userResult.rows[0];
    
    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'User account is deactivated' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check user roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = requireRole('admin');

// Middleware to check if user is teacher or admin
const requireTeacherOrAdmin = requireRole(['teacher', 'admin']);

// Middleware to check if user can access class
const requireClassAccess = async (req, res, next) => {
  try {
    const classId = req.params.classId || req.body.classId;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!classId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class ID is required' 
      });
    }

    // Admin can access all classes
    if (userRole === 'admin') {
      return next();
    }

    // Teacher can access classes they teach
    if (userRole === 'teacher') {
      const teacherClassResult = await query(
        'SELECT id FROM classes WHERE id = $1 AND teacher_id = $2',
        [classId, userId]
      );

      if (teacherClassResult.rows.length > 0) {
        return next();
      }
    }

    // Student can access classes they're enrolled in
    if (userRole === 'student') {
      const studentClassResult = await query(
        'SELECT cs.id FROM class_students cs WHERE cs.class_id = $1 AND cs.student_id = $2',
        [classId, userId]
      );

      if (studentClassResult.rows.length > 0) {
        return next();
      }
    }

    return res.status(403).json({ 
      success: false, 
      message: 'Access denied to this class' 
    });

  } catch (error) {
    console.error('Class access check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error checking class access' 
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireTeacherOrAdmin,
  requireClassAccess
};
