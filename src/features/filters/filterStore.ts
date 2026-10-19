import { create } from 'zustand';
import { CategoryFilterType } from '../books/types';

export interface FilterState {
  searchQuery: string;
  selectedCategory: CategoryFilterType;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: CategoryFilterType) => void;
  resetFilters: () => void;
}

/**
 * Zustand Store quản lý state bộ lọc (Buổi 4: Zustand)
 * - searchQuery: Từ khóa tìm kiếm theo tên sách hoặc tác giả
 * - selectedCategory: Thể loại được chọn ('Tất cả', 'CNTT', 'Kinh tế', 'Ngoại ngữ')
 */
export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  selectedCategory: 'Tất cả',

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setSelectedCategory: (category: CategoryFilterType) => set({ selectedCategory: category }),

  resetFilters: () => set({ searchQuery: '', selectedCategory: 'Tất cả' }),
}));
