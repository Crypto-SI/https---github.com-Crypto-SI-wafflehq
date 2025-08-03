"use client" // Charts are client components

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const chartData = [
  { month: 'January', price: 186 },
  { month: 'February', price: 305 },
  { month: 'March', price: 237 },
  { month: 'April', price: 273 },
  { month: 'May', price: 209 },
  { month: 'June', price: 214 },
];

const chartConfig = {
  price: {
    label: 'Price (USD)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function GemOfTheWeek() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>💎 Gem of the Week</CardTitle>
        <CardDescription>WaffleCoin (WFC) - Price last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center pb-4">
            <p className="text-4xl font-bold text-primary">$214.00</p>
            <p className="text-sm text-muted-foreground">+2.5% today</p>
        </div>
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <BarChart accessibilityLayer data={chartData}>
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
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="price" fill="var(--color-price)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
