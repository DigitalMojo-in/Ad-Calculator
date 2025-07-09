import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ChevronDown, Phone, Download, Calendar, Loader2 } from 'lucide-react';
import { getCPLForLocation } from '@/data/cplData';
import EnhancedCharts from './EnhancedCharts';
import { useToast } from '@/hooks/use-toast';

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

interface UserFormData {
  name: string;
  mobile: string;
}

const LeadCalculator = () => {
  const { toast } = useToast();
  const [propertyType, setPropertyType] = useState('Residential');
  const [launchType, setLaunchType] = useState('Launch');
  const [location, setLocation] = useState('Mumbai South');
  const [bhk, setBhk] = useState('2 BHK');
  const [marketingChannels, setMarketingChannels] = useState('Google');
  const [sellUnits, setSellUnits] = useState(50);
  const [duration, setDuration] = useState('6 Months');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({ name: '', mobile: '' });
  const [resultsUnlocked, setResultsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewResultsClicked, setViewResultsClicked] = useState(false);

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
    
    
    // Use constant CPL as specified
    let cpl = marketingChannels.includes('+')? actualCPL:
                marketingChannels.includes('Google') ? actualCPL+cplMult : actualCPL-cplMult;
    cpl=Math.round(cpl*locationMultiplier);
    if(cpl<300){
      cpl=cpl+200;
    }
    const leads = Math.round(baseLeads * locationMultiplier * bhkMultiplier * channelMultiplier * propertyMultiplier * launchMultiplier);  
    const qualifiedLeads = Math.round(leads * 0.3);
    const siteVisits = Math.round(qualifiedLeads * 0.2);
    const bookings = sellUnits;
    
    
    const totalBudget = leads * cpl;
    const cpql = Math.round(totalBudget/qualifiedLeads);
    
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
    // Ensure at least 2 data points for chart rendering
    const timePoints = Math.max(Math.ceil(monthCount), 2);
    
    for (let i = 1; i <= timePoints; i++) {
      const baseProgress = i / timePoints;
      const adjustedProgress = Math.pow(baseProgress, 0.7) * marketingMultiplier;
      
      const timeLabel = monthCount < 1 ? `Week ${i}` : `Month ${i}`;
      
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

  const handleUnlockResults = async () => {
    if (!formData.name || !formData.mobile) return;
    
    setIsLoading(true);
    const webAppURL = "https://script.google.com/macros/s/AKfycbzrzBr_M-Bm0d_9DXEVy0rJlI6TxKL1_kPvl5I55oDo5VWU6gXu96YHXk4_WXVIJV8R/exec";
  
    try {
      const response = await fetch(webAppURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.mobile,
        }),
      });
  
      await new Promise(resolve => setTimeout(resolve, 1500)); // Show loading for better UX
      
      setResultsUnlocked(true);
      setShowForm(false);
      setIsLoading(false);
      toast({
        title: "We will call you back soon! 😊",
        description: "Thank you for your interest. Our team will reach out to you shortly.",
      });
  
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (error) {
      setIsLoading(false);
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  const handleCTAClick = (actionType: string) => {
    toast({
      title: "We will call you back soon! 😊",
      description: `Thank you for your interest in ${actionType}. Our team will reach out to you shortly.`,
    });
  };

  const handleViewResults = () => {
    if (!viewResultsClicked) {
      setViewResultsClicked(true);
      setShowForm(true);
    }
  };

  const handleBookCall = () => {
    if (!resultsUnlocked) {
      setShowForm(true);
    } else {
      handleCTAClick("booking a free strategy call");
    }
  };

  return (
    <div className="min-h-screen hero-gradient relative">
      {/* Fixed Header with Logo */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-lg shadow-md border-b border-white/10 transition-all duration-300">
  <div className="container mx-auto px-6 py-3 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center space-x-3">
      <img 
        src="/lovable-uploads/afedbe6c-a3e2-418c-a2ca-bc16fc85bb8f.png" 
        alt="Digital Mojo Logo" 
        className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md"
      />
      <span className="text-white font-bold text-xl sm:text-2xl font-spartan tracking-wide">Digital Mojo</span>
    </div>

    {/* Nav Links */}
    <nav className="hidden md:flex items-center space-x-8 font-spartan">
      <a href="#calculator" className="text-white/90 hover:text-yellow-brand font-medium transition duration-200">Calculator</a>
      <a href="#results-section" className="text-white/90 hover:text-yellow-brand font-medium transition duration-200">Results</a>
      <a href="#clients" className="text-white/90 hover:text-yellow-brand font-medium transition duration-200">Clients</a>
    </nav>

    {/* CTA Button */}
    <Button 
      onClick={handleBookCall}
      className="bg-gradient-to-r from-yellow-brand to-yellow-400 text-black font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 font-spartan"
    >
      Book Now
    </Button>
  </div>
</header>


      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">

        {/* Hero Content */}
        <div className="text-center mb-16 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight font-spartan">
            Let's Show You Just How Far Your<br />
            Growth Can Go <span className="text-black">With Us</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-spartan">
            Data-driven insights. ROI that speaks. Let's build your growth story.
          </p>
          
          {/* Scroll Indicator */}
          <div className="scroll-indicator mt-12">
            <ChevronDown className="h-8 w-8 text-white/70 mx-auto" />
          </div>
        </div>

        {/* Calculator Section */}
        <div id="calculator" className="max-w-4xl mx-auto mb-16">
          <Card className="glass-card border-none shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              {/* Sell Units - Primary Input */}
              <div className="mb-8 text-center">
                <label className="text-foreground text-lg font-bold mb-4 block font-spartan">Units to Sell</label>
                <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-12 p-0 border-2 border-secondary hover:border-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                    onClick={() => setSellUnits(Math.max(1, sellUnits - 1))}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    value={sellUnits}
                    onChange={handleSellUnitsChange}
                    min="1"
                    className="bg-background border-2 border-secondary hover:border-primary focus:border-primary text-foreground text-center font-bold text-2xl rounded-xl h-16 text-center transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-12 p-0 border-2 border-secondary hover:border-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                    onClick={() => setSellUnits(sellUnits + 1)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Two Column Layout for Other Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Type */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Senior Living">Senior Living</SelectItem>
                      <SelectItem value="Plots">Plots</SelectItem>
                      <SelectItem value="Shops cum Offices">Shops cum Offices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Launch Type */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Launch Type</label>
                  <Select value={launchType} onValueChange={setLaunchType}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                      <SelectItem value="Teaser">Teaser</SelectItem>
                      <SelectItem value="Launch">Launch</SelectItem>
                      <SelectItem value="Sustenance">Sustenance</SelectItem>
                      <SelectItem value="NRI">NRI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border rounded-xl shadow-xl">
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

                {/* Configuration */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Configuration</label>
                  <Select value={bhk} onValueChange={setBhk}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border rounded-xl shadow-xl">
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
                </div>

                {/* Marketing Channels */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Marketing Channels</label>
                  <Select value={marketingChannels} onValueChange={setMarketingChannels}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                      <SelectItem value="Google">Google Ads</SelectItem>
                      <SelectItem value="Meta">Meta Ads</SelectItem>
                      <SelectItem value="G+M">Google Ads+Meta Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Duration</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border rounded-xl shadow-xl">
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

              {/* View Results Button */}
              <div className="text-center mt-8">
                <Button
                  onClick={handleViewResults}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {viewResultsClicked ? "Results Requested" : "View Results"}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-6 border-t border-border mt-6 font-spartan">
                <p><strong>Disclaimer:</strong> The data presented is based on past experience and is provided for informational purposes only.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section with Blur Overlay */}
        <div id="results-section" className="relative">
          {!resultsUnlocked && (
            <div className="absolute inset-0 z-20 blur-overlay rounded-3xl"></div>
          )}
          
          <div className={`transition-all duration-800 ${!resultsUnlocked ? 'blur-sm' : 'results-reveal'}`}>
            {/* Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="glass-card border-none shadow-lg rounded-2xl text-center card-hover">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary font-spartan">{metrics.leads.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium font-spartan">Leads</div>
                  <div className="text-lg font-semibold text-foreground mt-2 font-spartan">₹{metrics.cpl.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground font-spartan">CPL</div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-lg rounded-2xl text-center card-hover">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-secondary font-spartan">{metrics.qualifiedLeads.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium font-spartan">QL</div>
                  <div className="text-lg font-semibold text-foreground mt-2 font-spartan">₹{metrics.cpql.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground font-spartan">CPQL</div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-lg rounded-2xl text-center card-hover">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-accent font-spartan">{metrics.siteVisits.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium font-spartan">SV</div>
                  <div className="text-lg font-semibold text-foreground mt-2 font-spartan">₹{metrics.cpsv.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground font-spartan">CPSV</div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none shadow-lg rounded-2xl text-center card-hover">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-purple-brand font-spartan">{metrics.bookings}</div>
                  <div className="text-sm text-muted-foreground font-medium font-spartan">Bookings</div>
                  <div className="text-lg font-semibold text-foreground mt-2 font-spartan">₹{(metrics.cpb / 100000).toFixed(2)}L</div>
                  <div className="text-xs text-muted-foreground font-spartan">CPB</div>
                </CardContent>
              </Card>
            </div>

            {/* Total Budget */}
            <Card className="bg-gradient-to-r from-primary to-secondary text-white border-none shadow-2xl rounded-2xl card-hover mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2 font-spartan">
                    ₹{metrics.totalBudget.toLocaleString('en-IN')}
                  </div>
                  <div className="text-lg opacity-90 font-spartan">
                    Total Budget Required
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                onClick={() => handleCTAClick("scheduling a call")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Call
              </Button>
                          </div>

            {/* Enhanced Charts */}
            <EnhancedCharts 
              metrics={metrics} 
              chartData={chartData} 
              duration={duration} 
            />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="glass-card border-none shadow-2xl rounded-3xl w-full max-w-md form-slide-in">
              <CardHeader>
                <h3 className="text-2xl font-bold text-center text-foreground font-spartan">Unlock Your Growth Report</h3>
                <p className="text-center text-muted-foreground font-spartan">Get personalized insights for your business</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-foreground text-sm font-semibold mb-2 block font-spartan">Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-12 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-foreground text-sm font-semibold mb-2 block font-spartan">Mobile Number</label>
                    <Input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="Enter your mobile number"
                      className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-12 transition-all duration-200"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setShowForm(false)}
                      variant="outline"
                      className="flex-1 border-2 border-muted text-muted-foreground hover:bg-muted rounded-xl h-12 transition-all duration-200 font-spartan"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUnlockResults}
                      disabled={!formData.name || !formData.mobile || isLoading}
                      className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold rounded-xl h-12 transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : resultsUnlocked ? "Book" : "Unlock Results"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trust Section */}
        <div id="clients" className="mt-16 mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-spartan">
              Trusted by Performance-Driven Brands
            </h2>
          </div>
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/341259b0-c651-460f-a46a-1c5a0715b567.png"
              alt="Trusted client logos including Jeevvashakti Realty, Om Sree, Saket Pranamam, Reliance Builders, Indraprastha, Kosaraju Realty and many more"
              className="max-w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            />
          </div>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="md:hidden sticky-cta">
          <Button 
            onClick={handleBookCall}
            className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 py-3 shadow-2xl font-spartan font-bold"
          >
            <Phone className="mr-2 h-4 w-4" />
            Ready to Grow? Let's Talk 🚀
          </Button>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-accent text-accent-foreground py-8 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 font-spartan">Ready to Grow? Let's Talk 🚀</h3>
            <Button 
              onClick={handleBookCall}
              className="bg-white text-accent hover:bg-white/90 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan"
            >
              <Phone className="mr-2 h-5 w-5" />
              Book Now
            </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadCalculator;