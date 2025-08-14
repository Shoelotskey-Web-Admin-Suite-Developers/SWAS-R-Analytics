"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis, ReferenceArea } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartLineLinearProps {
  selectedBranches: string[]; // IDs of selected branches
}

export const description = "A linear line chart"

// Base chart data
const rawChartData = [
  { date: "May 31", SMVal: 4200, SMValFC: 5300, Val: 1200, ValFC: 1300, SMGra: 800, SMGraFC: 700 },
  { date: "Jun 1",  SMVal: 8500, SMValFC: 9700, Val: 2000, ValFC: 2100, SMGra: 1500, SMGraFC: 1600 },
  { date: "Jun 2",  SMVal: 2300, SMValFC: 1500, Val: 900,  ValFC: 1000, SMGra: 700,  SMGraFC: 600 },
  { date: "Jun 3",  SMVal: 7900, SMValFC: 7700, Val: 1500, ValFC: 1400, SMGra: 1100, SMGraFC: 1000 },
  { date: "Jun 4",  SMVal: 6800, SMValFC: 6500, Val: 2000, ValFC: 2100, SMGra: 1200, SMGraFC: 1300 },
  { date: "Jun 5",  SMVal: 5400, SMValFC: 7500, Val: 1300, ValFC: 1200, SMGra: 900,  SMGraFC: 1000 },
  { date: "Jun 6",  SMVal: 1200, SMValFC: 1800, Val: 800,  ValFC: 900,  SMGra: 400,  SMGraFC: 500 },
  { date: "Jun 7",  SMValFC: 1400, ValFC: 900,  SMGraFC: 500 },
  { date: "Jun 8",  SMValFC: 1600, ValFC: 1100, SMGraFC: 600 },
  { date: "Jun 9",  SMValFC: 1500, ValFC: 800,  SMGraFC: 700 },
  { date: "Jun 10", SMValFC: 2000, ValFC: 1200, SMGraFC: 900 },
  { date: "Jun 11", SMValFC: 1700, ValFC: 1000, SMGraFC: 600 },
  { date: "Jun 12", SMValFC: 1800, ValFC: 900,  SMGraFC: 800 },
  { date: "Jun 13", SMValFC: 1500, ValFC: 1100, SMGraFC: 500 },
]

