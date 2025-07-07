import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';
import { getCPLForLocation } from '@/data/cplData';
import EnhancedCharts from './EnhancedCharts';

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

const LeadCalculator = () => {
  const [propertyType, setPropertyType] = useState('Residential');
  const [launchType, setLaunchType] = useState('Launch');
  const [location, setLocation] = useState('Mumbai South');
  const [bhk, setBhk] = useState('2 BHK');
  const [marketingChannels, setMarketingChannels] = useState('Google');
  const [sellUnits, setSellUnits] = useState(50);
  const [duration, setDuration] = useState('6 Months');

  const [metrics, setMetrics] = useState<Metrics>({
    leads: 8333,
    qualifiedLeads: 1833,
    siteVisits: 500,
    bookings: 50,
    cpl: 2160,
    cpql: 9819,
    cpsv: 35999,
    cpb: 359986,
    totalBudget: 17999280
  });

  const calculateMetrics = () => {
    // Get actual CPL from the data based on location and BHK
    const actualCPL = getCPLForLocation(location, bhk);
    
    // Base calculations with realistic multipliers based on form inputs
    const baseLeads = sellUnits * 167;
    const locationMultiplier = location.includes('Mumbai') ? 1.5 : 
                             location.includes('Delhi') ? 1.3 :
                             location.includes('Bangalore') ? 1.2 : 
                             location.includes('Chennai') ? 1.0 : 
                             location.includes('Hyderabad') ? 0.9 : 0.8;
    
    const bhkMultiplier = bhk === '1 RK' ? 0.7 : 
                         bhk === '1 BHK' ? 0.8 : 
                         bhk === '2 BHK' ? 1.0 : 
                         bhk === '3 BHK' ? 1.2 : 
                         bhk === '4 BHK' ? 1.4 : 
                         bhk === '5 BHK' ? 1.6 : 
                         bhk.includes('Plot') ? 1.1 : 
                         bhk === 'Villa' ? 1.8 : 1.0;
    
    const channelMultiplier = marketingChannels.includes('Google') ? 1.3 : 
                             marketingChannels.includes('+') ? 1.1 : 1.0;
    
                             
    const cplMult = marketingChannels.includes('+') ? 0 : 257;
    const propertyMultiplier = propertyType === 'Villa' ? 1.5 :
                              propertyType === 'Commercial' ? 1.3 :
                              propertyType === 'Senior Living' ? 0.8 : 1.0;
    
    const launchMultiplier = launchType === 'Teaser' ? 0.7 :
                            launchType === 'Launch' ? 1.0 :
                            launchType === 'Sustenance' ? 0.9 :
                            launchType === 'NRI' ? 1.2 : 1.0;
    
    
    // Use actual CPL from data
    let cpl = marketingChannels.includes('+')? actualCPL:
                marketingChannels.includes('Google') ? actualCPL+cplMult : actualCPL-cplMult;
    cpl=Math.round(cpl*locationMultiplier);
    if(cpl<300){
      cpl=cpl+200;
    }
    const leads = Math.round(baseLeads * locationMultiplier * bhkMultiplier * channelMultiplier * propertyMultiplier * launchMultiplier);  
    const qualifiedLeads = Math.round(leads * 0.3);
    const siteVisits = Math.round(qualifiedLeads * 0.27);
    const bookings = sellUnits;
    
    const cpql = Math.round(cpl / 0.22);
    
    const totalBudget = leads * cpl;
    
    const cpsv = Math.round(totalBudget / siteVisits);
    const cpb = Math.round(cpsv * (siteVisits / bookings));

    setMetrics({
      leads,
      qualifiedLeads,
      siteVisits,
      bookings,
      cpl,
      cpql,
      cpsv,
      cpb,
      totalBudget
    });
  };

  useEffect(() => {
    calculateMetrics();
  }, [propertyType, launchType, location, bhk, marketingChannels, sellUnits, duration]);

  // Generate chart data based on duration and strategy
  const generateChartData = () => {
    const durationMap: { [key: string]: number } = {
      '15 Days': 0.5,
      '1 Month': 1,
      '2 Months': 2,
      '3 Months': 3,
      '4 Months': 4,
      '5 Months': 5,
      '6 Months': 6,
      '7 Months': 7,
      '8 Months': 8
    };
    
    const monthCount = durationMap[duration] || 6;
    const marketingMultiplier = marketingChannels.includes('+') ? 1.1 : 
                               marketingChannels.includes('Google') ? 1.2 : 1.0;
    
    const chartData = [];
    const timePoints = Math.max(Math.ceil(monthCount), 3);
    
    for (let i = 1; i <= timePoints; i++) {
      const baseProgress = i / timePoints;
      const adjustedProgress = Math.pow(baseProgress, 0.7) * marketingMultiplier;
      
      const timeLabel = monthCount < 1 ? `Week ${i}` : 
                       monthCount === 1 ? `Week ${i}` : 
                       `Month ${i}`;
      
      chartData.push({
        month: timeLabel,
        leads: Math.round(metrics.leads * Math.min(adjustedProgress, 1)),
        qualifiedLeads: Math.round(metrics.qualifiedLeads * Math.min(adjustedProgress, 1)),
        siteVisits: Math.round(metrics.siteVisits * Math.min(adjustedProgress, 1)),
        bookings: Math.round(metrics.bookings * Math.min(adjustedProgress, 1))
      });
    }
    
    return chartData;
  };

  const chartData = generateChartData();

  const handleSellUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setSellUnits(Math.max(1, value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded mr-3"></div>
            <span className="text-purple-400 font-semibold text-sm tracking-wider uppercase">Lead Calculator</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Let's Show You Just How Far Your<br />
            Growth Can Go <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">With Us</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-4xl mx-auto">
            Input your data, and let our ROI-driven strategies show you the scalable growth we can deliver. Precise, data-backed insights to fuel your next big move.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6 space-y-6">
                {/* Property Type */}
                <div>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Senior Living">Senior Living</SelectItem>
                      <SelectItem value="Plots">Plots</SelectItem>
                      <SelectItem value="Shops cum Offices">Shops cum Offices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Launch Type and Location */}
                <div className="grid grid-cols-2 gap-4">
                  <Select value={launchType} onValueChange={setLaunchType}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="Teaser">Teaser</SelectItem>
                      <SelectItem value="Launch">Launch</SelectItem>
                      <SelectItem value="Sustenance">Sustenance</SelectItem>
                      <SelectItem value="NRI">NRI</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="Bangalore East">Bangalore East</SelectItem>
                      <SelectItem value="Bangalore North">Bangalore North</SelectItem>
                      <SelectItem value="Bangalore South">Bangalore South</SelectItem>
                      <SelectItem value="Bangalore West">Bangalore West</SelectItem>
                      <SelectItem value="Chennai Central">Chennai Central</SelectItem>
                      <SelectItem value="Chennai East">Chennai East</SelectItem>
                      <SelectItem value="Chennai North">Chennai North</SelectItem>
                      <SelectItem value="Chennai Outer East">Chennai Outer East</SelectItem>
                      <SelectItem value="Chennai Outer North">Chennai Outer North</SelectItem>
                      <SelectItem value="Chennai Outer South">Chennai Outer South</SelectItem>
                      <SelectItem value="Chennai Outer West">Chennai Outer West</SelectItem>
                      <SelectItem value="Chennai South">Chennai South</SelectItem>
                      <SelectItem value="Chennai Suburb">Chennai Suburb</SelectItem>
                      <SelectItem value="Chennai West">Chennai West</SelectItem>
                      <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Greater Noida">Greater Noida</SelectItem>
                      <SelectItem value="Gujarat - Ahmedabad">Gujarat - Ahmedabad</SelectItem>
                      <SelectItem value="Gujarat - Rajkot">Gujarat - Rajkot</SelectItem>
                      <SelectItem value="Gujarat - Surat">Gujarat - Surat</SelectItem>
                      <SelectItem value="Gujarat - Vadodra">Gujarat - Vadodra</SelectItem>
                      <SelectItem value="Gurugram">Gurugram</SelectItem>
                      <SelectItem value="Hyderabad East">Hyderabad East</SelectItem>
                      <SelectItem value="Hyderabad North">Hyderabad North</SelectItem>
                      <SelectItem value="Hyderabad South">Hyderabad South</SelectItem>
                      <SelectItem value="Hyderabad West">Hyderabad West</SelectItem>
                      <SelectItem value="Kolkata Central">Kolkata Central</SelectItem>
                      <SelectItem value="Kolkata East">Kolkata East</SelectItem>
                      <SelectItem value="Kolkata New">Kolkata New</SelectItem>
                      <SelectItem value="Kolkata North">Kolkata North</SelectItem>
                      <SelectItem value="Kolkata South">Kolkata South</SelectItem>
                      <SelectItem value="Kolkata West">Kolkata West</SelectItem>
                      <SelectItem value="Lucknow">Lucknow</SelectItem>
                      <SelectItem value="Mangalore">Mangalore</SelectItem>
                      <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                      <SelectItem value="Mumbai East">Mumbai East</SelectItem>
                      <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                      <SelectItem value="Mumbai South">Mumbai South</SelectItem>
                      <SelectItem value="Nashik">Nashik</SelectItem>
                      <SelectItem value="New Delhi Central">New Delhi Central</SelectItem>
                      <SelectItem value="New Delhi East">New Delhi East</SelectItem>
                      <SelectItem value="New Delhi North">New Delhi North</SelectItem>
                      <SelectItem value="New Delhi South">New Delhi South</SelectItem>
                      <SelectItem value="New Delhi West">New Delhi West</SelectItem>
                      <SelectItem value="Noida">Noida</SelectItem>
                      <SelectItem value="Noida Central">Noida Central</SelectItem>
                      <SelectItem value="Pune">Pune</SelectItem>

                    </SelectContent>
                  </Select>
                </div>

                {/* BHK and Marketing Channels */}
                <div className="grid grid-cols-2 gap-4">
                  <Select value={bhk} onValueChange={setBhk}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="1 RK">1 RK</SelectItem>
                      <SelectItem value="1 BHK">1 BHK</SelectItem>
                      <SelectItem value="2 BHK">2 BHK</SelectItem>
                      <SelectItem value="3 BHK">3 BHK</SelectItem>
                      <SelectItem value="4 BHK">4 BHK</SelectItem>
                      <SelectItem value="5 BHK">5 BHK</SelectItem>
                      <SelectItem value="Plot Size 1000 Sq - 2000 Sq">Plot Size 1000 Sq - 2000 Sq</SelectItem>
                      <SelectItem value="Plot Size 2000 Sq - 4000 Sq">Plot Size 2000 Sq - 4000 Sq</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={marketingChannels} onValueChange={setMarketingChannels}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="Google">Google Ads</SelectItem>
                      <SelectItem value="Meta">Meta Ads</SelectItem>
                      <SelectItem value="G+M">Google Ads+Meta Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sell Units Input and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">Sell Units</label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                        onClick={() => setSellUnits(Math.max(1, sellUnits - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={sellUnits}
                        onChange={handleSellUnitsChange}
                        min="1"
                        className="bg-white/20 border-white/30 text-white text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-white/20 border-white/30 text-white hover:bg-white/30"
                        onClick={() => setSellUnits(sellUnits + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">Duration</label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="15 Days">15 Days</SelectItem>
                        <SelectItem value="1 Month">1 Month</SelectItem>
                        <SelectItem value="2 Months">2 Months</SelectItem>
                        <SelectItem value="3 Months">3 Months</SelectItem>
                        <SelectItem value="4 Months">4 Months</SelectItem>
                        <SelectItem value="5 Months">5 Months</SelectItem>
                        <SelectItem value="6 Months">6 Months</SelectItem>
                        <SelectItem value="7 Months">7 Months</SelectItem>
                        <SelectItem value="8 Months">8 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-xs text-gray-400 pt-4 border-t border-white/20">
                  <p><strong>Disclaimer:</strong> The data presented is based on past experience and is provided for informational purposes only.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Metrics and Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400">{metrics.leads.toLocaleString()}</div>
                  <div className="text-sm text-purple-300">Leads</div>
                  <div className="text-lg font-semibold text-white mt-2">₹{metrics.cpl.toLocaleString()}</div>
                  <div className="text-xs text-gray-300">CPL</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400">{metrics.qualifiedLeads.toLocaleString()}</div>
                  <div className="text-sm text-purple-300">QL</div>
                  <div className="text-lg font-semibold text-white mt-2">₹{metrics.cpql.toLocaleString()}</div>
                  <div className="text-xs text-gray-300">CPQL</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400">{metrics.siteVisits.toLocaleString()}</div>
                  <div className="text-sm text-purple-300">SV</div>
                  <div className="text-lg font-semibold text-white mt-2">₹{metrics.cpsv.toLocaleString()}</div>
                  <div className="text-xs text-gray-300">CPSV</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400">{metrics.bookings}</div>
                  <div className="text-sm text-purple-300">Bookings</div>
                  <div className="text-lg font-semibold text-white mt-2">₹{(metrics.cpb / 100000).toFixed(2)}L</div>
                  <div className="text-xs text-gray-300">CPB</div>
                </CardContent>
              </Card>
            </div>

            {/* Total Budget */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    ₹{metrics.totalBudget.toLocaleString('en-IN')}
                  </div>
                  <div className="text-lg text-purple-300">
                    Total Budget
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Charts */}
            <EnhancedCharts 
              metrics={metrics} 
              chartData={chartData} 
              duration={duration} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCalculator;
