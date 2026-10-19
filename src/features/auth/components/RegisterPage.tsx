import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { registerStudent, clearAuthError } from '../authSlice';
import { Student } from '../types';

export const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { error } = useAppSelector((state) => state.auth);

  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [faculty, setFaculty] = useState('CNTT');
  const [major, setMajor] = useState('Kỹ thuật Phần mềm');
  const [className, setClassName] = useState('');
  const [academicYear, setAcademicYear] = useState('Khóa 2023 - 2027 (K23)');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId.trim() || !fullName.trim()) return;

    const newStudent: Student = {
      studentId: studentId.trim().toUpperCase(),
      fullName: fullName.trim(),
      faculty,
      major: major.trim() || 'Công nghệ Thông tin',
      className: className.trim() || 'D23-CNTT01',
      academicYear: academicYear.trim(),
      email: email.trim() || `${studentId.trim().toLowerCase()}@university.edu.vn`,
      phone: phone.trim() || '0988 000 000',
      cardStatus: 'active',
      cardExpiryDate: '31/12/2027',
      password: password || '123',
      createdAt: new Date().toISOString(),
    };

    dispatch(registerStudent(newStudent));
    navigate('/stats');
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-icon">📝</span>
          <h1 className="auth-title">Đăng Ký Thẻ Thư Viện</h1>
          <p className="auth-subtitle">
            Cung cấp đầy đủ thông tin sinh viên để quản lý hồ sơ và phiếu mượn sách
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="regStudentId" className="form-label">
                Mã số sinh viên (MSSV) <span className="text-danger">*</span>
              </label>
              <input
                id="regStudentId"
                type="text"
                className="form-input"
                placeholder="VD: B23DCCC040"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="regFullName" className="form-label">
                Họ và tên sinh viên <span className="text-danger">*</span>
              </label>
              <input
                id="regFullName"
                type="text"
                className="form-input"
                placeholder="VD: Nguyễn Văn Đông"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="regFaculty" className="form-label">
                Khoa <span className="text-danger">*</span>
              </label>
              <select
                id="regFaculty"
                className="form-input form-select"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              >
                <option value="CNTT">Khoa Công Nghệ Thông Tin</option>
                <option value="Kinh tế">Khoa Kinh Tế & Quản Trị</option>
                <option value="Ngoại ngữ">Khoa Ngoại Ngữ</option>
                <option value="Khác">Khoa Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="regMajor" className="form-label">
                Chuyên ngành <span className="text-danger">*</span>
              </label>
              <input
                id="regMajor"
                type="text"
                className="form-input"
                placeholder="VD: Kỹ thuật Phần mềm"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="regClass" className="form-label">
                Lớp sinh hoạt
              </label>
              <input
                id="regClass"
                type="text"
                className="form-input"
                placeholder="VD: D23-CNTT01"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="regCourse" className="form-label">
                Khóa học
              </label>
              <input
                id="regCourse"
                type="text"
                className="form-input"
                placeholder="VD: Khóa 2023 - 2027 (K23)"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="regEmail" className="form-label">
                Email gửi thông báo
              </label>
              <input
                id="regEmail"
                type="email"
                className="form-input"
                placeholder="sinhvien@university.edu.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="regPhone" className="form-label">
                Số điện thoại liên hệ
              </label>
              <input
                id="regPhone"
                type="tel"
                className="form-input"
                placeholder="0988 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="regPassword" className="form-label">
              Mật khẩu đăng nhập
            </label>
            <input
              id="regPassword"
              type="password"
              className="form-input"
              placeholder="Nhập mật khẩu (mặc định: 123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            ✨ Tạo thẻ thư viện & Đăng nhập
          </button>
        </form>

        <div className="auth-footer-link">
          Đã có thẻ thư viện?{' '}
          <Link to="/login" className="text-primary font-bold">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
