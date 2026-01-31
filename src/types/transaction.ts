export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionInput {
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: TransactionType;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}
