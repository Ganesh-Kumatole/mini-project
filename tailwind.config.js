/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-dark': '#1d4ed8',
        secondary: '#1E40AF',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        'background-light': '#F3F4F6',
        'background-dark': '#111827',
        'surface-light': '#FFFFFF',
        'surface-dark': '#1F2937',
        'text-primary-light': '#111827',
        'text-primary-dark': '#F9FAFB',
        'text-secondary-light': '#6B7280',
        'text-secondary-dark': '#9CA3AF',
        'border-light': '#E5E7EB',
        'border-dark': '#374151',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(37, 99, 235, 0.3)',
      },
    },
  },
  plugins: [],
}
