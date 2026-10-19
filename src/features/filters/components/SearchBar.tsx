import React, { useState, useEffect } from 'react';
import { useFilterStore } from '../filterStore';
import { useDebounce } from '../../../shared/hooks/useDebounce';

/**
 * Component ô tìm kiếm sách theo tên hoặc tác giả
 * Sử dụng generic custom hook useDebounce<string>(query, 300)
 */
export const SearchBar: React.FC = () => {
  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const [inputValue, setInputValue] = useState<string>('');

  // Sử dụng custom hook generic useDebounce với delay 300ms
  const debouncedSearchTerm = useDebounce<string>(inputValue, 300);

  // Đồng bộ giá trị sau khi debounce vào Zustand store
  useEffect(() => {
    setSearchQuery(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchQuery]);

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Tìm sách theo tên sách hoặc tác giả..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-label="Tìm kiếm sách theo tên hoặc tác giả"
        />
        {inputValue && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={handleClear}
            aria-label="Xóa từ khóa tìm kiếm"
          >
            ✕
          </button>
        )}
      </div>
      {inputValue && (
        <span className="search-status-hint">
          {debouncedSearchTerm === inputValue ? 'Đã lọc' : 'Đang chờ nhập...'}
        </span>
      )}
    </div>
  );
};
