
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, Legend, Area, AreaChart } from 'recharts';

interface Metrics {
  leads: number;
  qualifiedLeads: number;
  siteVisits: number;
  bookings: number;
  cpl: number;
  cpql: number;
  cpsv: number;
  cpb: number;
  totalBudget: number;
}

interface EnhancedChartsProps {
  metrics: Metrics;
  chartData: any[];
  duration: string;
}

const COLORS = ['#ec4899', '#8b5cf6', '#f59e0b'];

const EnhancedCharts: React.FC<EnhancedChartsProps> = ({ metrics, chartData, duration }) => {
  // Data for donut chart showing conversion funnel (without bookings)
  const conversionData = [
    { name: 'Leads', value: metrics.leads, color: '#1ea34f' },
    { name: 'Qualified Leads', value: metrics.qualifiedLeads, color: '#06aed7' },
    { name: 'Site Visits', value: metrics.siteVisits, color: '#eb7311' }
  ];

  // Generate proper time-series data based on the duration and metrics
  const generateTimeSeriesData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const numPoints = duration === '12 Months' ? 12 : duration === '6 Months' ? 6 : 3;
    
    const data = [];
    for (let i = 0; i < numPoints; i++) {
      const monthIndex = (new Date().getMonth() - numPoints + 1 + i + 12) % 12;
      const variationFactor = 0.7 + Math.random() * 0.6; // Random variation between 70% and 130%
      
      data.push({
        month: monthNames[monthIndex],
        leads: Math.round(metrics.leads * variationFactor / numPoints * (i + 1)),
        qualifiedLeads: Math.round(metrics.qualifiedLeads * variationFactor / numPoints * (i + 1)),
        siteVisits: Math.round(metrics.siteVisits * variationFactor / numPoints * (i + 1)),
        bookings: Math.max(1, Math.round(metrics.bookings * variationFactor / numPoints * (i + 1))),
        cpl: Math.round(metrics.cpl * (1 + (Math.random() - 0.5) * 0.3)) // CPL with ±15% variation
      });
    }
    return data;
  };

  const enhancedChartData = generateTimeSeriesData();

  // Custom tooltip for donut chart
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = conversionData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white backdrop-blur-lg border border-gray-200 rounded-lg p-3 text-gray-800 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-lg">{data.value.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Conversion Funnel Donut Chart */}
      <Card className="bg-white/95 backdrop-blur-lg border-none shadow-lg rounded-2xl card-hover">
        <CardHeader>
          <h3 className="text-lg font-bold text-foreground text-center">Conversion Funnel</h3>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3">
              {conversionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-foreground text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend Chart */}
      <Card className="bg-white/95 backdrop-blur-lg border-none shadow-lg rounded-2xl card-hover">
        <CardHeader>
          <h3 className="text-lg font-bold text-foreground text-center">
            Performance Trend Over {duration}
          </h3>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enhancedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    color: '#374151'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#374151' }}
                />
                
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#1ea34f"
                  strokeWidth={3}
                  dot={{ fill: '#1ea34f', strokeWidth: 2, r: 4 }}
                  name="Leads"
                  animationBegin={0}
                  animationDuration={2000}
                />
                <Line
                  type="monotone"
                  dataKey="qualifiedLeads"
                  stroke="#06aed7"
                  strokeWidth={3}
                  dot={{ fill: '#06aed7', strokeWidth: 2, r: 4 }}
                  name="Qualified Leads"
                  animationBegin={500}
                  animationDuration={2000}
                />
                <Line
                  type="monotone"
                  dataKey="siteVisits"
                  stroke="#eb7311"
                  strokeWidth={3}
                  dot={{ fill: '#eb7311', strokeWidth: 2, r: 4 }}
                  name="Site Visits"
                  animationBegin={1000}
                  animationDuration={2000}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#754c9b"
                  strokeWidth={3}
                  dot={{ fill: '#754c9b', strokeWidth: 2, r: 4 }}
                  name="Bookings"
                  animationBegin={1500}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCharts;
