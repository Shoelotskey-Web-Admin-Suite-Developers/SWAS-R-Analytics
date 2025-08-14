"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
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

export const description = "A simple area chart"

interface ChartLineLinearProps {
  selectedBranches: string[]; // IDs of selected branches
}

// Raw data without total
const rawData = [
  { month: "January", smVal: 400, val: 350, smGrand: 450 },
  { month: "February", smVal: 500, val: 300, smGrand: 550 },
  { month: "March", smVal: 550, val: 400, smGrand: 550 },
  { month: "April", smVal: 350, val: 300, smGrand: 450 },
  { month: "May", smVal: 500, val: 350, smGrand: 550 },
  { month: "June", smVal: 450, val: 350, smGrand: 500 },
]

// Compute total for each month
const chartData = rawData.map(item => ({
  ...item,
  total: item.smVal + item.val + item.smGrand
}))

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

export function ChartAreaDefault({ selectedBranches }: ChartLineLinearProps) {
  // Apply branch filtering like in your line chart
  const filteredData = chartData.map(item => ({
    month: item.month,
    smVal: selectedBranches.includes("1") || selectedBranches.length === 0 ? item.smVal : null,
    val: selectedBranches.includes("2") || selectedBranches.length === 0 ? item.val : null,
    smGrand: selectedBranches.includes("3") || selectedBranches.length === 0 ? item.smGrand : null,
    total: selectedBranches.includes("4") || selectedBranches.length === 0 ? item.total : null,
  }))

  return (
    <Card className="rounded-3xl">
      <CardHeader className="items-start gap-2 text-sm">
        <CardTitle><h2>Sales Over Time</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          style={{ width: "100%", height: "200px" }}
        >
          <AreaChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              tickCount={5}
              width={40}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Sales",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "var(--foreground)",
                  fontSize: "14px",
                  fontFamily: "'Inter Regular', sans-serif",
                },
              }}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="line" />}
            />

            <defs>
              <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="smValGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="valGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="smGrandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
              </linearGradient>
            </defs>

            <Area dataKey="total" type="natural" fill="url(#totalGradient)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4, stroke: "hsl(var(--chart-1))", strokeWidth: 2, fill: "white" }} />
            <Area dataKey="smVal" type="natural" fill="url(#smValGradient)" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4, stroke: "hsl(var(--chart-2))", strokeWidth: 2, fill: "white" }} />
            <Area dataKey="val" type="natural" fill="url(#valGradient)" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4, stroke: "hsl(var(--chart-3))", strokeWidth: 2, fill: "white" }} />
            <Area dataKey="smGrand" type="natural" fill="url(#smGrandGradient)" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 4, stroke: "hsl(var(--chart-4))", strokeWidth: 2, fill: "white" }} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex flex-row w-full items-center gap-2 text-sm justify-between pl-8">
          <h6>Date Range:</h6>
          <Input type="date" className="w-[113px]"/>
          <h4>-</h4>
          <Input type="date" className="w-[113px]"/>
        </div>
      </CardFooter>
    </Card>
  )
}
