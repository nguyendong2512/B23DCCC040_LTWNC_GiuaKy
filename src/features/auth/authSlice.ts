import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, Student, LibraryCardStatus } from './types';

// Danh sách sinh viên mẫu trong hệ thống thư viện khoa đầy đủ thông tin
export const defaultStudents: Student[] = [
  {
    studentId: 'B23DCCC040',
    fullName: 'Nguyễn Văn Đông',
    faculty: 'CNTT',
    className: 'D23-CNTT01',
    major: 'Kỹ thuật Phần mềm',
    academicYear: 'Khóa 2023 - 2027 (K23)',
    email: 'dong.nguyen@university.edu.vn',
    phone: '0988 123 456',
    cardStatus: 'active',
    cardExpiryDate: '31/12/2027',
    password: '123',
    createdAt: '2023-09-05',
  },
  {
    studentId: 'SV2024002',
    fullName: 'Trần Thị Mai',
    faculty: 'Kinh tế',
    className: 'D23-QTKD02',
    major: 'Quản trị Doanh nghiệp',
    academicYear: 'Khóa 2023 - 2027 (K23)',
    email: 'mai.tran@university.edu.vn',
    phone: '0912 345 678',
    cardStatus: 'active',
    cardExpiryDate: '31/12/2027',
    password: '123',
    createdAt: '2023-09-05',
  },
];

// Hàm chuẩn hóa dữ liệu sinh viên, bảo đảm luôn có cardStatus = 'active' và cardExpiryDate
export const normalizeStudent = (s: any): Student => {
  return {
    ...s,
    // Mặc định luôn là 'active' (đang hoạt động) nếu chưa được đặt cụ thể
    cardStatus: s?.cardStatus === 'locked' ? 'locked' : 'active',
    cardExpiryDate: s?.cardExpiryDate && s.cardExpiryDate.trim() ? s.cardExpiryDate : '31/12/2027',
    className: s?.className || 'D23-CNTT01',
    major: s?.major || 'Công nghệ Thông tin',
    academicYear: s?.academicYear || 'Khóa 2023 - 2027',
    phone: s?.phone || '0988 123 456',
  };
};

// Khôi phục từ localStorage nếu có
const loadSavedStudents = (): Student[] => {
  try {
    const data = localStorage.getItem('mini_library_students');
    if (data) {
      const parsed: any[] = JSON.parse(data);
      return parsed.map(normalizeStudent);
    }
    return defaultStudents;
  } catch {
    return defaultStudents;
  }
};

const loadSavedCurrentUser = (): Student | null => {
  try {
    const data = localStorage.getItem('mini_library_current_user');
    if (data) {
      const parsed = JSON.parse(data);
      const normalized = normalizeStudent(parsed);
      // Đồng bộ lại vào localStorage để sửa dữ liệu cũ
      try {
        localStorage.setItem('mini_library_current_user', JSON.stringify(normalized));
      } catch {}
      return normalized;
    }
    return null;
  } catch {
    return null;
  }
};

const initialCurrentUser = loadSavedCurrentUser();

