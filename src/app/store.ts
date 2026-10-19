import { configureStore } from '@reduxjs/toolkit';
import booksReducer from '../features/books/booksSlice';
import authReducer from '../features/auth/authSlice';
import { borrowLimitMiddleware } from './middleware/borrowLimit';

export const store = configureStore({
  reducer: {
    books: booksReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(borrowLimitMiddleware),
});

// Định nghĩa RootState và AppDispatch từ store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
