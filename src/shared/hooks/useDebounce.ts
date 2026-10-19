import { useState, useEffect } from 'react';

/**
 * Custom hook generic useDebounce<T> trì hoãn việc cập nhật giá trị sau một khoảng thời gian delay
 * @param value Giá trị cần debounce (generic T)
 * @param delay Thời gian trễ tính bằng mili-giây (mặc định 300ms)
 * @returns Giá trị đã được debounce
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Thiết lập timer cập nhật giá trị sau khoảng thời gian delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Dọn dẹp timer nếu giá trị thay đổi hoặc component unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
