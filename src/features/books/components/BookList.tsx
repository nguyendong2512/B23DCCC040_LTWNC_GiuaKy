import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchBooks } from '../booksThunks';
import { borrowBook, returnBook, setWarning, clearWarning, clearError } from '../booksSlice';
import { useFilterStore } from '../../filters/filterStore';
import { BookItem } from './BookItem';
import { SearchBar } from '../../filters/components/SearchBar';
import { CategoryFilter } from '../../filters/components/CategoryFilter';
import { Book } from '../types';
import { checkCardEligibility } from '../../auth/cardUtils';

/**
 * Component hiển thị danh sách sách
 * Tối ưu hiệu năng (Buổi 5):
 * - Danh sách sau khi lọc tính bằng useMemo
 * - Các handler mượn/trả truyền xuống bọc bằng useCallback
 * - Key render không dùng index, dùng book.id
 */
export const BookList: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const { items, borrowedIds, status, error, warning } = useAppSelector((state) => state.books);
  const { currentUser } = useAppSelector((state) => state.auth);

  // Zustand state
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const selectedCategory = useFilterStore((state) => state.selectedCategory);

  // State cho Modal xác nhận mượn sách
  const [borrowingModalBook, setBorrowingModalBook] = useState<Book | null>(null);
  const [loanDurationDays, setLoanDurationDays] = useState<number>(14);
  const [borrowNotes, setBorrowNotes] = useState<string>('Sách mới, bìa và các trang nguyên vẹn 100%');

  // Khởi động app: Gọi API giả lập lấy danh sách sách (500ms delay)
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBooks(false));
    }
  }, [dispatch, status]);

  // Handler khi click nút "Mượn sách" trên từng thẻ sách
  const handleBorrow = useCallback(
    (id: string) => {
      // 1. KIỂM TRA ĐĂNG NHẬP VÀ ĐIỀU KIỆN THẺ (KHÔNG BỊ KHÓA, CÒN HẠN SỬ DỤNG)
      const eligibility = checkCardEligibility(currentUser);
      if (!eligibility.canBorrow) {
        dispatch(setWarning(eligibility.reason));
        return;
      }

      // 2. KIỂM TRA NGAY GIỚI HẠN MƯỢN 3 CUỐN KHI CLICK MƯỢN SÁCH
      if (borrowedIds.length >= 3) {
        dispatch(
          setWarning(
            'Bạn đã đạt giới hạn mượn tối đa 3 cuốn sách! Vui lòng trả bớt những cuốn đang mượn trước khi mượn thêm cuốn sách mới.'
          )
        );
        return; // Dừng lại, không mở modal mượn sách
      }

      const book = items.find((b) => b.id === id);
      if (book) {
        setBorrowingModalBook(book);
      } else {
        // Dự phòng nếu không tìm thấy
        dispatch(borrowBook(id));
      }
    },
    [currentUser, borrowedIds.length, items, dispatch]
  );

  // Handler trả sách bọc bằng useCallback
  const handleReturn = useCallback(
    (id: string) => {
      dispatch(returnBook(id));
    },
    [dispatch]
  );

  // Handler tải lại API (thử lại)
  const handleRetry = useCallback(() => {
    dispatch(clearError());
    dispatch(fetchBooks(false));
  }, [dispatch]);

  // Handler giả lập gọi API lỗi (để giáo viên kiểm tra tiêu chí 1)
  const handleSimulateError = useCallback(() => {
    dispatch(fetchBooks(true));
  }, [dispatch]);

  // Tính toán Ngày mượn và Ngày trả sách hiển thị trong Modal
  const { borrowDateStr, dueDateStr } = useMemo(() => {
    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + loanDurationDays);

    const pad = (n: number) => n.toString().padStart(2, '0');

    const borrowDateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const dueDateStr = `${pad(due.getDate())}/${pad(due.getMonth() + 1)}/${due.getFullYear()}`;

    return { borrowDateStr, dueDateStr };
  }, [loanDurationDays]);

  // Xác nhận mượn sách sau khi xem thông báo ngày trả
  const handleConfirmBorrow = () => {
    if (!borrowingModalBook) return;

    dispatch(
      borrowBook({
        bookId: borrowingModalBook.id,
        studentId: currentUser?.studentId || 'B23DCCC040',
        studentName: currentUser?.fullName || 'Nguyễn Văn Đông',
        notesBorrow: borrowNotes,
        dueDate: dueDateStr,
      })
    );

    setBorrowingModalBook(null);
  };

  // Lọc sách theo từ khóa tìm kiếm và thể loại - TÍNH BẰNG useMemo (Buổi 5)
  const filteredBooks = useMemo<Book[]>(() => {
    return items.filter((book) => {
      // 1. Lọc theo thể loại
      const matchesCategory =
        selectedCategory === 'Tất cả' || book.category === selectedCategory;

      // 2. Tìm kiếm theo tên hoặc tác giả (không phân biệt hoa thường)
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        query === '' ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="book-list-container">
      {/* Cảnh báo khi vượt quá 3 cuốn sách (kích hoạt từ Redux middleware) */}
      {warning && (
        <div className="alert-banner alert-warning" role="alert">
          <div className="alert-content">
            <span className="alert-icon">⚠️</span>
            <span className="alert-text">{warning}</span>
          </div>
          <button
            type="button"
            className="alert-close-btn"
            onClick={() => dispatch(clearWarning())}
            aria-label="Đóng cảnh báo"
          >
            ✕
          </button>
        </div>
      )}

      {/* Thông báo lỗi khi API thất bại */}
      {status === 'failed' && error && (
        <div className="alert-banner alert-error" role="alert">
          <div className="alert-content">
            <span className="alert-icon">❌</span>
            <div>
              <strong>Lỗi tải dữ liệu:</strong> {error}
            </div>
          </div>
          <button type="button" className="btn btn-retry" onClick={handleRetry}>
            🔄 Thử lại
          </button>
        </div>
      )}

      {/* Bộ điều khiển lọc và tìm kiếm */}
      <section className="filter-controls-section" aria-label="Bộ điều khiển tìm kiếm và lọc">
        <div className="search-filter-row">
          <SearchBar />
          <div className="api-test-tools">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSimulateError}
              title="Thử nghiệm kịch bản API thất bại theo yêu cầu đề bài"
            >
              🧪 Giả lập lỗi API
            </button>
          </div>
        </div>
        <CategoryFilter />
      </section>

      {/* Trạng thái Đang tải... (500ms delay) */}
      {status === 'loading' && (
        <div className="loading-state" role="status" aria-live="polite">
          <div className="spinner" />
          <p className="loading-text">Đang tải danh sách sách từ thư viện...</p>
        </div>
      )}

      {/* Danh sách sách */}
      {status !== 'loading' && (
        <div className="book-grid-wrapper">
          <div className="book-list-header">
            <h2 className="section-title">
              {selectedCategory === 'Tất cả' ? 'Toàn bộ đầu sách' : `Thể loại: ${selectedCategory}`}
              <span className="result-count"> ({filteredBooks.length} cuốn)</span>
            </h2>
            <div className="borrowed-indicator">
              {currentUser ? (
                <>
                  Sinh viên đang mượn:{' '}
                  <strong className={borrowedIds.length >= 3 ? 'text-danger' : 'text-primary'}>
                    {borrowedIds.length}/3 cuốn
                  </strong>
                </>
              ) : (
                <span className="text-muted">Chưa đăng nhập (0/3 cuốn)</span>
              )}
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📚</span>
              <h3>Không tìm thấy cuốn sách nào phù hợp!</h3>
              <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn thể loại khác.</p>
            </div>
          ) : (
            <div className="book-grid">
              {filteredBooks.map((book) => (
                <BookItem
                  key={book.id} /* Tuyệt đối không dùng index, dùng book.id */
                  book={book}
                  isBorrowed={borrowedIds.includes(book.id)}
                  onBorrow={handleBorrow}
                  onReturn={handleReturn}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL THÔNG BÁO NGÀY TRẢ SÁCH VÀ XÁC NHẬN MƯỢN SÁCH
          ======================================================== */}
      {borrowingModalBook && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-icon">📋</span>
                <div>
                  <h3 className="modal-title">Xác Nhận Lập Phiếu Mượn Sách</h3>
                  <span className="modal-subtitle">Vui lòng kiểm tra ngày trả sách trước khi xác nhận</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setBorrowingModalBook(null)}
                aria-label="Đóng hộp thoại"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Thông tin cuốn sách */}
              <div className="borrow-book-preview">
                <h4 className="preview-book-title">📖 {borrowingModalBook.title}</h4>
                <p className="preview-book-meta">
                  <span>Tác giả: <strong>{borrowingModalBook.author}</strong></span> |{' '}
                  <span>Thể loại: <span className="cat-tag">{borrowingModalBook.category}</span></span> |{' '}
                  <span>Năm xuất bản: {borrowingModalBook.publishedYear}</span>
                </p>
              </div>

              {/* Thông tin sinh viên mượn */}
              <div className="borrow-student-preview">
                <span className="label-sm">Sinh viên mượn:</span>
                <strong className="text-primary">
                  👤 {currentUser ? currentUser.fullName : 'Nguyễn Văn Đông'} (MSSV: {currentUser ? currentUser.studentId : 'B23DCCC040'})
                </strong>
              </div>

              {/* Lựa chọn thời hạn mượn */}
              <div className="duration-select-box">
                <label className="form-label">Chọn thời hạn mượn:</label>
                <div className="duration-chips">
                  {[7, 14, 21, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      className={`duration-chip ${loanDurationDays === days ? 'active' : ''}`}
                      onClick={() => setLoanDurationDays(days)}
                    >
                      {days} ngày {days === 14 ? '(Tiêu chuẩn)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* THÔNG BÁO NGÀY TRẢ SÁCH NỔI BẬT */}
              <div className="due-date-alert-card">
                <div className="due-date-icon">⏰</div>
                <div className="due-date-content">
                  <span className="due-date-label">HẠN TRẢ SÁCH (NGÀY PHẢI TRẢ):</span>
                  <div className="due-date-highlight">{dueDateStr}</div>
                  <span className="due-date-note">
                    📅 Ngày mượn: <strong>{borrowDateStr}</strong> • Thời hạn: <strong>{loanDurationDays} ngày</strong>
                  </span>
                </div>
              </div>

              {/* Ghi chú tình trạng sách */}
              <div className="form-group mt-2">
                <label htmlFor="modalBorrowNotes" className="form-label">
                  Ghi chú tình trạng sách lúc mượn:
                </label>
                <input
                  id="modalBorrowNotes"
                  type="text"
                  className="form-input"
                  value={borrowNotes}
                  onChange={(e) => setBorrowNotes(e.target.value)}
                  placeholder="VD: Sách mới, bìa và trang nguyên vẹn..."
                />
              </div>

              <div className="policy-note-box">
                <span>⚠️ Lưu ý: Mỗi sinh viên mượn tối đa 3 cuốn sách cùng lúc. Bạn có thể gia hạn thêm thời gian mượn trên trang Thống kê.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setBorrowingModalBook(null)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary btn-confirm-borrow"
                onClick={handleConfirmBorrow}
              >
                ✅ Đồng ý & Xác nhận mượn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          HỘP THOẠI CẢNH BÁO: QUÁ GIỚI HẠN / THẺ BỊ KHÓA / THẺ HẾT HẠN
          ======================================================== */}
      {warning && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-warning">
            <div className="modal-header modal-header-warning">
              <div className="modal-title-group">
                <span className="modal-icon">
                  {warning.includes('KHÓA')
                    ? '🔒'
                    : warning.includes('HẾT HẠN')
                    ? '⏰'
                    : warning.includes('đăng nhập')
                    ? '🔑'
                    : '⚠️'}
                </span>
                <div>
                  <h3 className="modal-title text-warning">
                    {warning.includes('KHÓA')
                      ? 'Thẻ Thư Viện Đang Bị Khóa'
                      : warning.includes('HẾT HẠN')
                      ? 'Thẻ Thư Viện Đã Hết Hạn'
                      : warning.includes('đăng nhập')
                      ? 'Yêu Cầu Đăng Nhập Sinh Viên'
                      : 'Đã Đạt Giới Hạn Mượn Sách (3/3 Cuốn)'}
                  </h3>
                  <span className="modal-subtitle">Quy định lưu thông thẻ và mượn/trả thư viện khoa</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => dispatch(clearWarning())}
                aria-label="Đóng cảnh báo"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="warning-notice-box">
                <div className="warning-big-icon">
                  {warning.includes('KHÓA')
                    ? '🔒'
                    : warning.includes('HẾT HẠN')
                    ? '⏰'
                    : warning.includes('đăng nhập')
                    ? '🔑'
                    : '🚫'}
                </div>
                <h4 className="warning-heading">
                  {warning.includes('KHÓA')
                    ? 'Không thể mượn sách do thẻ bị khóa!'
                    : warning.includes('HẾT HẠN')
                    ? 'Không thể mượn sách do thẻ đã hết hạn!'
                    : warning.includes('đăng nhập')
                    ? 'Chưa xác thực độc giả!'
                    : 'Không thể mượn thêm sách!'}
                </h4>
                <p className="warning-main-message">{warning}</p>
                <p className="warning-sub-message">
                  {warning.includes('KHÓA')
                    ? 'Thẻ thư viện ở trạng thái bị khóa sẽ tạm dừng toàn bộ quyền mượn tài liệu. Vui lòng kiểm tra lại trạng thái thẻ tại trang Hồ sơ Thư viện.'
                    : warning.includes('HẾT HẠN')
                    ? 'Thẻ thư viện đã quá thời hạn sử dụng. Bạn có thể gia hạn thẻ tại trang Thống kê Thư viện.'
                    : warning.includes('đăng nhập')
                    ? 'Bạn cần đăng nhập bằng mã sinh viên để hệ thống ghi nhận hồ sơ và lưu phiếu mượn tương ứng cho bạn.'
                    : 'Hiện tại bạn đã mượn tối đa 3 cuốn sách. Vui lòng hoàn trả các cuốn sách đang mượn trước khi thực hiện mượn cuốn mới.'}
                </p>
              </div>

              <div className="policy-note-box mt-2">
                <span>
                  💡 <strong>Gợi ý:</strong>{' '}
                  {warning.includes('KHÓA') || warning.includes('HẾT HẠN')
                    ? 'Bạn có thể vào trang Thống kê Thư viện để quản lý, mở khóa hoặc gia hạn thẻ độc giả.'
                    : warning.includes('đăng nhập')
                    ? 'Bạn có thể sử dụng các tài khoản sinh viên mẫu (Nguyễn Văn Đông, Trần Thị Mai) để thử nghiệm nhanh.'
                    : 'Bạn có thể kiểm tra danh sách sách đang mượn và thực hiện trả sách tại trang Thống kê Thư viện.'}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => dispatch(clearWarning())}
              >
                Đóng lại
              </button>
              {warning.includes('đăng nhập') ? (
                <Link
                  to="/login"
                  className="btn btn-primary"
                  onClick={() => dispatch(clearWarning())}
                >
                  🔑 Đến trang Đăng nhập ngay
                </Link>
              ) : (
                <Link
                  to="/stats"
                  className="btn btn-primary"
                  onClick={() => dispatch(clearWarning())}
                >
                  {warning.includes('KHÓA') || warning.includes('HẾT HẠN')
                    ? '🏛️ Xem hồ sơ & Quản lý thẻ'
                    : '📊 Xem sách đang mượn để trả'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
