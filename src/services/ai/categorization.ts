import { TRANSACTION_CATEGORIES } from '@/utils/constants'

// Simple rule-based categorization (can be replaced with AI API)
const categoryKeywords: Record<string, string[]> = {
  Groceries: ['grocery', 'supermarket', 'food', 'walmart', 'target', 'kroger'],
  Utilities: ['electric', 'water', 'gas', 'internet', 'phone', 'utility'],
  Transport: ['uber', 'lyft', 'gas', 'fuel', 'parking', 'metro', 'bus'],
  Entertainment: ['movie', 'netflix', 'spotify', 'concert', 'theater'],
  'Dining Out': ['restaurant', 'cafe', 'starbucks', 'mcdonald', 'pizza'],
  Rent: ['rent', 'lease', 'apartment'],
  Shopping: ['amazon', 'store', 'mall', 'purchase'],
  Healthcare: ['doctor', 'pharmacy', 'hospital', 'medical'],
  Education: ['school', 'tuition', 'book', 'course'],
}

export const categorizeTransaction = (description: string): string => {
  const lowerDescription = description.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lowerDescription.includes(keyword))) {
      return category
    }
  }

  return 'Other'
}

// Future: AI-powered categorization using OpenAI/Gemini
export const categorizeWithAI = async (
  description: string
): Promise<string> => {
  // TODO: Implement AI categorization
  // This would call OpenAI or Gemini API
  return categorizeTransaction(description)
}
