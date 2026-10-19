import React from 'react';
import { Book } from '../types';

export interface BookItemProps {
  book: Book;
  isBorrowed: boolean;
  onBorrow: (id: string) => void;
  onReturn: (id: string) => void;
}

/**
 * Component hiển thị thông tin 1 cuốn sách
 * Được bọc bằng React.memo để tối ưu hiệu năng (Buổi 5)
 * Tránh re-render không cần thiết khi các cuốn sách khác thay đổi
 */
export const BookItem: React.FC<BookItemProps> = React.memo(
  ({ book, isBorrowed, onBorrow, onReturn }) => {
    const isOutOfStock = book.availableCopies <= 0;

    // Màu sắc badge thể loại
    const getBadgeStyle = (category: string) => {
      switch (category) {
        case 'CNTT':
          return 'badge-cntt';
        case 'Kinh tế':
          return 'badge-kinhte';
        case 'Ngoại ngữ':
          return 'badge-ngoaingu';
        default:
          return 'badge-default';
      }
    };

    return (
      <div className={`book-card ${isBorrowed ? 'borrowed' : ''}`} data-testid={`book-card-${book.id}`}>
        <div className="book-card-header">
          <span className={`badge ${getBadgeStyle(book.category)}`}>
            {book.category}
          </span>
          <span className="book-year">Năm: {book.publishedYear}</span>
        </div>

        <h3 className="book-title" title={book.title}>
          {book.title}
        </h3>

        <p className="book-author">
          <span className="label">Tác giả:</span> <strong>{book.author}</strong>
        </p>

        {book.description && (
          <p className="book-description">{book.description}</p>
        )}

        <div className="book-stock-info">
          <div className="stock-count">
            <span className="label">Số bản còn lại:</span>{' '}
            <strong className={`stock-number ${isOutOfStock ? 'text-danger' : 'text-success'}`}>
              {book.availableCopies} / {book.totalCopies}
            </strong>
          </div>
          {isOutOfStock && <span className="badge-out-of-stock">Hết sách</span>}
          {isBorrowed && <span className="badge-borrowed">Đang mượn</span>}
        </div>

        <div className="book-actions">
          {isBorrowed ? (
            <button
              type="button"
              className="btn btn-return"
              onClick={() => onReturn(book.id)}
            >
              🔄 Trả sách
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-borrow"
              disabled={isOutOfStock}
              onClick={() => onBorrow(book.id)}
            >
              {isOutOfStock ? '❌ Hết sách' : '📖 Mượn sách'}
            </button>
          )}
        </div>
      </div>
    );
  }
);

BookItem.displayName = 'BookItem';
