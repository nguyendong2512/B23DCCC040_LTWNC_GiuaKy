// Trạng thái thẻ thư viện: đang hoạt động hoặc bị khóa
export type LibraryCardStatus = 'active' | 'locked';

export interface Student {
  studentId: string;              // Mã số sinh viên (ví dụ: B23DCCC040, SV2024001)
  fullName: string;               // Họ và tên sinh viên
  faculty: string;                // Khoa (CNTT, Kinh tế, Ngoại ngữ...)
  className: string;              // Lớp sinh hoạt (ví dụ: D21-CNTT01)
  major: string;                  // Ngành học (ví dụ: Kỹ thuật Phần mềm, QTKD)
  academicYear: string;           // Khóa học (ví dụ: Khóa 2023 - 2027 / K23)
  email: string;                  // Email để gửi thông báo
  phone: string;                  // Số điện thoại để gửi thông báo
  cardStatus: LibraryCardStatus;  // Trạng thái thẻ thư viện: đang hoạt động, bị khóa
  cardExpiryDate: string;         // Ngày hết hạn thẻ thư viện (DD/MM/YYYY)
  password?: string;              // Mật khẩu đăng nhập
  createdAt?: string;             // Ngày tạo tài khoản
}

export interface AuthState {
  currentUser: Student | null;
  registeredStudents: Student[];
  isAuthenticated: boolean;
  error: string | null;
}
