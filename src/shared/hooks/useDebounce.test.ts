import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce custom hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('cập nhật giá trị sau thời gian delay 300ms và không cập nhật sớm hơn', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce<string>(value, delay),
      {
        initialProps: { value: 'React', delay: 300 },
      }
    );

    // Giá trị ban đầu ngay lập tức
    expect(result.current).toBe('React');

    // Cập nhật props giá trị mới
    rerender({ value: 'React TypeScript', delay: 300 });

    // Khi chưa trôi qua 300ms, giá trị vẫn là giá trị cũ
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('React');

    // Khi trôi qua thêm 100ms (tổng 300ms), giá trị mới được cập nhật
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('React TypeScript');
  });

  it('hoạt động tốt với kiểu dữ liệu generic số (number)', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce<number>(value, delay),
      {
        initialProps: { value: 10, delay: 500 },
      }
    );

    expect(result.current).toBe(10);

    rerender({ value: 99, delay: 500 });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe(99);
  });
});
