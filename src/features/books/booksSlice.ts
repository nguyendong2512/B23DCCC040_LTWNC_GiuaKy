import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BooksState, BorrowRecord } from './types';
import { fetchBooks } from './booksThunks';
import { login, logout, loginDemoAccount, registerStudent } from '../auth/authSlice';

// Danh sách phiếu mượn mẫu mặc định cho tài khoản demo Nguyễn Văn Đông
export const initialMockRecords: BorrowRecord[] = [
  {
    loanId: 'PM-2024-001',
    studentId: 'B23DCCC040',
    studentName: 'Nguyễn Văn Đông',
    bookId: 'book-02',
    bookTitle: 'Lập Trình Web Hiện Đại với React & TypeScript',
    borrowDate: '10/10/2026',
    dueDate: '24/10/2026',
    returnDate: null,
    status: 'borrowing',
    renewCount: 0,
    notesBorrow: 'Sách mới, bìa và các trang nguyên vẹn 100%',
    notesReturn: '',
  },
];

// Hàm tiện ích lấy studentId của sinh viên đang đăng nhập hiện tại từ localStorage
export const getCurrentStudentId = (): string | null => {
  try {
    const raw = localStorage.getItem('mini_library_current_user');
    if (raw) {
      const user = JSON.parse(raw);
      return user?.studentId || null;
    }
  } catch {
    return null;
  }
  return null;
};

// Nạp danh sách sách mượn từ localStorage ứng với từng sinh viên cụ thể
export const loadStudentLoansFromStorage = (
  studentId?: string | null
): { borrowedIds: string[]; borrowedRecords: BorrowRecord[] } => {
  if (!studentId) {
    return { borrowedIds: [], borrowedRecords: [] };
  }

  const normalizedId = studentId.trim().toUpperCase();

  try {
    const data = localStorage.getItem(`mini_library_loans_${normalizedId}`);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        borrowedIds: Array.isArray(parsed.borrowedIds) ? parsed.borrowedIds : [],
        borrowedRecords: Array.isArray(parsed.borrowedRecords) ? parsed.borrowedRecords : [],
      };
    }
  } catch (err) {
    console.error('Lỗi khi đọc dữ liệu mượn sách của sinh viên:', err);
  }

  // Đối với tài khoản mẫu ban đầu B23DCCC040 khi chưa có trong storage:
  if (normalizedId === 'B23DCCC040') {
    return {
      borrowedIds: ['book-02'],
      borrowedRecords: initialMockRecords,
    };
  }

  // Đối với sinh viên chưa có tài khoản hoặc sinh viên mới: Mặc định là 0 cuốn
  return {
    borrowedIds: [],
    borrowedRecords: [],
  };
};

// Lưu dữ liệu mượn của từng sinh viên vào localStorage
export const saveStudentLoansToStorage = (
  studentId: string | null | undefined,
  borrowedIds: string[],
  borrowedRecords: BorrowRecord[]
) => {
  if (!studentId) return;
  try {
    const normalizedId = studentId.trim().toUpperCase();
    localStorage.setItem(
      `mini_library_loans_${normalizedId}`,
      JSON.stringify({ borrowedIds, borrowedRecords })
    );
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu mượn sách:', err);
  }
};

// Khởi tạo state ban đầu dựa trên sinh viên đang đăng nhập (nếu có)
const initialStudentId = getCurrentStudentId();
const initialLoans = loadStudentLoansFromStorage(initialStudentId);

export const initialBooksState: BooksState = {
  items: [],
  borrowedIds: initialLoans.borrowedIds,
  borrowedRecords: initialLoans.borrowedRecords,
  status: 'idle',
  error: null,
  warning: null,
};

