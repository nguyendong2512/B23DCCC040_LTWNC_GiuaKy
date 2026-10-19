import React from 'react';
import { useTheme } from './useTheme';

/**
 * Nút chuyển đổi giao diện Sáng / Tối (Theme Toggle)
 */
export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
      aria-label={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
    >
      <span className="theme-toggle-icon">{isDark ? '☀️' : '🌙'}</span>
      <span className="theme-toggle-text">{isDark ? 'Sáng' : 'Tối'}</span>
    </button>
  );
};
