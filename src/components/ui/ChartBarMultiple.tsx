"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Multiple bar chart for branch sales"

interface ChartBarMultipleProps {
  selectedBranches: string[]; // IDs of selected branches
}

const rawData = [
  { month: "January", smVal: 400, val: 350, smGrand: 450 },
  { month: "February", smVal: 500, val: 300, smGrand: 550 },
  { month: "March", smVal: 550, val: 400, smGrand: 550 },
  { month: "April", smVal: 350, val: 300, smGrand: 450 },
  { month: "May", smVal: 500, val: 350, smGrand: 550 },
  { month: "June", smVal: 450, val: 350, smGrand: 500 },
  { month: "July", smVal: 0, val: 0, smGrand: 0 },
  { month: "August", smVal: 0, val: 0, smGrand: 0 },
  { month: "September", smVal: 0, val: 0, smGrand: 0 },
  { month: "October", smVal: 0, val: 0, smGrand: 0 },
  { month: "November", smVal: 0, val: 0, smGrand: 0 },
  { month: "December", smVal: 0, val: 0, smGrand: 0 },
]

// Map branch IDs to keys in data
const branchMap: Record<string, keyof typeof rawData[0]> = {
  "1": "smVal",
  "2": "val",
  "3": "smGrand",
  "4": "total"
}

const chartConfig = {
  total: {
    label: "SM Total of Branches",
    color: "var(--chart-1)",
  },
  smVal: {
    label: "SM Valenzuela",
    color: "var(--chart-2)",
  },
  val: {
    label: "Valenzuela",
    color: "var(--chart-3)",
  },
  smGrand: {
    label: "SM Grand",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function ChartBarMultiple({ selectedBranches }: ChartBarMultipleProps) {
  // Add computed total
  const dataWithTotal = rawData.map(item => ({
    ...item,
    total: item.smVal + item.val + item.smGrand
  }))

  // Apply filtering
  const filteredData = dataWithTotal.map(item => {
    const newItem: typeof item = { ...item }
    Object.entries(branchMap).forEach(([branchId, key]) => {
      if (!selectedBranches.includes(branchId) && selectedBranches.length > 0) {
        newItem[key] = null
      }
    })
    return newItem
  })
  
  // Filter only relevant keys for rendering bars
  const barsToRender =
    selectedBranches.length > 0
      ? selectedBranches.map(id => branchMap[id])
      : Object.values(branchMap)

  return (
    <Card className="rounded-3xl mt-5 mb-5">
      <CardHeader>
        <CardTitle><h3>Monthly Growth Rate</h3></CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ width: "1340px", height: "160px" }}>
          <BarChart accessibilityLayer data={dataWithTotal} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {barsToRender.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`hsl(${chartConfig[key].color})`}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}