import React from 'react';
import { useFilterStore } from '../filterStore';
import { CategoryFilterType } from '../../books/types';
import { useAppSelector } from '../../../app/hooks';

const categories: CategoryFilterType[] = ['Tất cả', 'CNTT', 'Kinh tế', 'Ngoại ngữ'];

/**
 * Component lọc sách theo thể loại (Zustand state)
 * Hỗ trợ các thể loại: Tất cả / CNTT / Kinh tế / Ngoại ngữ
 */
export const CategoryFilter: React.FC = () => {
  const selectedCategory = useFilterStore((state) => state.selectedCategory);
  const setSelectedCategory = useFilterStore((state) => state.setSelectedCategory);
  const items = useAppSelector((state) => state.books.items);

  // Tính số lượng sách tương ứng với mỗi thể loại
  const getCategoryCount = (cat: CategoryFilterType): number => {
    if (cat === 'Tất cả') return items.length;
    return items.filter((book) => book.category === cat).length;
  };

  return (
    <div className="category-filter-container" role="radiogroup" aria-label="Bộ lọc thể loại">
      <span className="filter-label">Thể loại:</span>
      <div className="category-tabs">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`category-tab ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              role="radio"
              aria-checked={isActive}
            >
              <span className="cat-name">{cat}</span>
              <span className="cat-badge">{getCategoryCount(cat)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
