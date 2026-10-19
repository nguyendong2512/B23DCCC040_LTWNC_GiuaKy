# Ứng Dụng Mini Library — Tra Cứu và Mượn/Trả Sách

> Dự án kiểm tra giữa kỳ môn **Lập trình Web Nâng Cao**  
> Vận dụng tổng hợp toàn diện kiến thức từ Buổi 1 đến Buổi 6: TypeScript nâng cao, React Design Pattern, Redux Toolkit, Zustand, Context nâng cao, Middleware, Tối ưu hiệu năng & Unit Test.

---

## 📁 Cấu Trúc Dự Án (Feature-based Architecture)

```
src/
├── api/
│   └── booksApi.ts              # Hàm giả lập API, setTimeout 500ms, tham số giả lập lỗi
│
├── app/                         # Cấu hình toàn app
│   ├── store.ts                 # configureStore + gắn middleware, export RootState, AppDispatch
│   ├── hooks.ts                 # Typed hooks: useAppSelector, useAppDispatch
│   └── middleware/
│       ├── borrowLimit.ts       # Middleware Redux giới hạn mượn tối đa 3 cuốn
│       └── borrowLimit.test.ts  # Test kiểm thử middleware
│
├── features/
│   ├── books/                   # Danh sách sách + mượn/trả (Redux Toolkit)
│   │   ├── booksSlice.ts        # State: items, borrowedIds, status, error, warning
│   │   ├── booksSlice.test.ts   # 7 test cases cho reducer (vượt mức tối thiểu 4)
│   │   ├── booksThunks.ts       # fetchBooks (createAsyncThunk xử lý pending, fulfilled, rejected)
│   │   ├── types.ts             # Book, BookCategory, các Utility Types (Pick, Omit, Record, Readonly, Partial)
│   │   └── components/
│   │       ├── BookItem.tsx     # Bọc React.memo
│   │       ├── BookItem.test.tsx# 4 test cases bằng RTL + userEvent (vượt mức tối thiểu 3)
│   │       └── BookList.tsx     # Lọc bằng useMemo, handler bọc useCallback, key dùng book.id
│   │
│   ├── filters/                 # Tìm kiếm + lọc thể loại (Zustand)
│   │   ├── filterStore.ts       # Zustand store: searchQuery, selectedCategory
│   │   └── components/
│   │       ├── SearchBar.tsx    # Ô tìm kiếm dùng useDebounce<T> (300ms)
│   │       └── CategoryFilter.tsx # Lọc thể loại (Tất cả, CNTT, Kinh tế, Ngoại ngữ)
│   │
│   ├── theme/                   # Chuyển đổi Sáng / Tối (Context API)
│   │   ├── ThemeContext.tsx     # Context Provider có useMemo cho value
│   │   ├── useTheme.ts          # Custom hook useTheme an toàn
│   │   └── ThemeToggle.tsx      # Nút chuyển giao diện Sáng / Tối
│   │
│   ├── auth/                    # Tính năng Đăng nhập & Đăng ký sinh viên
│   │   ├── types.ts             # Student, AuthState
│   │   ├── authSlice.ts         # Quản lý tài khoản sinh viên & phiên đăng nhập
│   │   └── components/
│   │       ├── LoginPage.tsx    # Trang Đăng nhập (hỗ trợ tài khoản sinh viên mẫu)
│   │       └── RegisterPage.tsx # Trang Đăng ký thẻ thư viện sinh viên mới
│   │
│   └── stats/                   # Trang thống kê (Route /stats)
│       └── StatsPage.tsx        # Export default phục vụ React.lazy
│
├── shared/                      # Dùng chung nhiều feature
│   ├── types/
│   │   └── api.ts               # ApiResult<T>, ApiSuccess<T>, ApiError, Type Guards isSuccess/isError
│   └── hooks/
│       ├── useDebounce.ts       # Custom hook generic useDebounce<T>
│       └── useDebounce.test.ts  # Test useDebounce với fake timers
│
├── App.tsx                      # Routes, Suspense + React.lazy StatsPage, Navbar
├── App.css                      # Giao diện hiện đại, Dark/Light Mode, responsive
├── index.tsx                    # Provider (Redux), ThemeProvider, BrowserRouter
└── setupTests.ts                # Cấu hình Jest DOM
```

---

## 🎯 Bảng Đối Chiếu Yêu Cầu Đề Bài & Hiện Thực

### 1. Yêu Cầu Kỹ Thuật

