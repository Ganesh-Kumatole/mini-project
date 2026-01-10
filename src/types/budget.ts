export type BudgetPeriod = 'monthly' | 'yearly'

export interface Budget {
  id: string
  userId: string
  category: string
  limitAmount: number
  period: BudgetPeriod
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface BudgetTracking {
  budgetId: string
  spentAmount: number
  periodStart: Date
  periodEnd: Date
  lastUpdated: Date
}

export interface CreateBudgetInput {
  category: string
  limitAmount: number
  period: BudgetPeriod
  startDate: Date
  endDate: Date
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {
  id: string
}
