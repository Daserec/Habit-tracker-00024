"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Habit } from "@/types/habit"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ProgressStatsProps {
  habits: Habit[]
}

export function ProgressStats({ habits }: ProgressStatsProps) {
  const today = new Date().toISOString().split("T")[0]

  const stats = useMemo(() => {
    // Calculate completion rate for today
    const completedToday = habits.filter((habit) => habit.completedDates.includes(today)).length

    const completionRate = habits.length > 0 ? (completedToday / habits.length) * 100 : 0

    // Calculate completion by category
    const categories = [...new Set(habits.map((habit) => habit.category))]
    const categoryStats = categories.map((category) => {
      const categoryHabits = habits.filter((habit) => habit.category === category)
      const completed = categoryHabits.filter((habit) => habit.completedDates.includes(today)).length

      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        total: categoryHabits.length,
        completed,
        rate: categoryHabits.length > 0 ? (completed / categoryHabits.length) * 100 : 0,
      }
    })

    // Calculate weekly data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const weeklyData = last7Days.map((date) => {
      const day = new Date(date).toLocaleDateString("en-US", { weekday: "short" })
      const completedOnDate = habits.filter((habit) => habit.completedDates.includes(date)).length

      return {
        day,
        date,
        completed: completedOnDate,
        total: habits.length,
        rate: habits.length > 0 ? (completedOnDate / habits.length) * 100 : 0,
      }
    })

    // Calculate longest streak
    let longestStreak = 0

    habits.forEach((habit) => {
      const sortedDates = [...habit.completedDates].sort()
      let currentStreak = 1
      let maxStreak = 1

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1])
        const currDate = new Date(sortedDates[i])

        // Check if dates are consecutive
        prevDate.setDate(prevDate.getDate() + 1)

        if (
          prevDate.getFullYear() === currDate.getFullYear() &&
          prevDate.getMonth() === currDate.getMonth() &&
          prevDate.getDate() === currDate.getDate()
        ) {
          currentStreak++
          maxStreak = Math.max(maxStreak, currentStreak)
        } else {
          currentStreak = 1
        }
      }

      longestStreak = Math.max(longestStreak, maxStreak)
    })

    return {
      totalHabits: habits.length,
      completedToday,
      completionRate,
      categoryStats,
      weeklyData,
      longestStreak,
    }
  }, [habits, today])

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-muted-foreground">No habits found. Add a new habit to see statistics!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedToday} / {stats.totalHabits}
            </div>
            <div className="mt-2">
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{stats.completionRate.toFixed(0)}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.longestStreak} days</div>
            <p className="text-xs text-muted-foreground">Consecutive days accomplishing at least one habit</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <CardDescription>Your habit completion over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px]">
            <ChartContainer
              config={{
                completed: {
                  label: "Completed",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} domain={[0, Math.max(stats.totalHabits, 5)]} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(label) => {
                          const item = stats.weeklyData.find((d) => d.day === label)
                          return item ? new Date(item.date).toLocaleDateString() : label
                        }}
                      />
                    }
                  />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Completion rate by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.categoryStats.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {category.completed} / {category.total}
                  </div>
                </div>
                <Progress value={category.rate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

