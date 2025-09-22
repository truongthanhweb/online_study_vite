// Demo authentication for testing without backend
export const demoAccounts = {
  admin: {
    id: 1,
    username: 'admin',
    email: 'admin@school.edu.vn',
    password: 'admin123',
    full_name: 'Quản trị viên',
    role: 'admin' as const,
    is_active: true
  },
  teacher: {
    id: 2,
    username: 'teacher1',
    email: 'teacher1@school.edu.vn',
    password: 'teacher123',
    full_name: 'Nguyễn Văn An',
    role: 'teacher' as const,
    is_active: true
  },
  student: {
    id: 3,
    username: 'student1',
    email: 'student1@school.edu.vn',
    password: 'student123',
    full_name: 'Trần Thị Bình',
    role: 'student' as const,
    is_active: true
  }
};

export const authenticateDemo = (email: string, password: string) => {
  // Find matching account
  const account = Object.values(demoAccounts).find(
    acc => acc.email === email && acc.password === password
  );
  
  if (account) {
    // Remove password from response
    const { password: _, ...user } = account;
    
    return {
      success: true,
      data: {
        user,
        token: `demo_token_${user.role}_${Date.now()}`
      },
      message: 'Đăng nhập thành công'
    };
  }
  
  return {
    success: false,
    message: 'Email hoặc mật khẩu không đúng'
  };
};