// Chart configuration
const chartConfig = {
  total: { label: "Total of Branches", color: "hsl(var(--chart-1))" },
  totalFC: { label: "Total of Branches Forecasted", color: "hsl(var(--chart-1))" },
  SMVal: { label: "SM Valenzuela", color: "hsl(var(--chart-2))" },
  SMValFC: { label: "SM Valenzuela Forecasted", color: "hsl(var(--chart-2))" },
  Val: { label: "Valenzuela", color: "hsl(var(--chart-3))" },
  ValFC: { label: "Valenzuela Forecasted", color: "hsl(var(--chart-3))" },
  SMGra: { label: "SM Grand", color: "hsl(var(--chart-4))" },
  SMGraFC: { label: "SM Grand Forecasted", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

// Hollow dot renderer for forecast lines
const hollowDot = (color: string) => (props: any) => {
  if (props.value === null || props.value === undefined) return null as unknown as React.ReactElement;
  const { cx, cy } = props
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill="white"
      stroke={color}
      strokeWidth={2}
      opacity={0.5}
    />
  )
}

export function ChartLineLinear({ selectedBranches }: ChartLineLinearProps) {
  // Compute totals
  const chartData = rawChartData.map((item, index) => ({
    ...item,
    total: index < 7
      ? (item.SMVal ?? 0) + (item.Val ?? 0) + (item.SMGra ?? 0)
      : null,
    totalFC: (item.SMValFC ?? 0) + (item.ValFC ?? 0) + (item.SMGraFC ?? 0),
  }))

  // Filter data based on selectedBranches
  const filteredData = chartData.map(item => {
    const filteredItem: any = { date: item.date }

    if (selectedBranches.includes("1") || selectedBranches.length === 0) {
      filteredItem.SMVal = item.SMVal
      filteredItem.SMValFC = item.SMValFC
    }
    if (selectedBranches.includes("2") || selectedBranches.length === 0) {
      filteredItem.Val = item.Val
      filteredItem.ValFC = item.ValFC
    }
    if (selectedBranches.includes("3") || selectedBranches.length === 0) {
      filteredItem.SMGra = item.SMGra
      filteredItem.SMGraFC = item.SMGraFC
    }
    if (selectedBranches.includes("4") || selectedBranches.length === 0) {
      filteredItem.total = item.total
      filteredItem.totalFC = item.totalFC
    }

    return filteredItem
  })

  const solidPct = 7 / (chartData.length - 1) // solid vs forecast

  return (
    <Card className="rounded-3xl">
      <CardHeader className="items-start gap-2 text-sm">
        <CardTitle><h2>Daily Revenue Trend</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ width: "900px", height: "250px" }}>
          <LineChart data={filteredData} margin={{ top: 12, right: 12, bottom: 25, left: 12 }}>
            <defs>
              <linearGradient id="lineUntilDash" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                <stop offset={`${solidPct * 100}%`} stopColor="hsl(var(--chart-1))" />
                <stop offset={`${solidPct * 100}%`} stopColor="transparent" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <pattern id="yellowStripes" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                <rect width="8" height="8" fill="#FFDB58" />
                <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="4" />
              </pattern>
            </defs>

            <CartesianGrid vertical stroke="#CCCCCC" strokeDasharray="3 3" />
            <YAxis 
              tickFormatter={(value) => (value === 0 ? "0" : `${value / 1000}k`)}
              tickCount={5}
              width={40}
              axisLine={false}
              tickLine={false}
              label={{ value: "Revenue", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "var(--foreground)", fontSize: 14 } }}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tickFormatter={(value) => value.replace(" ", "")}
              label={{ value: "Date", position: "insideBottom", offset: -20, style: { textAnchor: "middle", fill: "var(--foreground)", fontSize: 14 } }}
            />
            
            <ReferenceArea x1="Jun 6" x2="Jun 13" strokeOpacity={0} fill="#F0F0F0" />
            <ReferenceArea x1="Jun 6" x2="Jun 7" strokeOpacity={0} fill="url(#yellowStripes)" />

            <ChartTooltip cursor content={<ChartTooltipContent indicator="line" />} />

            {/* Actual values */}
            <Line dataKey="total" strokeWidth={2} stroke={chartConfig.total.color} dot />
            <Line dataKey="SMVal" strokeWidth={2} stroke={chartConfig.SMVal.color} dot />
            <Line dataKey="Val" strokeWidth={2} stroke={chartConfig.Val.color} dot />
            <Line dataKey="SMGra" strokeWidth={2} stroke={chartConfig.SMGra.color} dot />

            {/* Forecast values */}
            <Line dataKey="totalFC" strokeWidth={2} strokeDasharray="5 5" stroke={chartConfig.totalFC.color} dot={hollowDot(chartConfig.totalFC.color)} opacity={0.5}/>
            <Line dataKey="SMValFC" strokeWidth={2} strokeDasharray="5 5" stroke={chartConfig.SMValFC.color} dot={hollowDot(chartConfig.SMValFC.color)} opacity={0.5}/>
            <Line dataKey="ValFC" strokeWidth={2} strokeDasharray="5 5" stroke={chartConfig.ValFC.color} dot={hollowDot(chartConfig.ValFC.color)} opacity={0.5}/>
            <Line dataKey="SMGraFC" strokeWidth={2} strokeDasharray="5 5" stroke={chartConfig.SMGraFC.color} dot={hollowDot(chartConfig.SMGraFC.color)} opacity={0.5}/>
            
          </LineChart>
        </ChartContainer>
      </CardContent>

       <CardFooter className="justify-end gap-6 -mt-10">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="inline-block w-6 h-[2px] bg-black"></span>
          <span>Actual Data</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="inline-block w-6 h-[2px] border-b-2 border-black border-dashed"></span>
          <span>Forecasted Data</span>
        </div>
      </CardFooter>

    </Card>
  )
}
