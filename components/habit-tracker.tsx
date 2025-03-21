"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HabitForm } from "@/components/habit-form"
import { HabitList } from "@/components/habit-list"
import { ProgressStats } from "@/components/progress-stats"
import { toast } from "sonner"
import type { Habit } from "@/types/habit"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  // Load habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits")
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits))
    }
  }, [])

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  const addHabit = (habit: Habit) => {
    setHabits([...habits, habit])
    setIsModalOpen(false)
    toast.success("Habit added successfully", {
      description: `"${habit.name}" has been added to your habits.`,
    })
  }

  const updateHabit = (updatedHabit: Habit) => {
    setHabits(habits.map((habit) => (habit.id === updatedHabit.id ? updatedHabit : habit)))
    setIsModalOpen(false)
    setEditingHabit(null)
    toast.success("Habit updated successfully", {
      description: `"${updatedHabit.name}" has been updated.`,
    })
  }

  const editHabit = (id: string) => {
    const habitToEdit = habits.find((habit) => habit.id === id)
    if (habitToEdit) {
      setEditingHabit(habitToEdit)
      setIsModalOpen(true)
    }
  }

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              completedDates: habit.completedDates.includes(getToday())
                ? habit.completedDates.filter((date) => date !== getToday())
                : [...habit.completedDates, getToday()],
            }
          : habit,
      ),
    )
  }

  const deleteHabit = (id: string) => {
    const habitToDelete = habits.find((h) => h.id === id)
    if (!habitToDelete) return

    // Create a copy of the current habits for potential restoration
    const currentHabits = [...habits]

    // Remove the habit from the list
    setHabits(habits.filter((habit) => habit.id !== id))

    // Show toast with undo option
    toast.success("Habit deleted", {
      description: `"${habitToDelete.name}" has been removed from your habits.`,
      action: {
        label: "Undo",
        onClick: () => {
          // Restore the habit directly using the captured habitToDelete
          setHabits((prevHabits) => [...prevHabits, habitToDelete])

          // Show confirmation toast
          toast.success("Habit restored", {
            description: `"${habitToDelete.name}" has been restored to your habits.`,
          })
        },
      },
    })
  }

  const getToday = () => {
    return new Date().toISOString().split("T")[0]
  }

  const handleAddNewClick = () => {
    setEditingHabit(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingHabit(null)
  }

  return (
    <div className="space-y-8">
      <div className="md:flex md:justify-between md:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground">Track your daily habits and monitor your progress over time.</p>
        </div>
        <div className="flex justify-center md:justify-end mt-4 md:mt-0">
          <Button onClick={handleAddNewClick} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Habit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="habits" className="space-y-4">
        <div className="flex justify-center w-full">
          <TabsList className="[@media(max-width:400px)]:h-9">
            <TabsTrigger
              value="habits"
              className="[@media(max-width:400px)]:text-xs [@media(max-width:400px)]:px-2 [@media(max-width:400px)]:h-8"
            >
              Habits
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="[@media(max-width:400px)]:text-xs [@media(max-width:400px)]:px-2 [@media(max-width:400px)]:h-8"
            >
              Statistics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="habits" className="space-y-4">
          <HabitList habits={habits} toggleHabit={toggleHabit} deleteHabit={deleteHabit} editHabit={editHabit} />
        </TabsContent>
        <TabsContent value="stats">
          <ProgressStats habits={habits} />
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingHabit ? "Edit Habit" : "Add New Habit"}</DialogTitle>
          </DialogHeader>
          <HabitForm addHabit={addHabit} updateHabit={updateHabit} initialHabit={editingHabit} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

