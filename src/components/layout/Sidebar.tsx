import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: (open: boolean) => void
}

export const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'account_balance', label: 'Accounts', path: '/accounts' },
    { icon: 'receipt_long', label: 'Transactions', path: '/transactions' },
    { icon: 'savings', label: 'Budgets', path: '/budgets' },
    { icon: 'lightbulb', label: 'Insights', path: '/insights' },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ]

  return (
    <aside
      className={`${
        isOpen ? 'flex' : 'hidden'
      } md:flex w-64 flex-col bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark h-full fixed md:relative z-30 transition-all`}
    >
      <div className="h-16 flex items-center px-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <span className="material-icons-round text-3xl">account_balance_wallet</span>
          <span>Fintracker</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary'
            }`}
            onClick={() => window.innerWidth < 768 && toggleSidebar(false)}
          >
            <span className="material-icons-round text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border-light dark:border-border-dark">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <span className="material-icons-round text-xl rotate-180">logout</span>
          Logout
        </Link>
      </div>
    </aside>
  )
}
