import booksReducer, {
  borrowBook,
  returnBook,
  setWarning,
  clearWarning,
  initialBooksState,
} from './booksSlice';
import { fetchBooks } from './booksThunks';
import { Book, BooksState } from './types';

const sampleBooks: Book[] = [
  {
    id: 'b-1',
    title: 'React TypeScript',
    author: 'Nguyễn Văn A',
    category: 'CNTT',
    publishedYear: 2023,
    availableCopies: 2,
    totalCopies: 3,
  },
  {
    id: 'b-2',
    title: 'Kinh Tế Vi Mô',
    author: 'Trần Văn B',
    category: 'Kinh tế',
    publishedYear: 2022,
    availableCopies: 0,
    totalCopies: 2,
  },
];

describe('booksSlice reducer tests (Kiểm thử Redux Slice)', () => {
  // Test 1: Khởi tạo state ban đầu
  it('1. Trả về initial state khi truyền action không xác định', () => {
    expect(booksReducer(undefined, { type: 'unknown_action' })).toEqual(initialBooksState);
  });

  // Test 2: fetchBooks.pending
  it('2. Xử lý đúng fetchBooks.pending (loading: true, error: null)', () => {
    const prevState: BooksState = {
      ...initialBooksState,
      status: 'idle',
      error: 'Lỗi cũ',
    };
    const action = { type: fetchBooks.pending.type };
    const state = booksReducer(prevState, action);

    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  // Test 3: fetchBooks.fulfilled
  it('3. Xử lý đúng fetchBooks.fulfilled (succeeded, nạp danh sách sách)', () => {
    const prevState: BooksState = {
      ...initialBooksState,
      status: 'loading',
    };
    const action = {
      type: fetchBooks.fulfilled.type,
      payload: sampleBooks,
    };
    const state = booksReducer(prevState, action);

    expect(state.status).toBe('succeeded');
    expect(state.items).toHaveLength(2);
    expect(state.items[0].title).toBe('React TypeScript');
  });

  // Test 4: fetchBooks.rejected
  it('4. Xử lý đúng fetchBooks.rejected (failed, lưu thông báo lỗi)', () => {
    const prevState: BooksState = {
      ...initialBooksState,
      status: 'loading',
    };
    const action = {
      type: fetchBooks.rejected.type,
      payload: 'Lỗi kết nối máy chủ',
    };
    const state = booksReducer(prevState, action);

    expect(state.status).toBe('failed');
    expect(state.error).toBe('Lỗi kết nối máy chủ');
  });

  // Test 5: borrowBook
  it('5. Giảm availableCopies đi 1 và thêm id vào borrowedIds khi mượn sách thành công', () => {
    const prevState: BooksState = {
      ...initialBooksState,
      items: [
        {
          id: 'b-1',
          title: 'React TypeScript',
          author: 'Nguyễn Văn A',
          category: 'CNTT',
          publishedYear: 2023,
          availableCopies: 2,
          totalCopies: 3,
        },
      ],
      borrowedIds: [],
    };

    const nextState = booksReducer(prevState, borrowBook('b-1'));
    expect(nextState.items[0].availableCopies).toBe(1);
    expect(nextState.borrowedIds).toContain('b-1');
  });

  // Test 6: returnBook
  it('6. Tăng availableCopies lên 1 và xoá id khỏi borrowedIds khi trả sách', () => {
    const prevState: BooksState = {
      ...initialBooksState,
      items: [
        {
          id: 'b-1',
          title: 'React TypeScript',
          author: 'Nguyễn Văn A',
          category: 'CNTT',
          publishedYear: 2023,
          availableCopies: 1,
          totalCopies: 3,
        },
      ],
      borrowedIds: ['b-1'],
    };

    const nextState = booksReducer(prevState, returnBook('b-1'));
    expect(nextState.items[0].availableCopies).toBe(2);
    expect(nextState.borrowedIds).not.toContain('b-1');
  });

  // Test 7: setWarning và clearWarning
  it('7. Cập nhật và xoá thông báo cảnh báo đúng đắn', () => {
    const warningState = booksReducer(initialBooksState, setWarning('Cảnh báo mượn quá 3 cuốn'));
    expect(warningState.warning).toBe('Cảnh báo mượn quá 3 cuốn');

    const clearedState = booksReducer(warningState, clearWarning());
    expect(clearedState.warning).toBeNull();
  });
});