export const booksSlice = createSlice({
  name: 'books',
  initialState: initialBooksState,
  reducers: {
    // Đồng bộ dữ liệu mượn theo sinh viên cụ thể
    syncStudentLoans: (state, action: PayloadAction<string | null | undefined>) => {
      const studentId = action.payload;
      if (!studentId) {
        state.borrowedIds = [];
        state.borrowedRecords = [];
        state.warning = null;
        return;
      }

      const loans = loadStudentLoansFromStorage(studentId);
      state.borrowedIds = loans.borrowedIds;
      state.borrowedRecords = loans.borrowedRecords;
      state.warning = null;
    },

    // Mượn sách: giảm số bản còn lại đi 1, lưu phiếu mượn chi tiết theo sinh viên
    borrowBook: (
      state,
      action: PayloadAction<
        | string
        | {
            bookId: string;
            studentId?: string;
            studentName?: string;
            notesBorrow?: string;
            dueDate?: string;
          }
      >
    ) => {
      const bookId = typeof action.payload === 'string' ? action.payload : action.payload.bookId;
      const studentId =
        (typeof action.payload === 'object' ? action.payload.studentId : undefined) ||
        getCurrentStudentId() ||
        'B23DCCC040';
      const studentName =
        typeof action.payload === 'object' ? action.payload.studentName : undefined;
      const customNotes =
        typeof action.payload === 'object' ? action.payload.notesBorrow : undefined;
      const customDueDate =
        typeof action.payload === 'object' ? action.payload.dueDate : undefined;

      const targetBook = state.items.find((book) => book.id === bookId);

      if (targetBook && targetBook.availableCopies > 0 && !state.borrowedIds.includes(bookId)) {
        targetBook.availableCopies -= 1;
        state.borrowedIds.push(bookId);

        if (!state.borrowedRecords) {
          state.borrowedRecords = [];
        }

        const now = new Date();
        const due = new Date();
        due.setDate(now.getDate() + 14); // Hạn trả mặc định 14 ngày

        const formatDate = (d: Date) =>
          `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

        const newRecord: BorrowRecord = {
          loanId: `PM-${Math.floor(1000 + Math.random() * 9000)}`,
          bookId,
          bookTitle: targetBook.title,
          studentId,
          studentName: studentName || 'Sinh viên Thư viện',
          borrowDate: formatDate(now),
          dueDate: customDueDate || formatDate(due),
          returnDate: null,
          status: 'borrowing',
          renewCount: 0,
          notesBorrow: customNotes || 'Sách mới, bìa và các trang nguyên vẹn',
          notesReturn: '',
        };

        state.borrowedRecords.unshift(newRecord);
        state.warning = null;

        // Lưu vào localStorage của sinh viên
        saveStudentLoansToStorage(studentId, state.borrowedIds, state.borrowedRecords);
      }
    },

    // Trả sách: tăng số bản còn lại lên 1, cập nhật trạng thái phiếu mượn
    returnBook: (
      state,
      action: PayloadAction<string | { bookId: string; notesReturn?: string }>
    ) => {
      const bookId = typeof action.payload === 'string' ? action.payload : action.payload.bookId;
      const notesReturn = typeof action.payload === 'object' ? action.payload.notesReturn : undefined;

      const targetBook = state.items.find((book) => book.id === bookId);

      if (targetBook && state.borrowedIds.includes(bookId)) {
        targetBook.availableCopies += 1;
        state.borrowedIds = state.borrowedIds.filter((id) => id !== bookId);

        let affectedStudentId: string | null = getCurrentStudentId();

        // Cập nhật phiếu mượn tương ứng
        if (state.borrowedRecords) {
          const now = new Date();
          const returnDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

          const record = state.borrowedRecords.find((r) => r.bookId === bookId && r.status === 'borrowing');
          if (record) {
            record.status = 'returned';
            record.returnDate = returnDateStr;
            record.notesReturn = notesReturn || 'Đã hoàn trả đầy đủ, tình trạng sách tốt';
            affectedStudentId = record.studentId;
          }
        }
        state.warning = null;

        // Lưu cập nhật vào localStorage của sinh viên
        saveStudentLoansToStorage(affectedStudentId, state.borrowedIds, state.borrowedRecords || []);
      }
    },

    // Gia hạn thời gian mượn sách (+7 ngày)
    renewLoan: (state, action: PayloadAction<string>) => {
      const loanId = action.payload;
      const record = state.borrowedRecords?.find((r) => r.loanId === loanId);

      if (record && record.status === 'borrowing') {
        if (record.renewCount >= 2) {
          state.warning = 'Phiếu mượn này đã đạt giới hạn gia hạn tối đa (2 lần)!';
          return;
        }

        // Tăng hạn trả thêm 7 ngày
        const parts = record.dueDate.split('/');
        if (parts.length === 3) {
          const currentDue = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          currentDue.setDate(currentDue.getDate() + 7);
          record.dueDate = `${currentDue.getDate().toString().padStart(2, '0')}/${(currentDue.getMonth() + 1).toString().padStart(2, '0')}/${currentDue.getFullYear()}`;
          record.renewCount += 1;

          // Lưu cập nhật vào localStorage
          saveStudentLoansToStorage(record.studentId, state.borrowedIds, state.borrowedRecords || []);
        }
      }
    },

    // Cập nhật cảnh báo
    setWarning: (state, action: PayloadAction<string | null>) => {
      state.warning = action.payload;
    },

    clearWarning: (state) => {
      state.warning = null;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Không thể tải danh sách sách!';
      })
      // Khi ĐĂNG XUẤT: xóa dữ liệu đang mượn khỏi Redux state
      .addCase(logout, (state) => {
        state.borrowedIds = [];
        state.borrowedRecords = [];
        state.warning = null;
      })
      // Khi ĐĂNG NHẬP: nạp dữ liệu mượn của chính sinh viên đó từ localStorage
      .addCase(login, (state, action) => {
        const studentId = action.payload.studentId;
        const loans = loadStudentLoansFromStorage(studentId);
        state.borrowedIds = loans.borrowedIds;
        state.borrowedRecords = loans.borrowedRecords;
        state.warning = null;
      })
      // Khi ĐĂNG NHẬP NHANH tài khoản mẫu: nạp dữ liệu của sinh viên đó
      .addCase(loginDemoAccount, (state, action) => {
        const studentId = action.payload;
        const loans = loadStudentLoansFromStorage(studentId);
        state.borrowedIds = loans.borrowedIds;
        state.borrowedRecords = loans.borrowedRecords;
        state.warning = null;
      })
      // Khi ĐĂNG KÝ MỚI: sinh viên mới chưa từng mượn -> mặc định là 0 cuốn
      .addCase(registerStudent, (state, action) => {
        state.borrowedIds = [];
        state.borrowedRecords = [];
        state.warning = null;
        saveStudentLoansToStorage(action.payload.studentId, [], []);
      });
  },
});

export const {
  syncStudentLoans,
  borrowBook,
  returnBook,
  renewLoan,
  setWarning,
  clearWarning,
  clearError,
} = booksSlice.actions;

export default booksSlice.reducer;
