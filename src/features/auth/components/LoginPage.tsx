import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { login, loginDemoAccount, clearAuthError } from '../authSlice';

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { error, isAuthenticated, currentUser, registeredStudents } = useAppSelector(
    (state) => state.auth
  );

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    dispatch(login({ studentId: studentId.trim(), password }));
  };

  const handleDemoLogin = (demoStudentId: string) => {
    dispatch(loginDemoAccount(demoStudentId));
  };

  // Nếu đã đăng nhập thành công
  if (isAuthenticated && currentUser) {
    return (
      <div className="auth-card-container">
        <div className="auth-card">
          <div className="auth-success-icon">✅</div>
          <h2>Đã đăng nhập thành công!</h2>
          <div className="student-profile-badge">
            <p><strong>Họ và tên:</strong> {currentUser.fullName}</p>
            <p><strong>Mã sinh viên:</strong> {currentUser.studentId}</p>
            <p><strong>Khoa:</strong> {currentUser.faculty}</p>
            {currentUser.className && <p><strong>Lớp:</strong> {currentUser.className}</p>}
          </div>
          <div className="auth-actions-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              📚 Tiếp tục tra cứu & mượn sách
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/stats')}
            >
              📊 Xem sách đang mượn
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">🎓</span>
          <h1 className="auth-title">Đăng Nhập Thư Viện</h1>
          <p className="auth-subtitle">
            Nhập Mã số sinh viên để hệ thống ghi nhận thông tin khi mượn sách
          </p>
        </div>

        {error && (
          <div className="alert-banner alert-error" role="alert">
            <div className="alert-content">
              <span>❌</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="alert-close-btn"
              onClick={() => dispatch(clearAuthError())}
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="studentId" className="form-label">
              Mã số sinh viên (MSSV) <span className="text-danger">*</span>
            </label>
            <input
              id="studentId"
              type="text"
              className="form-input"
              placeholder="Ví dụ: SV2024001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Mặc định: 123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            🔑 Đăng nhập
          </button>
        </form>

        {/* Đăng nhập nhanh với tài khoản sinh viên mẫu */}
        <div className="demo-accounts-section">
          <p className="demo-title">⚡ Đăng nhập nhanh tài khoản sinh viên mẫu:</p>
          <div className="demo-buttons">
            {registeredStudents.slice(0, 2).map((st) => (
              <button
                key={st.studentId}
                type="button"
                className="btn btn-outline btn-sm demo-btn"
                onClick={() => handleDemoLogin(st.studentId)}
              >
                <span>👤 {st.fullName}</span>
                <small>({st.studentId} - {st.faculty})</small>
              </button>
            ))}
          </div>
        </div>

        <div className="auth-footer-link">
          Chưa có thẻ sinh viên trong hệ thống?{' '}
          <Link to="/register" className="text-primary font-bold">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};
