import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider quản lý theme Sáng / Tối bằng Context API nâng cao
 * - Có useMemo cho value để tránh re-render không cần thiết cho các component tiêu thụ
 * - Tự động đồng bộ data-theme trên html element và lưu vào localStorage
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('mini_library_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Kiểm tra cài đặt hệ điều hành
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mini_library_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Áp dụng useMemo cho Context value theo yêu cầu Buổi 4 & Buổi 5
  const contextValue = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      toggleTheme,
    };
  }, [theme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
