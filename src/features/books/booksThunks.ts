import { createAsyncThunk } from '@reduxjs/toolkit';
import { Book } from './types';
import { fetchBooksApi } from '../../api/booksApi';
import { isSuccess } from '../../shared/types/api';

/**
 * createAsyncThunk fetchBooks lấy danh sách sách từ API giả lập
 * Xử lý đầy đủ 3 trạng thái: pending, fulfilled, rejected
 * Sử dụng Type Guard isSuccess để kiểm tra kết quả trả về
 */
export const fetchBooks = createAsyncThunk<Book[], boolean | undefined, { rejectValue: string }>(
  'books/fetchBooks',
  async (shouldFail = false, { rejectWithValue }) => {
    const result = await fetchBooksApi(shouldFail);

    // Vận dụng Type Guard phân biệt 2 trường hợp thành công và thất bại
    if (isSuccess(result)) {
      return result.data;
    } else {
      return rejectWithValue(result.error);
    }
  }
);
