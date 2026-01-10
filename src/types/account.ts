export type AccountType = 'checking' | 'savings' | 'credit' | 'investment'

export interface Account {
  id: string
  userId: string
  name: string
  type: AccountType
  balance: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateAccountInput {
  name: string
  type: AccountType
  balance: number
}

export interface UpdateAccountInput extends Partial<CreateAccountInput> {
  id: string
}
