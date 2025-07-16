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

const EnhancedCharts: React.FC<EnhancedChartsProps> = ({ metrics, chartData, duration }) => {
  const conversionData = [
    { name: 'Leads', value: metrics.leads, color: '#1ea34f' },
    { name: 'Qualified Leads', value: metrics.qualifiedLeads, color: '#06aed7' },
    { name: 'Site Visits', value: metrics.siteVisits, color: '#eb7311' },
  ];

  const generateTimeSeriesData = () => {
    const periods = parseInt(duration.split(' ')[0]);
    const timeUnit = duration.includes('Month') ? 'Month' : duration.includes('Week') ? 'Week' : 'Day';
    const data = [];

    if (periods === 1 && timeUnit === 'Month') {
      for (let i = 1; i <= 4; i++) {
        const growthFactor = i / 4;
        data.push({
          month: `Week ${i}`,
          leads: Math.round((metrics.leads * 0.3) + (metrics.leads * 0.7 * growthFactor)),
          siteVisits: Math.round((metrics.siteVisits * 0.2) + (metrics.siteVisits * 0.8 * growthFactor)),
          bookings: Math.round((metrics.bookings * 0.4) + (metrics.bookings * 0.6 * growthFactor)),
          cpl: metrics.cpl
        });
      }
    } else {
      const actualPeriods = Math.max(periods, 2);
      for (let i = 1; i <= actualPeriods; i++) {
        const growthFactor = i / actualPeriods;
        data.push({
          month: `${timeUnit} ${i}`,
          leads: Math.round((metrics.leads * 0.3) + (metrics.leads * 0.7 * growthFactor)),
          siteVisits: Math.round((metrics.siteVisits * 0.2) + (metrics.siteVisits * 0.8 * growthFactor)),
          bookings: Math.round((metrics.bookings * 0.4) + (metrics.bookings * 0.6 * growthFactor)),
          cpl: metrics.cpl
        });
      }
    }

    return data;
  };

  const enhancedChartData = generateTimeSeriesData();

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-foreground text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/95 backdrop-blur-lg border-none shadow-lg rounded-2xl card-hover">
        <CardHeader>
          <h3 className="text-lg font-bold text-foreground text-center">
            Performance Trend Over {duration}
          </h3>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enhancedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1ea34f" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1ea34f" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="siteVisitsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eb7311" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#eb7311" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#754c9b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#754c9b" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="cplGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0bc00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f0bc00" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
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
                
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#1ea34f"
                  strokeWidth={3}
                  fill="url(#leadsGradient)"
                  name="Leads"
                  animationBegin={0}
                  animationDuration={2000}
                />
                <Area
                  type="monotone"
                  dataKey="siteVisits"
                  stroke="#eb7311"
                  strokeWidth={3}
                  fill="url(#siteVisitsGradient)"
                  name="Site Visits"
                  animationBegin={500}
                  animationDuration={2000}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#754c9b"
                  strokeWidth={3}
                  fill="url(#bookingsGradient)"
                  name="Bookings"
                  animationBegin={1000}
                  animationDuration={2000}
                />
                <Area
                  type="monotone"
                  dataKey="cpl"
                  stroke="#f0bc00"
                  strokeWidth={3}
                  fill="url(#cplGradient)"
                  name="CPL"
                  animationBegin={1500}
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCharts;