| Yêu cầu | Hiện thực | Vị trí mã nguồn |
| :--- | :--- | :--- |
| **Buổi 1: TypeScript nâng cao** | • Generic `ApiResult<T>`, `useDebounce<T>`<br>• Type Guard `isSuccess`, `isError`<br>• Dùng 5 Utility Types: `Pick`, `Omit`, `Record`, `Readonly`, `Partial`<br>• Tuyệt đối không dùng `any` | `src/shared/types/api.ts`<br>`src/features/books/types.ts`<br>`src/shared/hooks/useDebounce.ts` |
| **Buổi 2: Design Pattern React** | • Generic Custom Hook `useDebounce<T>`<br>• Custom Hook `useTheme`<br>• Custom Hook `useAppDispatch`, `useAppSelector` | `src/shared/hooks/useDebounce.ts`<br>`src/features/theme/useTheme.ts`<br>`src/app/hooks.ts` |
| **Buổi 3: Redux Toolkit** | • Feature-based structure (`features/books/`)<br>• `createSlice` quản lý `items`, `borrowedIds`, `status`, `error`<br>• `createAsyncThunk` (`fetchBooks`) xử lý đủ 3 trạng thái pending / fulfilled / rejected<br>• Typed hooks `useAppSelector` & `useAppDispatch` | `src/features/books/booksSlice.ts`<br>`src/features/books/booksThunks.ts`<br>`src/app/hooks.ts` |
| **Buổi 4: Zustand, Context, Middleware** | • Giới hạn 3 cuốn cài đặt bằng **Redux Middleware tự viết** (`borrowLimitMiddleware`)<br>• State bộ lọc (từ khóa, thể loại) quản lý bằng **Zustand** (`useFilterStore`)<br>• Theme Sáng / Tối quản lý bằng **Context API**, có `useMemo` bọc value & hook `useTheme` | `src/app/middleware/borrowLimit.ts`<br>`src/features/filters/filterStore.ts`<br>`src/features/theme/ThemeContext.tsx` |
| **Buổi 5: Tối ưu hiệu năng** | • Danh sách sau lọc tính bằng `useMemo`<br>• Component `BookItem` bọc `React.memo`<br>• Các handler mượn/trả bọc `useCallback`<br>• `key` render dùng `book.id` (không dùng index)<br>• Trang `/stats` lazy load bằng `React.lazy + Suspense` | `src/features/books/components/BookList.tsx`<br>`src/features/books/components/BookItem.tsx`<br>`src/App.tsx` |
| **Buổi 6: Kiểm thử Jest + RTL** | **14 tests chạy xanh 100%**:<br>• 7 tests cho reducer `booksSlice`<br>• 4 tests cho `BookItem` bằng RTL + `userEvent`<br>• 2 tests cho `useDebounce` dùng fake timers<br>• 1 test cho `borrowLimitMiddleware` | `src/features/books/booksSlice.test.ts`<br>`src/features/books/components/BookItem.test.tsx`<br>`src/shared/hooks/useDebounce.test.ts`<br>`src/app/middleware/borrowLimit.test.ts` |
| **API giả lập** | • Hàm `fetchBooksApi(shouldFail?: boolean)` trong `src/api/booksApi.ts`<br>• Trả về Promise độ trễ 500ms (`setTimeout`)<br>• Có nút "🧪 Giả lập lỗi API" ngay trên giao diện để giáo viên chấm điểm kiểm tra trạng thái lỗi | `src/api/booksApi.ts` |

---

### 2. Yêu Cầu Chức Năng

1. **Khởi động ứng dụng**: Gọi API giả lập với độ trễ 500ms, hiển thị spinner "Đang tải...", có thông báo lỗi kèm nút "Thử lại" khi API thất bại.
2. **Hiển thị danh sách sách**: Tên sách, tác giả, thể loại (CNTT / Kinh tế / Ngoại ngữ), năm xuất bản, số bản còn lại / tổng số bản.
3. **Tìm kiếm sách**: Tìm theo tên hoặc tác giả (không phân biệt chữ hoa/thường), có debounce 300ms thông qua custom hook generic `useDebounce<T>`.
4. **Lọc theo thể loại**: Các tabs Tất cả / CNTT / Kinh tế / Ngoại ngữ với badge đếm số lượng sách theo từng thể loại.
5. **Mượn sách**: Số bản còn lại giảm 1, nút "Mượn" bị vô hiệu hóa khi sách đã hết bản (`availableCopies === 0`).
6. **Trả sách**: Khi sách đang được mượn, hiển thị nút "Trả", trả xong số bản còn lại tăng 1.
7. **Giới hạn mượn 3 cuốn**: Khi sinh viên đã mượn 3 cuốn, Middleware Redux sẽ chặn hành động mượn và kích hoạt thông báo cảnh báo màu vàng trên giao diện.
8. **Theme Sáng / Tối**: Nút chuyển đổi giao diện sáng/tối mượt mà, lưu vào localStorage.
9. **Trang Thống kê (Route `/stats`)**: Lazy load với `React.lazy`, hiển thị số đầu sách theo từng thể loại, tỷ lệ phần trăm trực quan, tổng số bản sách lưu kho và danh sách chi tiết các cuốn đang mượn kèm nút trả nhanh.

---

## 🚀 Hướng Dẫn Cài Đặt và Khởi Chạy

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Chạy ứng dụng ở môi trường phát triển (Local Dev Server)
```bash
npm start
```
Ứng dụng sẽ tự động mở tại: `http://localhost:3000`

### 3. Chạy toàn bộ bài kiểm thử (Unit Tests)
```bash
npm test -- --watchAll=false
```
Kết quả mong đợi: **4 test suites pass, 14 tests pass xanh 100%**.

### 4. Build phiên bản phát hành (Production Build)
```bash
npm run build
```
Code-splitting sẽ tách riêng `StatsPage` thành một bundle chunk riêng biệt để tối ưu thời gian tải trang ban đầu.
