import React, { lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookList } from './features/books/components/BookList';
import { ThemeToggle } from './features/theme/ThemeToggle';
import { LoginPage } from './features/auth/components/LoginPage';
import { RegisterPage } from './features/auth/components/RegisterPage';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { logout } from './features/auth/authSlice';
import './App.css';

// Lazy load trang Thống kê bằng React.lazy (Buổi 5: Tối ưu hiệu năng)
const StatsPage = lazy(() => import('./features/stats/StatsPage'));

export const App: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const borrowedCount = useAppSelector((state) => state.books.borrowedIds.length);
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="app-layout">
      {/* Header Điều hướng & Thanh công cụ */}
      <header className="app-header">
        <div className="header-container">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">🏛️</span>
            <div className="brand-text">
              <span className="brand-title">Mini Library</span>
              <span className="brand-subtitle">Hệ thống Quản lý Thư viện Khoa</span>
            </div>
          </Link>

          <nav className="main-navigation" aria-label="Điều hướng chính">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              📚 Tra cứu & Mượn sách
            </Link>

            <Link
              to="/stats"
              className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}
            >
              📊 Thống kê Thư viện
            </Link>
          </nav>

          <div className="header-actions">
            {/* Hiển thị số sách đang mượn - Tự động ẩn đi khi chưa đăng nhập hoặc sau khi đăng xuất */}
            {isAuthenticated && currentUser && (
              <Link
                to="/stats"
                className={`borrowed-pill ${borrowedCount >= 3 ? 'limit-reached' : ''}`}
                title="Xem danh sách sách đang mượn trên trang Thống kê"
              >
                <span className="pill-icon">🔖</span>
                <span className="pill-text">Đang mượn:</span>
                <strong className="pill-badge">{borrowedCount}/3</strong>
              </Link>
            )}

            {/* Thông tin sinh viên & Đăng nhập/Đăng xuất */}
            {isAuthenticated && currentUser ? (
              <div className="student-header-badge">
                <div className="student-avatar-circle">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="student-header-meta">
                  <span className="student-name">{currentUser.fullName}</span>
                  <span className="student-id">{currentUser.studentId}</span>
                </div>
                <button
                  type="button"
                  className="btn-logout"
                  onClick={() => dispatch(logout())}
                  title="Đăng xuất khỏi hệ thống thư viện"
                >
                  🚪
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm">
                🔑 Đăng nhập
              </Link>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Nội dung chính với Routing và Suspense */}
      <main className="app-main">
        <div className="main-container">
          <Suspense
            fallback={
              <div className="lazy-loading-fallback" role="status">
                <div className="spinner" />
                <p>Đang nạp dữ liệu thống kê (React.lazy)...</p>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* Fallback cho các route khác */}
              <Route path="*" element={<BookList />} />
            </Routes>
          </Suspense>
        </div>
      </main>


    </div>
  );
};

export default App;
