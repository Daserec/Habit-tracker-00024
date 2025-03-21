export interface Habit {
  id: string
  name: string
  description: string
  category: string
  createdAt: string
  completedDates: string[] // Array of ISO date strings (YYYY-MM-DD)
}

