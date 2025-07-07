
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
    { name: 'Leads', value: metrics.leads, color: '#ec4899' },
    { name: 'Qualified Leads', value: metrics.qualifiedLeads, color: '#8b5cf6' },
    { name: 'Site Visits', value: metrics.siteVisits, color: '#f59e0b' }
  ];

  // Enhanced chart data with CPL trend
  const enhancedChartData = chartData.map((item, index) => ({
    ...item,
    cpl: Math.round(metrics.cpl * (1 + (index * 0.05))) // Sample CPL variation over time
  }));

  // Custom tooltip for donut chart
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = conversionData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-3 text-white">
          <p className="font-semibold">{data.name}</p>
          <p className="text-lg">{data.value.toLocaleString()}</p>
          <p className="text-sm text-gray-300">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Donut Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conversion Funnel Donut Chart */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <h3 className="text-lg font-bold text-white text-center">Conversion Funnel</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {conversionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Timeline Chart with CPL and gradients */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <h3 className="text-lg font-bold text-white text-center">
              Performance Trend Over {duration}
            </h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enhancedChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="siteVisitsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="cplGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#d1d5db', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#d1d5db', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      color: 'white'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                  />
                  
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fill="url(#leadsGradient)"
                    name="Leads"
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="siteVisits"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fill="url(#siteVisitsGradient)"
                    name="Site Visits"
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#bookingsGradient)"
                    name="Bookings"
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpl"
                    stroke="#fbbf24"
                    strokeWidth={3}
                    fill="url(#cplGradient)"
                    name="CPL"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedCharts;
