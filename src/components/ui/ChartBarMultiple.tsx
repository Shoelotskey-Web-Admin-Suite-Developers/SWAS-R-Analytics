"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import { format } from "date-fns"

export const description = "Multiple bar chart for branch sales"

interface ChartBarMultipleProps {
  selectedBranches: string[]; // IDs of selected branches
}

// Example real data
const rawData = [
  { month: "2025-01", SMVal: 40000, Val: 38000, SMGra: 37000, total: 115000 },
  { month: "2025-02", SMVal: 42000, Val: 36000, SMGra: 39000, total: 117000 },
  { month: "2025-03", SMVal: 45000, Val: 40000, SMGra: 38000, total: 123000 },
  { month: "2025-04", SMVal: 0, Val: 0, SMGra: 0, total: 0 },
  { month: "2025-05", SMVal: 0, Val: 0, SMGra: 0, total: 0 },
]

// Map branch IDs to keys in data
const branchMap: Record<string, keyof typeof rawData[0]> = {
  "1": "SMVal",
  "2": "Val",
  "3": "SMGra",
  "4": "total",
}

const chartConfig = {
  total: {
    label: "SM Total of Branches",
    color: "var(--chart-1)",
  },
  SMVal: {
    label: "SM Valenzuela",
    color: "var(--chart-2)",
  },
  Val: {
    label: "Valenzuela",
    color: "var(--chart-3)",
  },
  SMGra: {
    label: "SM Grand",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function ChartBarMultiple({ selectedBranches }: ChartBarMultipleProps) {
  // Apply filtering
  const filteredData = rawData.map(item => {
    const newItem: typeof item = { ...item }
    Object.entries(branchMap).forEach(([branchId, key]) => {
      if (!selectedBranches.includes(branchId) && selectedBranches.length > 0) {
        newItem[key] = null
      }
    })
    return newItem
  })

  // Determine which bars to render (default order when no selection)
  const barsToRender =
    selectedBranches.length > 0
      ? selectedBranches.map(id => branchMap[id])
      : ["total", "SMVal", "Val", "SMGra"]

  return (
    <Card className="rounded-3xl mt-5 mb-5">
      <CardHeader>
        <CardTitle><h3>Monthly Growth Rate</h3></CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ width: "1340px", height: "160px" }}>
          <BarChart accessibilityLayer data={filteredData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickCount={5}
              width={60}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Revenue (₱)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "var(--foreground)", fontSize: 14 }
              }}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => format(new Date(value + "-01"), "MMM")}
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
