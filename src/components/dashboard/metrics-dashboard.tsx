import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wallet, TrendingUp } from 'lucide-react';

const metrics = [
  {
    icon: Users,
    title: 'Total Users',
    value: '1,234',
    change: '+15.2% this month',
  },
  {
    icon: Wallet,
    title: 'Active Subscribers',
    value: '876',
    change: '+12.1% this month',
  },
  {
    icon: TrendingUp,
    title: 'Monthly Revenue',
    value: '$4,321',
    change: '+8.5% this month',
  },
];

export function MetricsDashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
