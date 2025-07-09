import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ChevronDown, Phone, Download, Calendar, Loader2, X } from 'lucide-react';
import { getCPLForLocation } from '@/data/cplData';
import EnhancedCharts from './EnhancedCharts';
import AnimatedBackground from './AnimatedBackground';
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
  email: string;
  organization: string;
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
  const [formData, setFormData] = useState<UserFormData>({ name: '', mobile: '', email: '', organization: '' });
  const [resultsUnlocked, setResultsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewResultsClicked, setViewResultsClicked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [isViewResultsLoading, setIsViewResultsLoading] = useState(false);

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

  // Scroll handler for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    if (!formData.name || !formData.mobile || !formData.email || !formData.organization) return;
    
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
          email: formData.email,
          organization: formData.organization,
        }),
      });
  
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show loading for better UX
      
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

  const handleViewResults = async () => {
    if (!resultsUnlocked) {
      setViewResultsClicked(true);
      setIsViewResultsLoading(true);
      
      // Show loading animation for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsViewResultsLoading(false);
      setShowForm(true);
    }
  };

  const handleBookCall = () => {
    setShowForm(true);
  };

  const handleBookModalSubmit = async () => {
    if (!formData.name || !formData.mobile || !formData.email || !formData.organization) return;
    
    setIsLoading(true);
    const webAppURL = "https://script.google.com/macros/s/AKfycbzrzBr_M-Bm0d_9DXEVy0rJlI6TxKL1_kPvl5I55oDo5VWU6gXu96YHXk4_WXVIJV8R/exec";
  
    try {
      await fetch(webAppURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.mobile,
          email: formData.email,
          organization: formData.organization,
        }),
      });
  
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResultsUnlocked(true);
      setShowBookModal(false);
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

  return (
    <div className="min-h-screen bg-yellow-400 relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Enhanced Header - transparent at top, blurred on scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'bg-black/60 backdrop-blur-xl shadow-2xl border-b border-white/20 py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo + Tagline */}
          <a href="#" className="flex items-center space-x-4 group">
            <img
              src="/lovable-uploads/afedbe6c-a3e2-418c-a2ca-bc16fc85bb8f.png"
              alt="Digital Mojo Logo"
              className={`transition-all duration-500 ease-in-out ${
                isScrolled ? 'w-20 h-20 sm:w-30 sm:h-30' : 'w-20 h-20 sm:w-40 sm:h-40'
              } object-contain drop-shadow-xl group-hover:scale-105`}
            />
            <span className="hidden sm:inline text-yellow-brand/90 text-sm sm:text-lg font-medium font-spartan tracking-widest">
              Performance Marketing
            </span>
          </a>

          {/* CTA Button */}
          <div className="hidden sm:block">
            <Button
              onClick={handleBookCall}
              className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-12 rounded-full shadow-2xl hover:shadow-red-400/30 hover:scale-110 transition-all duration-300 font-spartan text-2xl animate-bounce"
            >
              Book Now
            </Button>
          </div>

          {/* Mobile CTA - Same Features as Desktop */}
          <div className="sm:hidden">
            <Button
              onClick={handleBookCall}
              className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-8 rounded-full shadow-2xl hover:shadow-red-400/30 hover:scale-110 transition-all duration-300 font-spartan text-lg animate-bounce"
            >
              Book Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Add top padding for fixed header */}
      <div className="container mx-auto px-4 pt-60 pb-8">

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

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 max-w-7xl mx-auto mb-16">
          {/* Calculator Section */}
          <Card className="bg-white/95 backdrop-blur-lg border-none shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-bold text-gray-900 text-center">Calculate Your Leads</h2>
            </CardHeader>
            <CardContent className="p-6">
              {/* Sell Units - Primary Input */}
              <div className="mb-6 text-center">
                <label className="text-foreground text-lg font-bold mb-3 block font-spartan">Units to Sell</label>
                <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 w-10 p-0 border-2 border-secondary hover:border-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                    onClick={() => setSellUnits(Math.max(1, sellUnits - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={sellUnits}
                    onChange={handleSellUnitsChange}
                    min="1"
                    className="bg-background border-2 border-secondary hover:border-primary focus:border-primary text-foreground text-center font-bold text-3xl rounded-lg h-14 text-center transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 w-10 p-0 border-2 border-secondary hover:border-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                    onClick={() => setSellUnits(sellUnits + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                {/* Property Type */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm">
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
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Launch Type</label>
                  <Select value={launchType} onValueChange={setLaunchType}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm">
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
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-background border-border rounded-xl shadow-xl max-h-60">
                     <SelectItem value="Bangalore East">Bangalore East</SelectItem>
                     <SelectItem value="Bangalore North">Bangalore North</SelectItem>
                     <SelectItem value="Bangalore South">Bangalore South</SelectItem>
                     <SelectItem value="Bangalore West">Bangalore West</SelectItem>
                     <SelectItem value="Chennai Central">Chennai Central</SelectItem>
                     <SelectItem value="Chennai East">Chennai East</SelectItem>
                     <SelectItem value="Chennai North">Chennai North</SelectItem>
                     <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                     <SelectItem value="Mumbai East">Mumbai East</SelectItem>
                     <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                     <SelectItem value="Mumbai South">Mumbai South</SelectItem>
                     <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
                     <SelectItem value="Pune">Pune</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

                {/* Configuration */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Configuration</label>
                  <Select value={bhk} onValueChange={setBhk}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-background border-border rounded-xl shadow-xl">
                     <SelectItem value="1 RK">1 RK</SelectItem>
                     <SelectItem value="1 BHK">1 BHK</SelectItem>
                     <SelectItem value="2 BHK">2 BHK</SelectItem>
                     <SelectItem value="3 BHK">3 BHK</SelectItem>
                     <SelectItem value="4 BHK">4 BHK</SelectItem>
                     <SelectItem value="5 BHK">5 BHK</SelectItem>
                     <SelectItem value="Villa">Villa</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

                {/* Marketing Channels */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Marketing Channels</label>
                  <Select value={marketingChannels} onValueChange={setMarketingChannels}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm">
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
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Duration</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-background border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm">
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

              {/* View Results Button with Loading Animation */}
              <div className="text-center mt-6 relative">
                <Button
                  onClick={handleViewResults}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {resultsUnlocked ? "Results Unlocked" : "View Results"}
                </Button>
                
                {/* Loading Animation - Separate from Button */}
                {isViewResultsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                    <div className="flex items-center space-x-2 text-primary">
                      <Loader2 className="h-6 w-6 animate-spin" />
                     
                    </div>
                  </div>
                )}
              </div>

             
              <div className="text-xs text-muted-foreground pt-6 border-t border-border mt-6 font-spartan">
                <p><strong>Disclaimer:</strong> The data presented is based on past experience and is provided for informational purposes only.</p>
              </div>
            </CardContent>
          </Card>

          {/* Desktop Results Section */}
          <Card className="bg-white/95 backdrop-blur-lg border-none shadow-xl rounded-2xl relative">
            {!resultsUnlocked && (
              <div className="absolute inset-0 z-20 blur-overlay rounded-2xl"></div>
            )}
            
            <CardContent className="p-6">
              <div className={`transition-all duration-800 ${!resultsUnlocked ? 'blur-sm' : 'results-reveal'}`}>
                 {/* Metrics Cards - Single Row */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <Card className="bg-white/95 backdrop-blur-lg border-none shadow-md rounded-lg text-center p-2">
                    <div className="text-3xl font-bold text-yellow-600">{metrics.leads.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 font-medium">Leads</div>
                    <div className="text-xs font-bold text-purple-700">₹{metrics.cpl.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">CPL</div>
                  </Card>
                  <Card className="bg-white/95 backdrop-blur-lg border-none shadow-md rounded-lg text-center p-2">
                    <div className="text-3xl font-bold text-yellow-600">{metrics.qualifiedLeads.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 font-medium">QL</div>
                    <div className="text-xs font-bold text-purple-700">₹{metrics.cpql.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">CPQL</div>
                  </Card>
                  <Card className="bg-white/95 backdrop-blur-lg border-none shadow-md rounded-lg text-center p-2">
                    <div className="text-3xl font-bold text-yellow-600">{metrics.siteVisits.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 font-medium">SV</div>
                    <div className="text-xs font-bold text-purple-700">₹{metrics.cpsv.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">CPSV</div>
                  </Card>
                  <Card className="bg-white/95 backdrop-blur-lg border-none shadow-md rounded-lg text-center p-2">
                    <div className="text-3xl font-bold text-yellow-600">{metrics.bookings.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 font-medium">Bookings</div>
                    <div className="text-xs font-bold text-purple-700">₹{metrics.cpb.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">CPB</div>
                  </Card>
                </div>

                {/* Total Budget */}
                <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Total Budget</h3>
                  <p className="text-2xl font-bold text-blue-600">₹{metrics.totalBudget.toLocaleString()}</p>
                </div>

                {/* Charts */}
                <EnhancedCharts 
                  metrics={metrics} 
                  chartData={chartData} 
                  duration={duration}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Call Button - Outside the boxes, center aligned - Desktop only */}
        <div className="hidden lg:block text-center mt-6">
          <Button 
            onClick={handleBookCall}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-16 rounded-lg text-2xl transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan"
          >
            <Calendar className="mr-2 h-6 w-6" />
            Schedule a Call
          </Button>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden max-w-4xl mx-auto mb-16">
          {/* Calculator Section */}
          <div id="calculator">
            <Card className="glass-card border-none shadow-2xl rounded-3xl overflow-hidden mb-8">
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
                      className="bg-background border-2 border-secondary hover:border-primary focus:border-primary text-foreground text-center font-bold text-4xl rounded-xl h-20 text-center transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      <SelectContent className="bg-background border-border rounded-xl shadow-xl max-h-60">
                        <SelectItem value="Bangalore East">Bangalore East</SelectItem>
                        <SelectItem value="Bangalore North">Bangalore North</SelectItem>
                        <SelectItem value="Bangalore South">Bangalore South</SelectItem>
                        <SelectItem value="Bangalore West">Bangalore West</SelectItem>
                        <SelectItem value="Chennai Central">Chennai Central</SelectItem>
                        <SelectItem value="Chennai East">Chennai East</SelectItem>
                        <SelectItem value="Chennai North">Chennai North</SelectItem>
                        <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                        <SelectItem value="Mumbai East">Mumbai East</SelectItem>
                        <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                        <SelectItem value="Mumbai South">Mumbai South</SelectItem>
                        <SelectItem value="Delhi NCR">Delhi NCR</SelectItem>
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

                {/* View Results Button with Loading Animation */}
                <div className="text-center mt-8 relative">
                  <Button
                    onClick={handleViewResults}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {resultsUnlocked ? "Results Unlocked" : "View Results"}
                  </Button>
                  
                  {/* Loading Animation - Separate from Button */}
                  {isViewResultsLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                      <div className="flex items-center space-x-2 text-primary">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground pt-6 border-t border-border mt-6 font-spartan">
                  <p><strong>Disclaimer:</strong> The data presented is based on past experience and is provided for informational purposes only.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Results Section - Single Line Cards */}
          <div id="results-section-mobile" className="relative">
            {!resultsUnlocked && (
              <div className="absolute inset-0 z-20 blur-overlay rounded-3xl"></div>
            )}
            
            <div className={`transition-all duration-800 ${!resultsUnlocked ? 'blur-sm' : 'results-reveal'}`}>
              {/* Mobile Metrics Cards - Single Line */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                <Card className="glass-card border-none shadow-lg rounded-2xl text-center card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium font-spartan">Leads</div>
                      <div className="text-xs text-muted-foreground font-spartan">CPL: ₹{metrics.cpl.toLocaleString()}</div>
                    </div>
                    <div className="text-5xl font-bold text-primary font-spartan">{metrics.leads.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-none shadow-lg rounded-2xl text-center card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium font-spartan">Qualified Leads</div>
                      <div className="text-xs text-muted-foreground font-spartan">CPQL: ₹{metrics.cpql.toLocaleString()}</div>
                    </div>
                    <div className="text-5xl font-bold text-secondary font-spartan">{metrics.qualifiedLeads.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-none shadow-lg rounded-2xl text-center card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium font-spartan">Site Visits</div>
                      <div className="text-xs text-muted-foreground font-spartan">CPSV: ₹{metrics.cpsv.toLocaleString()}</div>
                    </div>
                    <div className="text-5xl font-bold text-accent font-spartan">{metrics.siteVisits.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-none shadow-lg rounded-2xl text-center card-hover">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium font-spartan">Bookings</div>
                      <div className="text-xs text-muted-foreground font-spartan">CPB: ₹{(metrics.cpb / 100000).toFixed(2)}L</div>
                    </div>
                    <div className="text-5xl font-bold text-purple-brand font-spartan">{metrics.bookings}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Total Budget */}
              <Card className="bg-gradient-to-r from-primary to-secondary text-white border-none shadow-2xl rounded-2xl card-hover mb-8">
                <CardContent className="p-6">
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
              <div className="flex flex-col gap-4 justify-center mb-8">
                <Button 
                  onClick={handleBookCall}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan"
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
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-white border-none shadow-2xl rounded-3xl w-full max-w-md form-slide-in">
              <CardHeader className="relative">
                <Button
                  onClick={() => setShowForm(false)}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full bg-yellow-brand text-black hover:bg-yellow-brand/80"
                >
                  <X className="h-4 w-4" />
                </Button>
                <h3 className="text-2xl font-bold text-center text-black font-spartan">Want A Call Back</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                    className="bg-gray-100 border-0 text-gray-600 rounded-xl h-12 placeholder:text-gray-500 font-spartan"
                  />
                  <Input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Phone Number"
                    className="bg-gray-100 border-0 text-gray-600 rounded-xl h-12 placeholder:text-gray-500 font-spartan"
                  />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Your Email"
                    className="bg-gray-100 border-0 text-gray-600 rounded-xl h-12 placeholder:text-gray-500 font-spartan"
                  />
                  <Input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Your Organization"
                    className="bg-gray-100 border-0 text-gray-600 rounded-xl h-12 placeholder:text-gray-500 font-spartan"
                  />
                  <Button
                    onClick={handleUnlockResults}
                    disabled={!formData.name || !formData.mobile || !formData.email || !formData.organization || isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12 transition-all duration-300 font-spartan disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Book Now Modal */}
        {showBookModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-white border-none shadow-2xl rounded-3xl w-full max-w-md form-slide-in">
              <CardHeader className="relative">
                <Button
                  onClick={() => setShowBookModal(false)}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full bg-yellow-brand text-black hover:bg-yellow-brand/80"
                >
                  <X className="h-4 w-4" />
                </Button>
                <h3 className="text-2xl font-bold text-center text-black font-spartan">Want A Call Back</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                    className="bg-gray-100 border-0 text-gray-600 rounded-xl h-12 placeholder:text-gray-500 font-spartan"
                  />
                  <Input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Phone Number"
                    className="bg-gray-100 border-0 text-gray-600 rounded-xl h-12 placeholder:text-gray-500 font-spartan"
                  />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Your Email"
                    className="bg-gray-100 border-0 text-gray-600 rounded-xl h-12 placeholder:text-gray-500 font-spartan"
                  />
                  <Input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Your Organization"
                    className="bg-gray-100 border-0 text-gray-600 rounded-xl h-12 placeholder:text-gray-500 font-spartan"
                  />
                  <Button
                    onClick={handleBookModalSubmit}
                    disabled={!formData.name || !formData.mobile || !formData.email || !formData.organization || isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12 transition-all duration-300 font-spartan disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div id="clients" className="w-full px-4 md:px-10 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white font-spartan">
              Trusted by Performance-Driven Brands
            </h2>
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 place-items-center">
            {Array.from({ length: 37 }, (_, i) => (
              <div 
                key={i}
                className="group p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 h-20 w-28 flex items-center justify-center filter grayscale hover:grayscale-0"
              >
                <img
                  src={`./client-logo/logo-${i + 1}.png`}
                  alt={`Client Logo ${i + 1}`}
                  className="h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>

          {/* Mobile Infinite Scroll */}
          <div className="md:hidden overflow-hidden whitespace-nowrap px-2 py-4">
            <div className="inline-flex space-x-4 animate-scroll-slow">
              {[...Array(2)].flatMap(() => (
                Array.from({ length: 37 }, (_, i) => (
                  <div 
                    key={`loop-${i}-${Math.random()}`}
                    className="p-3 bg-white rounded-lg shadow-md h-16 w-20 flex items-center justify-center filter grayscale"
                  >
                    <img
                      src={`./client-logo/logo-${i + 1}.png`}
                      alt={`Client Logo ${i + 1}`}
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>       
        
        {/* Mobile Sticky CTA */}
        <div className="md:hidden sticky-cta">
          <Button 
            onClick={handleBookCall}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 shadow-2xl font-spartan font-bold"
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
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan"
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