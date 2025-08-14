"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format as formatDate } from "date-fns"

export const description = "A simple area chart"

interface ChartLineLinearProps {
  selectedBranches: string[];
}

// Generate dummy data for 3 months ending Aug 15 2024
const generateDummyData = () => {
  const data = []
  const endDate = new Date("2025-08-15")
  const startDate = new Date(endDate)
  startDate.setMonth(startDate.getMonth() - 3)

  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    data.push({
      date: currentDate.toISOString().split("T")[0],
      smVal: Math.floor(Math.random() * 200) + 300,
      val: Math.floor(Math.random() * 150) + 250,
      smGrand: Math.floor(Math.random() * 180) + 320
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return data
}

const rawData = generateDummyData()

// Compute total
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
  const [startDate, setStartDate] = useState(rawData[0].date)
  const [endDate, setEndDate] = useState(rawData[rawData.length - 1].date)

  // Filter by date range
  const filteredByDate = chartData.filter(item => {
    return (!startDate || item.date >= startDate) &&
           (!endDate || item.date <= endDate)
  })

  // Apply branch filtering
  const filteredData = filteredByDate.map(item => ({
    date: item.date,
    smVal: selectedBranches.includes("1") || selectedBranches.length === 0 ? item.smVal : null,
    val: selectedBranches.includes("2") || selectedBranches.length === 0 ? item.val : null,
    smGrand: selectedBranches.includes("3") || selectedBranches.length === 0 ? item.smGrand : null,
    total: selectedBranches.includes("4") || selectedBranches.length === 0 ? item.total : null,
  }))

  // Dynamically decide how many ticks to show
  const days = filteredData.length
  const intervalValue = days > 45 ? Math.ceil(days / 6) : 0

  // Determine tick indices that are displayed on XAxis
  const maxTicks = 6
  const tickIndices = filteredData
    .map((_, i) => i)
    .filter(i => i % Math.ceil(filteredData.length / maxTicks) === 0)

  // Dot renderer
  const renderDot = (props: any, color: string) => {
    const { index, cx, cy } = props
    if (tickIndices.includes(index)) {
      return <circle cx={cx} cy={cy} r={3} fill={color} />
    }
    return null
  }


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
            margin={{ left: 12, right: 12 }}
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
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tickFormatter={(value, index) => {
                const maxTicks = 6
                const shouldShow = index % Math.ceil(filteredData.length / maxTicks) === 0
                return shouldShow ? value.slice(5) : ""
              }}
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

            <Area dataKey="total" type="natural" fill="url(#totalGradient)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={(p) => renderDot(p, "hsl(var(--chart-1))")}/>
            <Area dataKey="smVal" type="natural" fill="url(#smValGradient)" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={(p) => renderDot(p, "hsl(var(--chart-2))")}/>
            <Area dataKey="val" type="natural" fill="url(#valGradient)" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={(p) => renderDot(p, "hsl(var(--chart-3))")}/>
            <Area dataKey="smGrand" type="natural" fill="url(#smGrandGradient)" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={(p) => renderDot(p, "hsl(var(--chart-4))")}/>
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between pl-8 text-sm">
          <h6>Date Range:</h6>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[260px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate && endDate
                  ? `${format(new Date(startDate), "MMM d, yyyy")} - ${format(
                      new Date(endDate),
                      "MMM d, yyyy"
                    )}`
                  : "Pick a date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: startDate ? new Date(startDate) : undefined,
                  to: endDate ? new Date(endDate) : undefined,
                }}
                onSelect={(range) => {
                  setStartDate(range?.from ? formatDate(range.from, "yyyy-MM-dd") : "")
                  setEndDate(range?.to ? formatDate(range.to, "yyyy-MM-dd") : "")
                }}
                numberOfMonths={1}
                fixedWeeks
                className="[--cell-size:1.8rem] p-2"
                disabled={(date) => {
                  const dateStr = formatDate(date, "yyyy-MM-dd")
                  return !rawData.some((d) => d.date === dateStr)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardFooter>
    </Card>
  )
}
