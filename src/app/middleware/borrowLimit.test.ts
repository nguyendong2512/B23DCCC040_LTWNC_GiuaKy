import { configureStore } from '@reduxjs/toolkit';
import booksReducer, { borrowBook } from '../../features/books/booksSlice';
import { borrowLimitMiddleware } from './borrowLimit';
import { Book } from '../../features/books/types';

const mockBooks: Book[] = [
  { id: '1', title: 'Sách 1', author: 'TG 1', category: 'CNTT', publishedYear: 2021, availableCopies: 5, totalCopies: 5 },
  { id: '2', title: 'Sách 2', author: 'TG 2', category: 'CNTT', publishedYear: 2021, availableCopies: 5, totalCopies: 5 },
  { id: '3', title: 'Sách 3', author: 'TG 3', category: 'CNTT', publishedYear: 2021, availableCopies: 5, totalCopies: 5 },
  { id: '4', title: 'Sách 4', author: 'TG 4', category: 'CNTT', publishedYear: 2021, availableCopies: 5, totalCopies: 5 },
];

describe('borrowLimitMiddleware (Kiểm thử Redux Middleware)', () => {
  it('cho phép mượn tối đa 3 cuốn sách và chặn khi mượn cuốn thứ 4 kèm cảnh báo', () => {
    const testStore = configureStore({
      reducer: { books: booksReducer },
      middleware: (getDefault) => getDefault().concat(borrowLimitMiddleware),
      preloadedState: {
        books: {
          items: mockBooks,
          borrowedIds: ['1', '2'], // Đã mượn 2 cuốn
          status: 'succeeded' as const,
          error: null,
          warning: null,
        },
      },
    });

    // Mượn cuốn thứ 3 -> thành công
    testStore.dispatch(borrowBook('3'));
    let state = testStore.getState().books;
    expect(state.borrowedIds).toHaveLength(3);
    expect(state.borrowedIds).toContain('3');
    expect(state.warning).toBeNull();

    // Mượn cuốn thứ 4 -> Middleware PHẢI CHẶN và SET WARNING
    testStore.dispatch(borrowBook('4'));
    state = testStore.getState().books;
    expect(state.borrowedIds).toHaveLength(3); // Vẫn chỉ là 3 cuốn
    expect(state.borrowedIds).not.toContain('4'); // Cuốn thứ 4 không được thêm vào
    expect(state.warning).toMatch(/Mỗi sinh viên chỉ được mượn tối đa 3 cuốn/);
  });
});
