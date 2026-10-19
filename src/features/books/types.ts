// Thể loại sách theo yêu cầu đề bài
export type BookCategory = 'CNTT' | 'Kinh tế' | 'Ngoại ngữ';

// Kiểu thể loại dùng cho bộ lọc
export type CategoryFilterType = BookCategory | 'Tất cả';

// Interface cuốn sách
export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  publishedYear: number;
  availableCopies: number;
  totalCopies: number;
  description?: string;
  isbn?: string;
}

// =======================================================
// Các Utility Types (Buổi 1: TypeScript nâng cao - Dùng > 2)
// =======================================================
export type BookSummary = Pick<Book, 'id' | 'title' | 'author' | 'category'>;
export type NewBookPayload = Omit<Book, 'id' | 'availableCopies'>;
export type CategoryStats = Record<BookCategory, number>;
export type ReadonlyBook = Readonly<Book>;
export type BookFilterCriteria = Partial<Pick<Book, 'title' | 'author' | 'category'>>;

// =======================================================
// Trạng thái phiếu mượn sách
// =======================================================
export type LoanStatus = 'borrowing' | 'returned' | 'overdue';

// Thông tin chi tiết của mỗi lượt mượn (Phiếu mượn)
export interface BorrowRecord {
  loanId: string;               // Mã phiếu mượn (VD: PM-2024-001)
  studentId: string;            // Mã sinh viên mượn
  studentName: string;          // Họ tên sinh viên
  bookId: string;               // Mã cuốn sách
  bookTitle: string;            // Tên cuốn sách
  borrowDate: string;           // Ngày mượn (DD/MM/YYYY)
  dueDate: string;              // Hạn trả (DD/MM/YYYY)
  returnDate?: string | null;   // Ngày trả thực tế (DD/MM/YYYY)
  status: LoanStatus;           // Trạng thái: đang mượn, đã trả, quá hạn
  renewCount: number;           // Số lần đã gia hạn
  notesBorrow: string;          // Ghi chú tình trạng sách lúc mượn (bìa, trang sách...)
  notesReturn?: string;         // Ghi chú tình trạng sách lúc trả (rách, mất trang...)
}

// Redux State cho feature books
export interface BooksState {
  items: Book[];
  borrowedIds: string[];
  borrowedRecords?: BorrowRecord[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  warning: string | null;
}
