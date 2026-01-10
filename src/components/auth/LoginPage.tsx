import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '@/services/firebase/auth'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await loginUser(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm dark:shadow-2xl overflow-hidden border border-border-light dark:border-border-dark">
        <div className="px-10 pt-10 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-primary p-1.5 rounded-lg">
              <span className="material-icons-outlined text-white text-3xl">
                account_balance_wallet
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Fintracker</h1>
          </div>
          <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
            Welcome back
          </h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Please enter your details to sign in.
          </p>
        </div>
        <div className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-danger text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
                Email Address
              </label>
              <input
                className="w-full rounded-lg border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark p-2.5"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1.5">
                Password
              </label>
              <input
                className="w-full rounded-lg border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark p-2.5"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all"
            >
              Sign in
            </button>
          </form>
          <div className="mt-8 text-center text-sm">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary">
                Create free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
