import { ReactNode } from 'react';

interface HeaderProps {
  toggleSidebar: (open: boolean) => void;
  title?: string;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: (open: boolean) => void;
}

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export type { HeaderProps, SidebarProps, LayoutProps };
