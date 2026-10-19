import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookItem } from './BookItem';
import { Book } from '../types';

const mockBookAvailable: Book = {
  id: 'b-01',
  title: 'Lập Trình Web với React và TypeScript',
  author: 'Trần Thị B',
  category: 'CNTT',
  publishedYear: 2023,
  availableCopies: 3,
  totalCopies: 5,
};

const mockBookOutOfStock: Book = {
  id: 'b-02',
  title: 'Hệ Thống Phân Tán Microservices',
  author: 'Lê Hoàng C',
  category: 'CNTT',
  publishedYear: 2021,
  availableCopies: 0,
  totalCopies: 2,
};

describe('BookItem component (Kiểm thử React Testing Library + userEvent)', () => {
  // Test 1: Hiển thị đúng thông tin sách
  it('1. Hiển thị đúng và đầy đủ thông tin cuốn sách: tên, tác giả, thể loại, năm XB, số bản còn lại', () => {
    const handleBorrow = jest.fn();
    const handleReturn = jest.fn();

    render(
      <BookItem
        book={mockBookAvailable}
        isBorrowed={false}
        onBorrow={handleBorrow}
        onReturn={handleReturn}
      />
    );

    // Kiểm tra tên sách
    expect(screen.getByText('Lập Trình Web với React và TypeScript')).toBeInTheDocument();
    // Kiểm tra tác giả
    expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    // Kiểm tra thể loại
    expect(screen.getByText('CNTT')).toBeInTheDocument();
    // Kiểm tra năm xuất bản
    expect(screen.getByText(/2023/)).toBeInTheDocument();
    // Kiểm tra số bản còn lại
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
  });

  // Test 2: Click "Mượn" gọi đúng hàm với đúng id
  it('2. Khi nhấn nút "Mượn", gọi đúng callback onBorrow với đúng book id', () => {
    const handleBorrow = jest.fn();
    const handleReturn = jest.fn();

    render(
      <BookItem
        book={mockBookAvailable}
        isBorrowed={false}
        onBorrow={handleBorrow}
        onReturn={handleReturn}
      />
    );

    const borrowBtn = screen.getByRole('button', { name: /Mượn sách/i });
    expect(borrowBtn).not.toBeDisabled();

    userEvent.click(borrowBtn);

    expect(handleBorrow).toHaveBeenCalledTimes(1);
    expect(handleBorrow).toHaveBeenCalledWith('b-01');
  });

  // Test 3: Nút "Mượn" bị vô hiệu hoá khi hết bản
  it('3. Nút "Mượn" bị vô hiệu hoá (disabled) khi số bản còn lại bằng 0', () => {
    const handleBorrow = jest.fn();
    const handleReturn = jest.fn();

    render(
      <BookItem
        book={mockBookOutOfStock}
        isBorrowed={false}
        onBorrow={handleBorrow}
        onReturn={handleReturn}
      />
    );

    const borrowBtn = screen.getByRole('button', { name: /Hết sách/i });
    expect(borrowBtn).toBeDisabled();

    // Thử click khi disabled -> không được gọi hàm
    userEvent.click(borrowBtn);
    expect(handleBorrow).not.toHaveBeenCalled();
  });

  // Test 4 (Bonus): Hiển thị nút "Trả" khi sách đang được mượn và click gọi onReturn
  it('4. Hiển thị nút "Trả sách" khi sách đang được mượn và gọi onReturn với đúng id', () => {
    const handleBorrow = jest.fn();
    const handleReturn = jest.fn();

    render(
      <BookItem
        book={mockBookAvailable}
        isBorrowed={true}
        onBorrow={handleBorrow}
        onReturn={handleReturn}
      />
    );

    const returnBtn = screen.getByRole('button', { name: /Trả sách/i });
    expect(returnBtn).toBeInTheDocument();

    userEvent.click(returnBtn);
    expect(handleReturn).toHaveBeenCalledTimes(1);
    expect(handleReturn).toHaveBeenCalledWith('b-01');
  });
});
