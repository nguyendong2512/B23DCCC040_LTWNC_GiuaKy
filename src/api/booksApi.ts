import { Book } from '../features/books/types';
import { ApiResult } from '../shared/types/api';

// Danh sách sách ban đầu của thư viện khoa
export const initialMockBooks: Book[] = [
  {
    id: 'book-01',
    title: 'Cấu Trúc Dữ Liệu và Giải Thuật Nâng Cao',
    author: 'Nguyễn Văn A',
    category: 'CNTT',
    publishedYear: 2022,
    availableCopies: 3,
    totalCopies: 5,
    description: 'Giáo trình toàn diện về đồ thị, quy hoạch động, cây cân bằng và các thuật toán nâng cao.',
    isbn: '978-604-01-2345-1',
  },
  {
    id: 'book-02',
    title: 'Lập Trình Web Hiện Đại với React & TypeScript',
    author: 'Trần Thị B',
    category: 'CNTT',
    publishedYear: 2023,
    availableCopies: 1,
    totalCopies: 4,
    description: 'Kiến thức chuyên sâu về React 18, Redux Toolkit, Custom Hooks, Zustand và tối ưu hiệu năng.',
    isbn: '978-604-01-2345-2',
  },
  {
    id: 'book-03',
    title: 'Kiến Trúc Hệ Thống Microservices',
    author: 'Lê Hoàng C',
    category: 'CNTT',
    publishedYear: 2021,
    availableCopies: 0, // Đã hết bản để kiểm tra nút Mượn bị vô hiệu hóa
    totalCopies: 2,
    description: 'Thiết kế hệ thống chịu tải cao, Message Broker Kafka, Docker và điều phối Kubernetes.',
    isbn: '978-604-01-2345-3',
  },
  {
    id: 'book-04',
    title: 'Kinh Tế Lượng và Phân Tích Dữ Liệu Tài Chính',
    author: 'Phạm Minh D',
    category: 'Kinh tế',
    publishedYear: 2020,
    availableCopies: 4,
    totalCopies: 6,
    description: 'Phân tích hồi quy, chuỗi thời gian ARIMA và ứng dụng mô hình định lượng trong kinh tế.',
    isbn: '978-604-02-6789-1',
  },
  {
    id: 'book-05',
    title: 'Quản Trị Chiến Lược Trong Kỷ Nguyên Số',
    author: 'Vũ Quốc E',
    category: 'Kinh tế',
    publishedYear: 2023,
    availableCopies: 2,
    totalCopies: 3,
    description: 'Phương pháp xây dựng lợi thế cạnh tranh dài hạn và quản trị chuyển đổi số doanh nghiệp.',
    isbn: '978-604-02-6789-2',
  },
  {
    id: 'book-06',
    title: 'Tài Chính Doanh Nghiệp Căn Bản & Nâng Cao',
    author: 'Đỗ Hải F',
    category: 'Kinh tế',
    publishedYear: 2022,
    availableCopies: 5,
    totalCopies: 5,
    description: 'Quản trị vốn lưu động, định giá tài sản và hoạch định chiến lược đầu tư tài chính.',
    isbn: '978-604-02-6789-3',
  },
  {
    id: 'book-07',
    title: 'English for Computer Science & IT',
    author: 'Eric Glendinning',
    category: 'Ngoại ngữ',
    publishedYear: 2021,
    availableCopies: 2,
    totalCopies: 4,
    description: 'Thuật ngữ tiếng Anh chuyên ngành công nghệ phần mềm, trí tuệ nhân tạo và an toàn thông tin.',
    isbn: '978-0-19-457375-7',
  },
  {
    id: 'book-08',
    title: 'IELTS Academic Writing & Speaking Masterclass',
    author: 'Rachel Green',
    category: 'Ngoại ngữ',
    publishedYear: 2024,
    availableCopies: 0, // Đã hết bản để kiểm tra disabled
    totalCopies: 3,
    description: 'Bí quyết bứt phá band điểm 7.5+ IELTS với các chủ đề học thuật chuyên sâu.',
    isbn: '978-0-19-457376-8',
  },
  {
    id: 'book-09',
    title: 'Tiếng Nhật Thương Mại & Văn Hóa Doanh Nghiệp',
    author: 'Tanaka Kenji',
    category: 'Ngoại ngữ',
    publishedYear: 2022,
    availableCopies: 3,
    totalCopies: 3,
    description: 'Thành thạo Kính ngữ (Keigo), quy tắc giao tiếp và kỹ năng đàm phán với đối tác Nhật Bản.',
    isbn: '978-4-88319-756-9',
  },
  {
    id: 'book-10',
    title: 'Nhập Môn Trí Tuệ Nhân Tạo & Học Máy',
    author: 'Ngô Bảo G',
    category: 'CNTT',
    publishedYear: 2024,
    availableCopies: 3,
    totalCopies: 4,
    description: 'Cơ sở lý thuyết Machine Learning, mạng nơ-ron nhân tạo và xử lý ngôn ngữ tự nhiên.',
    isbn: '978-604-01-2345-4',
  },
];

/**
 * Hàm giả lập gọi API lấy danh sách sách từ máy chủ thư viện
 * @param shouldFail Tham số tùy chọn để giả lập trường hợp gọi API thất bại (phục vụ test và chấm điểm)
 * @returns Promise<ApiResult<Book[]>>
 */
export const fetchBooksApi = (shouldFail: boolean = false): Promise<ApiResult<Book[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (shouldFail) {
        resolve({
          ok: false,
          error: 'Không thể kết nối đến máy chủ thư viện khoa. Vui lòng kiểm tra mạng và thử lại!',
        });
      } else {
        // Sao chép sâu mảng sách để bảo đảm tính bất biến
        const clonedBooks: Book[] = JSON.parse(JSON.stringify(initialMockBooks));
        resolve({
          ok: true,
          data: clonedBooks,
        });
      }
    }, 500);
  });
};
