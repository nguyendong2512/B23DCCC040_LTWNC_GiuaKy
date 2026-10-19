import { LibraryCardStatus, Student } from './types';

/**
 * Kiểm tra ngày hết hạn của thẻ thư viện (định dạng DD/MM/YYYY)
 * @param cardExpiryDate Chuỗi ngày hết hạn (ví dụ '31/12/2027')
 * @returns true nếu thẻ đã hết hạn, false nếu thẻ còn hạn
 */
export const isCardExpired = (cardExpiryDate?: string): boolean => {
  if (!cardExpiryDate || !cardExpiryDate.trim()) return false;

  const parts = cardExpiryDate.trim().split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;

    // Đặt thời gian cuối ngày hết hạn 23:59:59
    const expiry = new Date(year, month, day, 23, 59, 59);
    return expiry.getTime() < Date.now();
  }

  return false;
};

/**
 * Kiểm tra tính hợp lệ của thẻ thư viện sinh viên để mượn sách
 * @param student Thông tin sinh viên
 * @returns { canBorrow: boolean, reason: string | null }
 */
export const checkCardEligibility = (
  student?: Student | null
): { canBorrow: boolean; reason: string | null; type: 'locked' | 'expired' | 'unauthenticated' | null } => {
  if (!student) {
    return {
      canBorrow: false,
      reason: 'Vui lòng đăng nhập tài khoản sinh viên trước khi thực hiện mượn sách!',
      type: 'unauthenticated',
    };
  }

  if (student.cardStatus === 'locked') {
    return {
      canBorrow: false,
      reason: 'Thẻ thư viện của bạn hiện đang bị KHÓA! Vui lòng liên hệ thủ thư thư viện để kiểm tra và mở khóa thẻ trước khi mượn sách.',
      type: 'locked',
    };
  }

  if (isCardExpired(student.cardExpiryDate)) {
    return {
      canBorrow: false,
      reason: `Thẻ thư viện của bạn đã HẾT HẠN sử dụng (${student.cardExpiryDate || 'Đã hết hạn'})! Vui lòng liên hệ thủ thư để gia hạn thẻ độc giả trước khi mượn sách.`,
      type: 'expired',
    };
  }

  return { canBorrow: true, reason: null, type: null };
};
