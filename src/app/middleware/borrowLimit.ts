import { Middleware } from '@reduxjs/toolkit';
import { borrowBook, setWarning } from '../../features/books/booksSlice';
import { isCardExpired } from '../../features/auth/cardUtils';

export const borrowLimitMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  if (action?.type === borrowBook.type) {
    const state = storeApi.getState();
    const currentUser = state.auth?.currentUser;

    if (currentUser && currentUser.cardStatus === 'locked') {
      storeApi.dispatch(
        setWarning(
          'Thẻ thư viện của bạn hiện đang bị KHÓA! Vui lòng liên hệ thủ thư thư viện để kiểm tra và mở khóa thẻ trước khi mượn sách.'
        )
      );
      return;
    }

    if (currentUser && currentUser.cardExpiryDate && isCardExpired(currentUser.cardExpiryDate)) {
      storeApi.dispatch(
        setWarning(
          `Thẻ thư viện của bạn đã HẾT HẠN sử dụng (${currentUser.cardExpiryDate})! Vui lòng liên hệ thủ thư để gia hạn thẻ độc giả trước khi mượn sách.`
        )
      );
      return;
    }

    const currentBorrowedCount = state.books?.borrowedIds?.length ?? 0;
    if (currentBorrowedCount >= 3) {
      storeApi.dispatch(
        setWarning('Mỗi sinh viên chỉ được mượn tối đa 3 cuốn cùng lúc! Bạn cần trả bớt sách để mượn cuốn tiếp theo.')
      );
      return;
    }
  }

  return next(action);
};


