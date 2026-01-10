import { useTheme } from '@/context/ThemeContext'

interface HeaderProps {
  toggleSidebar: (open: boolean) => void
  title?: string
}

export const Header = ({ toggleSidebar, title }: HeaderProps) => {
  const { toggleTheme } = useTheme()

  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => toggleSidebar(true)}
          className="md:hidden text-text-secondary-light dark:text-text-secondary-dark hover:text-primary focus:outline-none"
        >
          <span className="material-icons-round">menu</span>
        </button>
        {title && (
          <h1 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark md:hidden">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <span className="material-icons-round dark:hidden">dark_mode</span>
          <span className="material-icons-round hidden dark:block">light_mode</span>
        </button>
        <button className="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative">
          <span className="material-icons-round">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-border-light dark:border-border-dark">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
              User
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
