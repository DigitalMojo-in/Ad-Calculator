import React from 'react';
import {
  Card, CardContent, CardHeader,
} from '@/components/ui/card';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, Line, XAxis, YAxis, Legend,
} from 'recharts';

/* ---------- interfaces ---------------------------------- */
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

/* --------------------------------------------------------- */
const EnhancedCharts: React.FC<EnhancedChartsProps> = ({
  metrics, chartData, duration,
}) => {
  /* ► Conversion-funnel data for donut */
  const conversionData = [
    { name: 'Leads',           value: metrics.leads,          color: '#1ea34f' },
    { name: 'Qualified Leads', value: metrics.qualifiedLeads, color: '#06aed7' },
    { name: 'Site Visits',     value: metrics.siteVisits,     color: '#eb7311' },
  ];

  /* ► Freeze CPL at same value for every point */
  const trendData = chartData.map((d) => ({
    ...d,
    cpl: metrics.cpl,
  }));

  /* ► Donut-chart tooltip */
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    const total = conversionData.reduce((s, v) => s + v.value, 0);
    const pct = ((d.value / total) * 100).toFixed(1);

    return (
      <div className="bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg border text-gray-800">
        <p className="font-semibold">{d.name}</p>
        <p className="text-lg">{d.value.toLocaleString()}</p>
        <p className="text-sm text-gray-600">{pct}% of total</p>
      </div>
    );
  };

  /* ======================================================== */
  return (
    <div className="space-y-4">
      {/* ---------- Donut / conversion funnel ------------- */}
      <Card className="bg-white/95 backdrop-blur-lg shadow-lg rounded-2xl border-none card-hover">
        <CardHeader>
          <h3 className="text-lg font-bold text-center">Conversion&nbsp;Funnel</h3>
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
                  >
                    {conversionData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend dots */}
            <div className="flex flex-col gap-3">
              {conversionData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="block w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-sm">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Performance trend -------------------- */}
      <Card className="bg-white/95 backdrop-blur-lg shadow-lg rounded-2xl border-none card-hover">
        <CardHeader>
          <h3 className="text-lg font-bold text-center">
            Performance Trend&nbsp;Over&nbsp;{duration}
          </h3>
        </CardHeader>

        <CardContent className="p-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 8, bottom: 5 }}>
                {/* gradients for the filled areas */}
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1ea34f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1ea34f" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eb7311" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eb7311" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gBook" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#754c9b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#754c9b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#6b7280', fontSize:12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill:'#6b7280', fontSize:12 }} />
                <Tooltip
                  contentStyle={{
                    background:'rgba(255,255,255,.95)',
                    borderRadius:12,
                    border:'none',
                    boxShadow:'0 10px 40px rgba(0,0,0,.1)',
                    color:'#374151',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ color:'#374151' }} />

                {/* Filled Areas */}
                <Area type="monotone" dataKey="leads"      stroke="#1ea34f" strokeWidth={3} fill="url(#gLeads)"  name="Leads"       />
                <Area type="monotone" dataKey="siteVisits" stroke="#eb7311" strokeWidth={3} fill="url(#gVisits)" name="Site Visits"/>
                <Area type="monotone" dataKey="bookings"   stroke="#754c9b" strokeWidth={3} fill="url(#gBook)"   name="Bookings"   />

                {/* Constant CPL line */}
                <Line
                  type="monotone"
                  dataKey="cpl"
                  stroke="#f0bc00"
                  strokeWidth={3}
                  strokeDasharray="6 5"
                  dot={false}
                  isAnimationActive={false}
                  name={`CPL (₹${metrics.cpl.toLocaleString()})`}
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
