import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { returnBook, renewLoan } from '../books/booksSlice';
import { BookCategory, CategoryStats } from '../books/types';
import { isCardExpired } from '../auth/cardUtils';
import {
  updateCardStatus,
  toggleCardLock,
  renewCard,
  setCardExpiredDemo,
} from '../auth/authSlice';

/**
 * Trang Thống kê Thư viện & Quản lý Phiếu Mượn Chi Tiết (Route /stats)
 * - Thông tin sinh viên (Lớp, Khoa, Ngành, Khóa, SĐT, Email, Trạng thái thẻ, Hạn thẻ)
 * - Thông tin phiếu mượn (Mã phiếu, Sinh viên & Sách, Ngày mượn, Hạn trả, Ngày trả, Trạng thái, Gia hạn, Ghi chú tình trạng)
 */
const StatsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, borrowedIds, borrowedRecords } = useAppSelector((state) => state.books);
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.auth);

  // Modal trả sách kèm ghi chú tình trạng lúc trả
  const [returningLoanId, setReturningLoanId] = useState<string | null>(null);
  const [returnNotes, setReturnNotes] = useState<string>('Sách hoàn trả nguyên vẹn, không hư hỏng');

  // Tính toán trạng thái thẻ thư viện
  const isLocked = currentUser?.cardStatus === 'locked';
  const isExpired = currentUser?.cardExpiryDate
    ? isCardExpired(currentUser.cardExpiryDate)
    : false;
  const isActive = !isLocked && !isExpired;

  // Thống kê số đầu sách theo từng thể loại
  const categoryStats = useMemo<CategoryStats>(() => {
    const stats: CategoryStats = {
      'CNTT': 0,
      'Kinh tế': 0,
      'Ngoại ngữ': 0,
    };

    items.forEach((book) => {
      if (stats[book.category] !== undefined) {
        stats[book.category] += 1;
      }
    });

    return stats;
  }, [items]);

  const totalCopiesCount = useMemo(() => {
    return items.reduce((sum, book) => sum + book.totalCopies, 0);
  }, [items]);

  const availableCopiesCount = useMemo(() => {
    return items.reduce((sum, book) => sum + book.availableCopies, 0);
  }, [items]);

  const categoriesList: BookCategory[] = ['CNTT', 'Kinh tế', 'Ngoại ngữ'];

  // Lọc danh sách phiếu mượn thuộc về chính sinh viên đang đăng nhập
  const currentStudentRecords = useMemo(() => {
    if (!isAuthenticated || !currentUser) return [];
    return (borrowedRecords || []).filter(
      (r) => r.studentId.trim().toUpperCase() === currentUser.studentId.trim().toUpperCase()
    );
  }, [isAuthenticated, currentUser, borrowedRecords]);

  // Xử lý hoàn tất trả sách có ghi chú
  const handleConfirmReturn = (bookId: string) => {
    dispatch(
      returnBook({
        bookId,
        notesReturn: returnNotes || 'Đã hoàn trả sách, tình trạng tốt',
      })
    );
    setReturningLoanId(null);
  };

  return (
    <div className="stats-page-container">
      <div className="stats-header">
        <div>
          <h1 className="stats-title">📊 Quản Lý Phiếu Mượn & Thống Kê Thư Viện</h1>
          <p className="stats-subtitle">
            Hồ sơ thẻ thư viện sinh viên, chi tiết các lượt mượn/trả và tình trạng sách lưu thông
          </p>
        </div>
        <Link to="/" className="btn btn-outline">
          ← Quay lại Tra cứu sách
        </Link>
      </div>

      {/* ========================================================
          THÔNG TIN SINH VIÊN & THẺ THƯ VIỆN
          ======================================================== */}
      <section className="student-card-section" aria-labelledby="student-card-heading">
        <div className="library-card-wrapper">
          <div className="library-card-header">
            <div className="library-brand">
              <span className="library-logo">🏛️</span>
              <div>
                <h3 className="card-univ-title">THƯ VIỆN ĐẠI HỌC — KHOA CHUYÊN NGÀNH</h3>
                <span className="card-type-label">THẺ ĐỘC GIẢ SINH VIÊN</span>
              </div>
            </div>
            {isAuthenticated && currentUser ? (
              <div className="card-status-badge">
                {isLocked ? (
                  <span className="status-pill status-locked" title="Thẻ đang bị khóa - Không thể mượn sách">
                    ● Thẻ bị khóa
                  </span>
                ) : isExpired ? (
                  <span className="status-pill status-expired" title="Thẻ đã quá hạn sử dụng - Không thể mượn sách">
                    ● Thẻ đã hết hạn
                  </span>
                ) : (
                  <span className="status-pill status-active" title="Thẻ đang hoạt động bình thường">
                    ● Thẻ đang hoạt động
                  </span>
                )}
                <span className="card-expiry-text">
                  Hạn thẻ: <strong>{currentUser.cardExpiryDate || '31/12/2027'}</strong>
                </span>
              </div>
            ) : (
              <span className="status-pill status-offline">○ Chưa đăng nhập</span>
            )}
          </div>

          {/* Cảnh báo trạng thái thẻ nếu bị khóa hoặc hết hạn */}
          {isAuthenticated && currentUser && isLocked && (
            <div className="card-warning-alert card-warning-locked">
              <span>🚫 <strong>Cảnh báo:</strong> Thẻ thư viện của bạn hiện đang bị KHÓA. Bạn sẽ không thể mượn sách cho đến khi thẻ được mở khóa!</span>
            </div>
          )}
          {isAuthenticated && currentUser && !isLocked && isExpired && (
            <div className="card-warning-alert card-warning-expired">
              <span>⏰ <strong>Cảnh báo:</strong> Thẻ thư viện đã HẾT HẠN sử dụng ({currentUser.cardExpiryDate}). Bạn không thể mượn sách, vui lòng gia hạn thẻ!</span>
            </div>
          )}

          {isAuthenticated && currentUser ? (
            <div className="library-card-body">
              <div className="student-photo-box">
                <div className="photo-placeholder">
                  <span>🎓</span>
                </div>
                <span className="photo-caption">MSSV: {currentUser.studentId}</span>
              </div>

              <div className="student-data-columns">
                <div className="data-row-highlight">
                  <span className="data-label">Họ và tên:</span>
                  <span className="data-val student-fullname">{currentUser.fullName}</span>
                </div>

                <div className="data-grid-2col">
                  <div className="data-item">
                    <span className="data-label">Mã sinh viên (MSSV):</span>
                    <strong className="data-val">{currentUser.studentId}</strong>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Lớp sinh hoạt:</span>
                    <strong className="data-val">{currentUser.className || 'D23-CNTT01'}</strong>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Khoa:</span>
                    <strong className="data-val">{currentUser.faculty}</strong>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Chuyên ngành:</span>
                    <strong className="data-val">{currentUser.major || 'Công nghệ Thông tin'}</strong>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Khóa học:</span>
                    <strong className="data-val">{currentUser.academicYear || 'Khóa 2023 - 2027'}</strong>
                  </div>
                  <div className="data-item">
                    <span className="data-label">Số điện thoại:</span>
                    <strong className="data-val">{currentUser.phone || '0988 123 456'}</strong>
                  </div>
                  <div className="data-item data-item-full">
                    <span className="data-label">Email gửi thông báo mượn/trả:</span>
                    <strong className="data-val text-primary">{currentUser.email}</strong>
                  </div>
                </div>

                {/* Thanh công cụ quản lý & thử nghiệm trạng thái thẻ độc giả */}
                <div className="card-tools-bar">
                  <span className="card-tools-title">⚙️ Quản lý trạng thái thẻ (Kiểm thử nghiệp vụ):</span>
                  <div className="card-tools-actions">
                    <button
                      type="button"
                      className={`btn-card-tool ${isActive ? 'active' : ''}`}
                      onClick={() =>
                        dispatch(updateCardStatus({ status: 'active', expiryDate: '31/12/2027' }))
                      }
                      title="Đặt thẻ về trạng thái Đang hoạt động bình thường"
                    >
                      🟢 Kích hoạt: Đang hoạt động
                    </button>
                    <button
                      type="button"
                      className={`btn-card-tool ${isLocked ? 'active' : ''}`}
                      onClick={() => dispatch(toggleCardLock())}
                      title="Chuyển đổi Khóa / Mở khóa thẻ để kiểm tra mượn sách"
                    >
                      {isLocked ? '🔓 Mở khóa thẻ' : '🔒 Khóa thẻ thử nghiệm'}
                    </button>
                    <button
                      type="button"
                      className={`btn-card-tool ${isExpired ? 'active' : ''}`}
                      onClick={() => dispatch(setCardExpiredDemo())}
                      title="Giả lập ngày hết hạn 01/01/2024 để kiểm tra chặn mượn sách"
                    >
                      ⏰ Giả lập hết hạn thẻ (2024)
                    </button>
                    <button
                      type="button"
                      className="btn-card-tool"
                      onClick={() => dispatch(renewCard())}
                      title="Gia hạn thẻ độc giả đến 31/12/2028"
                    >
                      🔄 Gia hạn thẻ (2028)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="guest-prompt-box">
              <p>Bạn chưa đăng nhập. Hãy đăng nhập để thẻ thư viện hiển thị đầy đủ thông tin sinh viên.</p>
              <Link to="/login" className="btn btn-primary btn-sm mt-2">
                🔑 Đăng nhập / Đăng ký ngay
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          THỐNG KÊ TỔNG QUAN
          ======================================================== */}
      <div className="stats-summary-grid">
        <div className="stat-card">
          <div className="stat-card-icon">📚</div>
          <div className="stat-card-content">
            <span className="stat-label">Tổng đầu sách</span>
            <span className="stat-value">{items.length}</span>
            <span className="stat-sub">{totalCopiesCount} bản sách lưu kho</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-content">
            <span className="stat-label">Bản sách sẵn có</span>
            <span className="stat-value text-success">{availableCopiesCount}</span>
            <span className="stat-sub">Sẵn sàng phục vụ sinh viên</span>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-card-icon">📖</div>
          <div className="stat-card-content">
            <span className="stat-label">Sách bạn đang mượn</span>
            <span className="stat-value text-primary">
              {isAuthenticated && currentUser ? `${borrowedIds.length} / 3` : '0 / 3'}
            </span>
            <span className="stat-sub">
              {isAuthenticated && currentUser
                ? borrowedIds.length >= 3
                  ? 'Đã đạt giới hạn 3 cuốn tối đa'
                  : `Còn được mượn thêm ${3 - borrowedIds.length} cuốn`
                : 'Chưa đăng nhập tài khoản sinh viên'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          CHI TIẾT PHIẾU MƯỢN SÁCH CỦA SINH VIÊN
          ======================================================== */}
      <section className="card-box loan-records-section" aria-labelledby="loan-records-heading">
        <div className="section-header-row">
          <h2 id="loan-records-heading" className="section-heading-custom">
            📑 Danh Sách Phiếu Mượn Sách Chi Tiết ({currentStudentRecords.length})
          </h2>
          <span className="loan-hint-badge">Mỗi sinh viên mượn tối đa 3 cuốn cùng lúc</span>
        </div>

        {!isAuthenticated || !currentUser ? (
          <div className="empty-borrowed-notice">
            <span className="notice-icon">🔒</span>
            <p>Vui lòng đăng nhập để xem thông tin phiếu mượn sách của bạn.</p>
            <Link to="/login" className="btn btn-primary btn-sm mt-2">
              🔑 Đăng nhập ngay
            </Link>
          </div>
        ) : currentStudentRecords.length === 0 ? (
          <div className="empty-borrowed-notice">
            <span className="notice-icon">✨</span>
            <p>
              Sinh viên <strong>{currentUser.fullName}</strong> ({currentUser.studentId}) chưa có phiếu mượn sách nào (Đang mượn: 0/3).
            </p>
            <Link to="/" className="btn btn-primary btn-sm mt-2">
              Tìm và mượn sách ngay
            </Link>
          </div>
        ) : (
          <div className="loan-cards-list">
            {currentStudentRecords.map((record) => {
              const isBorrowing = record.status === 'borrowing';
              const isOverdue = record.status === 'overdue';

              return (
                <div
                  key={record.loanId}
                  className={`loan-card ${isBorrowing ? 'loan-borrowing' : 'loan-returned'}`}
                >
                  <div className="loan-card-top">
                    <div className="loan-id-tag">
                      <span className="label-code">Mã phiếu:</span>
                      <strong className="code-value">{record.loanId}</strong>
                    </div>

                    <div className="loan-status-tag">
                      {isBorrowing && (
                        <span className="badge badge-loan-borrowing">⏳ Đang mượn</span>
                      )}
                      {record.status === 'returned' && (
                        <span className="badge badge-loan-returned">✅ Đã trả</span>
                      )}
                      {isOverdue && (
                        <span className="badge badge-loan-overdue">⚠️ Quá hạn</span>
                      )}
                    </div>
                  </div>

                  <div className="loan-main-info">
                    <h3 className="loan-book-title">
                      📖 {record.bookTitle}{' '}
                      <small className="book-id-text">({record.bookId})</small>
                    </h3>

                    <div className="loan-student-info">
                      <span>
                        👤 Người mượn:{' '}
                        <strong>{record.studentName}</strong> (MSSV:{' '}
                        <code>{record.studentId}</code>)
                      </span>
                    </div>

                    <div className="loan-dates-grid">
                      <div className="date-box">
                        <span className="date-label">📅 Ngày mượn:</span>
                        <strong className="date-val">{record.borrowDate}</strong>
                      </div>
                      <div className="date-box">
                        <span className="date-label">⏰ Hạn trả:</span>
                        <strong className="date-val text-warning">{record.dueDate}</strong>
                      </div>
                      <div className="date-box">
                        <span className="date-label">📥 Ngày trả thực tế:</span>
                        <strong className="date-val">
                          {record.returnDate ? record.returnDate : 'Chưa trả'}
                        </strong>
                      </div>
                      <div className="date-box">
                        <span className="date-label">🔄 Đã gia hạn:</span>
                        <strong className="date-val">{record.renewCount} / 2 lần</strong>
                      </div>
                    </div>

                    <div className="loan-notes-grid">
                      <div className="note-item">
                        <span className="note-title">🔍 Tình trạng lúc mượn:</span>
                        <p className="note-text">{record.notesBorrow || 'Bìa và trang sách nguyên vẹn'}</p>
                      </div>
                      <div className="note-item">
                        <span className="note-title">📝 Tình trạng lúc trả:</span>
                        <p className="note-text">
                          {record.notesReturn || (isBorrowing ? 'Chờ hoàn trả để kiểm tra...' : 'Hoàn trả đầy đủ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hành động phiếu mượn */}
                  <div className="loan-actions-bar">
                    {isBorrowing && (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => dispatch(renewLoan(record.loanId))}
                          disabled={record.renewCount >= 2}
                          title={
                            record.renewCount >= 2
                              ? 'Đã đạt tối đa 2 lần gia hạn'
                              : 'Gia hạn thêm 7 ngày vào hạn trả'
                          }
                        >
                          ➕ Gia hạn (+7 ngày)
                        </button>

                        <button
                          type="button"
                          className="btn btn-return btn-sm"
                          onClick={() => setReturningLoanId(record.loanId)}
                        >
                          🔄 Trả sách này
                        </button>
                      </>
                    )}

                    {record.status === 'returned' && (
                      <span className="text-success font-medium text-sm">
                        ✨ Phiếu mượn đã hoàn tất lưu chuyển
                      </span>
                    )}
                  </div>

                  {/* Form pop-up xác nhận trả sách kèm ghi chú */}
                  {returningLoanId === record.loanId && (
                    <div className="return-modal-inline">
                      <h4>Xác nhận trả sách: {record.bookTitle}</h4>
                      <label className="form-label mt-1">
                        Ghi chú tình trạng sách lúc trả (rách, mất trang, nguyên vẹn...):
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        placeholder="VD: Sách nguyên vẹn / Rách nhẹ trang 20..."
                      />
                      <div className="modal-actions mt-2">
                        <button
                          type="button"
                          className="btn btn-return btn-sm"
                          onClick={() => handleConfirmReturn(record.bookId)}
                        >
                          ✅ Xác nhận trả sách
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setReturningLoanId(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          PHÂN BỔ SÁCH THEO THỂ LOẠI
          ======================================================== */}
      <section className="card-box" aria-labelledby="cat-stats-heading">
        <h2 id="cat-stats-heading" className="section-heading">
          🏷️ Số đầu sách theo từng thể loại
        </h2>
        <div className="category-bars-list">
          {categoriesList.map((cat) => {
            const count = categoryStats[cat];
            const percentage = items.length > 0 ? Math.round((count / items.length) * 100) : 0;

            return (
              <div key={cat} className="category-bar-item">
                <div className="cat-bar-header">
                  <span className="cat-title font-medium">{cat}</span>
                  <span className="cat-metric">
                    <strong>{count}</strong> đầu sách ({percentage}%)
                  </span>
                </div>
                <div className="progress-track" aria-hidden="true">
                  <div
                    className={`progress-fill fill-${cat.toLowerCase().replace(/[^a-z]/g, '')}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default StatsPage;
