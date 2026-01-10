import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '@/services/firebase/auth'

export const SignupPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await registerUser(email, password, name)
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to create account. Please try again.')
    }
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center">
          <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
            Create your account
          </h2>
        </div>
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="text-danger text-sm">{error}</div>}
            <input
              className="block w-full rounded-lg border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 p-2.5"
              placeholder="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="block w-full rounded-lg border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 p-2.5"
              placeholder="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="block w-full rounded-lg border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800 p-2.5"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="w-full flex justify-center py-2.5 px-4 rounded-lg text-white bg-primary hover:bg-primary-dark transition-colors"
              type="submit"
            >
              Create Account
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
