import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from './ThemeContext';

/**
 * Custom hook useTheme để truy cập và thay đổi giao diện Sáng / Tối
 * Throw error nếu được gọi ngoài ThemeProvider
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme phải được sử dụng bên trong một <ThemeProvider>');
  }

  return context;
};
