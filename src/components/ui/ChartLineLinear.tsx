"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A linear line chart"

const chartData = [
  { date: "May 31", desktop: 180 },
  { date: "Jun 1", desktop: 190 },
  { date: "Jun 2", desktop: 220 },
  { date: "Jun 3", desktop: 210 },
  { date: "Jun 4", desktop: 230 },
  { date: "Jun 5", desktop: 250 },
  { date: "Jun 6", desktop: 240 },
  { date: "Jun 7", desktop: 260 },
  { date: "Jun 8", desktop: 270 },
  { date: "Jun 9", desktop: 300 },
  { date: "Jun 10", desktop: 310 },
  { date: "Jun 11", desktop: 320 },
  { date: "Jun 12", desktop: 330 },
  { date: "Jun 13", desktop: 340 },
]


const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartLineLinear() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Revenue Trend</CardTitle>
        <CardDescription>7 days advanced forecast</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          
          style={{ width: "900px", height: "400px" }}
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tickFormatter={(value) => value.replace(" ", "")}

            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="desktop"
              type="linear"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
