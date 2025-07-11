
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, Legend,  Area, AreaChart } from 'recharts';

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

  // Generate realistic time-series data based on duration
  const generateTimeSeriesData = () => {
    const periods = parseInt(duration.split(' ')[0]);
    const timeUnit = duration.includes('Month') ? 'Month' : duration.includes('Week') ? 'Week' : 'Day';
    
    const data = [];
    
    for (let i = 1; i <= periods; i++) {
      // Calculate growth factor (starts low, grows over time)
      const growthFactor = i / periods;
      
      // Generate leads with growth trend
      const leads = Math.round((metrics.leads * 0.3) + (metrics.leads * 0.7 * growthFactor));
      
      // Site visits grow faster than leads
      const siteVisits = Math.round((metrics.siteVisits * 0.2) + (metrics.siteVisits * 0.8 * growthFactor));
      
      // Bookings grow slower, more conservative
      const bookings = Math.round((metrics.bookings * 0.4) + (metrics.bookings * 0.6 * growthFactor));
      
      // CPL decreases over time as campaigns optimize (inverse growth)
      const cpl = Math.round(metrics.cpl * (1.3 - (0.3 * growthFactor)));
      
      data.push({
        month: `${timeUnit} ${i}`,
        leads,
        siteVisits,
        bookings,
        cpl
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
          <div className="h-64">
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
                  name="Leads"
                  dot={{ fill: '#1ea34f', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#1ea34f', strokeWidth: 2 }}
                  animationDuration={2000}
                />
                <Line
                  type="monotone"
                  dataKey="siteVisits"
                  stroke="#eb7311"
                  strokeWidth={3}
                  name="Site Visits"
                  dot={{ fill: '#eb7311', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#eb7311', strokeWidth: 2 }}
                  animationDuration={2000}
                  animationBegin={500}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#754c9b"
                  strokeWidth={3}
                  name="Bookings"
                  dot={{ fill: '#754c9b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#754c9b', strokeWidth: 2 }}
                  animationDuration={2000}
                  animationBegin={1000}
                />
                <Line
                  type="monotone"
                  dataKey="cpl"
                  stroke="#f0bc00"
                  strokeWidth={3}
                  name="CPL"
                  dot={{ fill: '#f0bc00', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f0bc00', strokeWidth: 2 }}
                  animationDuration={2000}
                  animationBegin={1500}
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
