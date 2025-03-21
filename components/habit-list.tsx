"use client"

import { useState } from "react"
import type { Habit } from "@/types/habit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trash, Search, Activity, Brain, Book, Heart, Zap, MoreHorizontal, Check, Edit, X, FilterX } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HabitListProps {
  habits: Habit[]
  toggleHabit: (id: string) => void
  deleteHabit: (id: string) => void
  editHabit: (id: string) => void
}

export function HabitList({ habits, toggleHabit, deleteHabit, editHabit }: HabitListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<string | null>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)

  const getToday = () => {
    return new Date().toISOString().split("T")[0]
  }

  const getStreak = (completedDates: string[]) => {
    if (completedDates.length === 0) return 0

    // Sort dates in ascending order
    const sortedDates = [...completedDates].sort()

    // Get the most recent date
    const lastDate = new Date(sortedDates[sortedDates.length - 1])
    let currentStreak = 1

    // Check for consecutive days
    for (let i = 1; i <= 100; i++) {
      // Limit to 100 days to avoid infinite loops
      const prevDate = new Date(lastDate)
      prevDate.setDate(prevDate.getDate() - i)
      const prevDateStr = prevDate.toISOString().split("T")[0]

      if (completedDates.includes(prevDateStr)) {
        currentStreak++
      } else {
        break
      }
    }

    return currentStreak
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health":
        return <Heart className="h-4 w-4" />
      case "fitness":
        return <Activity className="h-4 w-4" />
      case "productivity":
        return <Zap className="h-4 w-4" />
      case "learning":
        return <Book className="h-4 w-4" />
      case "mindfulness":
        return <Brain className="h-4 w-4" />
      default:
        return <MoreHorizontal className="h-4 w-4" />
    }
  }

  const showDeleteConfirm = (id: string) => {
    setHabitToDelete(id)
    setShowDeleteAlert(true)
  }

  const confirmDelete = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete)
      setHabitToDelete(null)
    }
    setShowDeleteAlert(false)
  }

  const handleFilterChange = (value: string) => {
    setFilter(value === "all" ? null : value)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setFilter(null)
  }

  const filteredHabits = habits
    .filter(
      (habit) =>
        habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        habit.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((habit) => filter === null || habit.category === filter)

  const hasActiveFilters = searchTerm !== "" || filter !== null

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            className="pl-8 pr-8 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select defaultValue="all" onValueChange={handleFilterChange} value={filter === null ? "all" : filter}>
          <SelectTrigger className="w-full sm:w-[180px] h-10">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="mindfulness">Mindfulness</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          {habits.length === 0 ? (
            <p className="text-muted-foreground">No habits found. Add a new habit to get started!</p>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                There are no habits that match the search and/or filtering you applied.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2">
                  <FilterX className="h-4 w-4" />
                  Clear all filters
                </Button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredHabits.map((habit) => (
            <Card key={habit.id} className="overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">{habit.name}</CardTitle>
                    <CardDescription className="mt-1 whitespace-pre-wrap break-words">
                      {habit.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                    {getCategoryIcon(habit.category)}
                    {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-col gap-3">
                  <div>
                    <Button
                      variant={habit.completedDates.includes(getToday()) ? "default" : "outline"}
                      size="sm"
                      className="h-8 px-3 w-full"
                      onClick={() => toggleHabit(habit.id)}
                    >
                      {habit.completedDates.includes(getToday()) ? (
                        <>
                          <Check className="mr-1 h-4 w-4" />
                          Completed
                        </>
                      ) : (
                        "Mark complete"
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-sm text-muted-foreground">{getStreak(habit.completedDates)} day streak</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary h-8 w-8"
                        onClick={() => editHabit(habit.id)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit habit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => showDeleteConfirm(habit.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete habit</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this habit and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

