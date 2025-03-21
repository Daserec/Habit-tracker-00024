"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Habit } from "@/types/habit"
import { useEffect } from "react"

interface HabitFormProps {
  addHabit: (habit: Habit) => void
  updateHabit?: (habit: Habit) => void
  initialHabit: Habit | null
}

const formSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  description: z.string().optional(),
  category: z.string().default("health"),
})

type FormValues = z.infer<typeof formSchema>

export function HabitForm({ addHabit, updateHabit, initialHabit }: HabitFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialHabit?.name || "",
      description: initialHabit?.description || "",
      category: initialHabit?.category || "health",
    },
  })

  // Update form values when initialHabit changes
  useEffect(() => {
    if (initialHabit) {
      form.reset({
        name: initialHabit.name,
        description: initialHabit.description,
        category: initialHabit.category,
      })
    }
  }, [initialHabit, form])

  const onSubmit = (values: FormValues) => {
    if (initialHabit && updateHabit) {
      // Update existing habit
      const updatedHabit: Habit = {
        ...initialHabit,
        name: values.name,
        description: values.description || "",
        category: values.category,
      }
      updateHabit(updatedHabit)
    } else {
      // Create new habit
      const newHabit: Habit = {
        id: uuidv4(),
        name: values.name,
        description: values.description || "",
        category: values.category,
        createdAt: new Date().toISOString(),
        completedDates: [],
      }
      addHabit(newHabit)
    }
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter habit name" className="h-10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your habit" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-10">
          {initialHabit ? "Update Habit" : "Add Habit"}
        </Button>
      </form>
    </Form>
  )
}