const initialState: AuthState = {
  currentUser: initialCurrentUser,
  registeredStudents: loadSavedStudents(),
  isAuthenticated: initialCurrentUser !== null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Đăng ký tài khoản sinh viên mới (mặc định thẻ đang hoạt động)
    registerStudent: (state, action: PayloadAction<Student>) => {
      const normalized = normalizeStudent(action.payload);

      const existingIndex = state.registeredStudents.findIndex(
        (s) => s.studentId.trim().toUpperCase() === normalized.studentId.trim().toUpperCase()
      );

      if (existingIndex >= 0) {
        state.error = `Mã sinh viên "${normalized.studentId}" đã được đăng ký trong hệ thống!`;
        return;
      }

      state.registeredStudents.push(normalized);
      state.currentUser = normalized;
      state.isAuthenticated = true;
      state.error = null;

      try {
        localStorage.setItem('mini_library_students', JSON.stringify(state.registeredStudents));
        localStorage.setItem('mini_library_current_user', JSON.stringify(normalized));
      } catch (err) {
        console.error('Không thể lưu vào localStorage', err);
      }
    },

    // Đăng nhập với Mã sinh viên và Mật khẩu
    login: (
      state,
      action: PayloadAction<{ studentId: string; password?: string }>
    ) => {
      const { studentId, password } = action.payload;
      const student = state.registeredStudents.find(
        (s) => s.studentId.trim().toUpperCase() === studentId.trim().toUpperCase()
      );

      if (!student) {
        state.error = `Không tìm thấy sinh viên có mã "${studentId}". Vui lòng đăng ký!`;
        return;
      }

      if (student.password && password && student.password !== password) {
        state.error = 'Mật khẩu không chính xác. Mật khẩu mẫu là "123"!';
        return;
      }

      const normalized = normalizeStudent(student);
      state.currentUser = normalized;
      state.isAuthenticated = true;
      state.error = null;

      try {
        localStorage.setItem('mini_library_current_user', JSON.stringify(normalized));
      } catch (err) {
        console.error('Không thể lưu vào localStorage', err);
      }
    },

    // Đăng xuất
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      try {
        localStorage.removeItem('mini_library_current_user');
      } catch (err) {
        console.error('Lỗi khi xóa session', err);
      }
    },

    // Đăng nhập nhanh tài khoản mẫu
    loginDemoAccount: (state, action: PayloadAction<string>) => {
      const student = state.registeredStudents.find((s) => s.studentId === action.payload);
      if (student) {
        const normalized = normalizeStudent(student);
        state.currentUser = normalized;
        state.isAuthenticated = true;
        state.error = null;
        try {
          localStorage.setItem('mini_library_current_user', JSON.stringify(normalized));
        } catch (err) {
          console.error(err);
        }
      }
    },

    // Cập nhật trạng thái thẻ độc giả (active | locked)
    updateCardStatus: (
      state,
      action: PayloadAction<{ status: LibraryCardStatus; expiryDate?: string }>
    ) => {
      if (!state.currentUser) return;

      state.currentUser.cardStatus = action.payload.status;
      if (action.payload.expiryDate) {
        state.currentUser.cardExpiryDate = action.payload.expiryDate;
      }

      // Cập nhật trong danh sách sinh viên
      const idx = state.registeredStudents.findIndex(
        (s) => s.studentId.toUpperCase() === state.currentUser?.studentId.toUpperCase()
      );
      if (idx >= 0) {
        state.registeredStudents[idx].cardStatus = state.currentUser.cardStatus;
        state.registeredStudents[idx].cardExpiryDate = state.currentUser.cardExpiryDate;
      }

      try {
        localStorage.setItem('mini_library_current_user', JSON.stringify(state.currentUser));
        localStorage.setItem('mini_library_students', JSON.stringify(state.registeredStudents));
      } catch (err) {
        console.error(err);
      }
    },

    // Đổi qua lại giữa Đang hoạt động và Bị khóa
    toggleCardLock: (state) => {
      if (!state.currentUser) return;
      const nextStatus: LibraryCardStatus =
        state.currentUser.cardStatus === 'active' ? 'locked' : 'active';
      state.currentUser.cardStatus = nextStatus;

      const idx = state.registeredStudents.findIndex(
        (s) => s.studentId.toUpperCase() === state.currentUser?.studentId.toUpperCase()
      );
      if (idx >= 0) {
        state.registeredStudents[idx].cardStatus = nextStatus;
      }

      try {
        localStorage.setItem('mini_library_current_user', JSON.stringify(state.currentUser));
        localStorage.setItem('mini_library_students', JSON.stringify(state.registeredStudents));
      } catch (err) {
        console.error(err);
      }
    },

    // Gia hạn thẻ đến 31/12/2028 (hợp lệ)
    renewCard: (state) => {
      if (!state.currentUser) return;
      state.currentUser.cardExpiryDate = '31/12/2028';
      state.currentUser.cardStatus = 'active';

      const idx = state.registeredStudents.findIndex(
        (s) => s.studentId.toUpperCase() === state.currentUser?.studentId.toUpperCase()
      );
      if (idx >= 0) {
        state.registeredStudents[idx].cardExpiryDate = '31/12/2028';
        state.registeredStudents[idx].cardStatus = 'active';
      }

      try {
        localStorage.setItem('mini_library_current_user', JSON.stringify(state.currentUser));
        localStorage.setItem('mini_library_students', JSON.stringify(state.registeredStudents));
      } catch (err) {
        console.error(err);
      }
    },

    // Giả lập thẻ hết hạn (đặt ngày 01/01/2024 để test)
    setCardExpiredDemo: (state) => {
      if (!state.currentUser) return;
      state.currentUser.cardExpiryDate = '01/01/2024';

      const idx = state.registeredStudents.findIndex(
        (s) => s.studentId.toUpperCase() === state.currentUser?.studentId.toUpperCase()
      );
      if (idx >= 0) {
        state.registeredStudents[idx].cardExpiryDate = '01/01/2024';
      }

      try {
        localStorage.setItem('mini_library_current_user', JSON.stringify(state.currentUser));
        localStorage.setItem('mini_library_students', JSON.stringify(state.registeredStudents));
      } catch (err) {
        console.error(err);
      }
    },

    // Xóa lỗi auth
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  registerStudent,
  login,
  logout,
  loginDemoAccount,
  updateCardStatus,
  toggleCardLock,
  renewCard,
  setCardExpiredDemo,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;

