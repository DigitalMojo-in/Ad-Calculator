import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Phone, Calendar, Loader2, X, Sun, Moon } from 'lucide-react';
import { getCPLForLocation } from '@/data/cplData';
import EnhancedCharts from './EnhancedCharts';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import BounceButton from './BounceButton';


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

  const [propertyType, setPropertyType] = useState('');
  const [launchType, setLaunchType] = useState('');
  const [location, setLocation] = useState('');
  const [bhk, setBhk] = useState('');
  const [marketingChannels, setMarketingChannels] = useState('');
  const [sellUnits, setSellUnits] = useState(50);
  const [duration, setDuration] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({ name: '', mobile: '', email: '', organization: '' });
  const [resultsUnlocked, setResultsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewResultsClicked, setViewResultsClicked] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [isViewResultsLoading, setIsViewResultsLoading] = useState(false);
  const [hideStickyCTA, setHideStickyCTA] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [isUnlockLoading, setIsUnlockLoading] = useState(false);

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

  // Check if all required fields are selected
  const isFormValid = propertyType && launchType && location && bhk && marketingChannels && duration;

  const calculateMetrics = () => {
    if (!isFormValid) return; // Don't calculate if form is not valid

    const actualCPL = getCPLForLocation(location, bhk);

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

    let cpl = marketingChannels.includes('+') ? actualCPL :
      marketingChannels.includes('Google') ? actualCPL + cplMult : actualCPL - cplMult;
    cpl = Math.round(cpl*launchMultiplier);
    if (cpl < 300) {
      cpl = cpl + 200;
    }
    const leads = Math.round(baseLeads * locationMultiplier * bhkMultiplier * channelMultiplier * propertyMultiplier * launchMultiplier);
    const qualifiedLeads = Math.round(leads * 0.3);
    const siteVisits = Math.round(qualifiedLeads * 0.2);
    const bookings = sellUnits;

    const totalBudget = leads * cpl;
    const cpql = Math.round(totalBudget / qualifiedLeads);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const footer = document.querySelector('#footer');
      if (footer && window.innerWidth < 768) {
        const footerRect = footer.getBoundingClientRect();
        const isFooterVisible = footerRect.top < window.innerHeight + 100;
        setHideStickyCTA(isFooterVisible);
      } else {
        setHideStickyCTA(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUnlockResults = async () => {
    if (!formData.name || !formData.mobile || !formData.email || !formData.organization) return;
  
    setIsUnlockLoading(true);
  
    const webAppURL = "https://script.google.com/macros/s/AKfycbzvY-cPO-fsMULjOLHsC-G47tePzt7EHUt2Uchlau8K3424HW9n7LG8Y-8HB_FOLkXX/exec";
  
    try {
      // Fire-and-forget, non-blocking
      fetch(webAppURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          name: formData.name,
          phone: formData.mobile,
          email: formData.email,
          company: formData.organization,
        }),
      });
  
      // Unlock UI instantly (no need to wait for fetch)
      setResultsUnlocked(true);
      setShowUnlockDialog(false);
      setShowForm(false);
  
      toast({
        title: "We will call you back soon! 😊",
        description: "Thank you for your interest. Our team will reach out to you shortly.",
      });
  
      // Smooth scroll after short delay for visual transition
      setTimeout(() => {
        const resultsSection = document.getElementById("results-section");
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300); // faster scroll
  
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      // Clean UI, even if there's an error
      setTimeout(() => {
        setIsUnlockLoading(false);
      }, 300); // short delay for smooth UI release
    }
  };
  

  const handleViewResults = async () => {
    if (!resultsUnlocked) {
      setShowUnlockDialog(true);
    }
  };

  const handleBookCall = () => {
    setShowForm(true);
  };
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isWorkEmail = (email) => isValidEmail(email) && !email.includes('@gmail.com');
const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
const isValidWebsite = (url: string) => {
  const websiteRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return websiteRegex.test(url.trim());
};

  const handleScrollToInputs = () => {
    const inputSection = document.querySelector('.calculator-inputs');
    if (inputSection) {
      inputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const handleScrollToInputs2 = () => {
    const inputSection = document.querySelector('.calculator-inputs2');
    if (inputSection) {
      inputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const generateTimeSeriesData = () => {
    const timePoints = duration === '3 Months' ? 3 : duration === '6 Months' ? 6 : 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return Array.from({ length: timePoints }, (_, i) => {
      const monthIndex = (new Date().getMonth() + i) % 12;
      const baseVariation = 0.8 + (Math.random() * 0.4);

      return {
        month: monthNames[monthIndex],
        leads: Math.round(metrics.leads * baseVariation / timePoints),
        siteVisits: Math.round(metrics.siteVisits * baseVariation / timePoints),
        bookings: Math.round(metrics.bookings * baseVariation / timePoints),
        cpl: metrics.cpl
      };
    });
  };

  const chartData = generateTimeSeriesData();

  return (
    <div id="mouse-tracker" className={`min-h-screen px-0 transition-colors duration-300`} style={{ backgroundColor: isDarkMode ? '#000000' : '#f0bc00' }}>

      {/* Desktop Theme Toggle - Left Wall */}
      <div className="hidden sm:block fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
  <div
    onClick={() => setIsDarkMode(!isDarkMode)}
    className={`w-8 h-14 flex flex-col items-center justify-between p-1 rounded-full cursor-pointer transition-colors duration-300 ${
      isDarkMode ? 'bg-yellow-400' : 'bg-gray-800'
    }`}
  >
    {/* Icon container (rotated icons if needed) */}
    <div
      className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
        isDarkMode ? 'translate-y-6 rotate-180' : 'translate-y-0 rotate-0'
      }`}
    >
      {isDarkMode ? (
        <Moon className="h-4 w-4 text-yellow-600" />
      ) : (
        <Sun className="h-4 w-4 text-orange-500" />
      )}
    </div>
  </div>
</div>


      {/* Mobile Theme Toggle - Bottom Left Corner */}
      <div className="sm:hidden fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsDarkMode(!isDarkMode)}
          variant="ghost"
          size="sm"
          className={`backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 ${
            isDarkMode
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sticky Get In Touch - Right Wall - Attached to wall */}
      <div className="hidden sm:block fixed right-[-90px] top-1/2 transform -translate-y-1/2 z-50">
        <Button
          onClick={handleBookCall}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-8  shadow-2xl transition-all duration-300 font-spartan transform -rotate-90 origin-center whitespace-nowrap"
          style={{
            fontSize: '20px',
            borderTopRightRadius: '0px',
            borderBottomRightRadius: '0px',
            minWidth: '180px',
            height: '60px',
            marginRight: '0px'
          }}
        >
          FREE Strategy Call
        </Button>
      </div>

      {/* Header */}
      <header className="top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out bg-transparent py-4">
  <div className="flex justify-between items-center px-4 sm:px-8">
    
    {/* Empty div to push logo right on mobile, collapse on desktop */}
    <div className="block sm:hidden flex-1"></div>

    {/* Logo Container */}
    <div className="flex items-center justify-end sm:justify-start space-x-2 w-full sm:w-auto">
      <a href="#" className="flex items-center group">
        <img
          src="./lovable-uploads/DMM.png"
          alt="Digital Mojo Logo"
          className="w-28 h-28 sm:w-40 sm:h-40 object-contain group-hover:scale-105 transition-all duration-500 ease-in-out"
        />
      </a>
    </div>

    {/* Optional: Use this div only if you want symmetry or other items on the right */}
    <div className="hidden sm:block flex-1"></div>
  </div>
</header>

      {/* Main Content - First Fold with Hero + Calculator */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-24 mt-1 sm:mt-4 lg:mt-8">

        {/* Desktop Layout - Side by Side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 max-w-none min-h-[80vh] items-center">

          {/* Left - Hero Text */}
          <div className="flex-1">
            <div className="py-8">
            <div className="flex-1 mx-auto lg:mx-0 max-w-2xl pt-2 sm:pt-4 pb-12">
  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-spartan leading-snug transition-colors duration-300 text-center sm:text-left mt-[-1.5rem]">
    <span className={`${isDarkMode ? 'text-yellow-400' : 'text-black'}`}>
      Get Benchmarks in <span className='text-white'>SECONDS</span>
    </span>
  </h1>

  <p className={`mt-2 text-lg md:text-xl lg:text-2xl font-spartan leading-relaxed text-center sm:text-left transition-colors duration-300 ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
    CPL, CPSV & CPB data used by <span className={`${isDarkMode ? 'text-yellow-300' : 'text-black font-semibold'}`}>India's top developers.</span>
  </p>
</div>

              {/* Desktop Image moved here */}
              <div className="mt-8 mr-[50px] flex justify-end pr-50 sm:pr-10">
  <img
    src="./lovable-uploads/img.png"
    alt="Business Growth Calculator"
    className="w-full max-w-2xl h-auto transform scale-110 sm:scale-125 transition-transform duration-300"
  />
</div>

            </div>
          </div>

          {/* Right - Calculator */}
          <Card className="backdrop-blur-lg border-none shadow-xl rounded-2xl overflow-hidden bg-white/95 -mt-[180px] h-fit">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-bold text-center text-gray-900">Calculate Your Leads</h2>
            </CardHeader>
            <CardContent className="p-6 calculator-inputs">
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
                    onChange={(e) => setSellUnits(Math.max(1, parseInt(e.target.value) || 0))}
                    min="1"
                    className="bg-background border-2 border-secondary hover:border-primary focus:border-primary text-foreground text-center font-extrabold text-[5rem] rounded-lg h-20 w-32 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ fontSize: '2rem' }}
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
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                      style={{ fontSize: '1.5rem' }}>
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl">
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Plots">Plots</SelectItem>
                      <SelectItem value="Shops cum Offices">Shops cum Offices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Launch Type */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Launch Type</label>
                  <Select value={launchType} onValueChange={setLaunchType}>
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                      style={{ fontSize: '1.5rem' }}>
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl">
                      <SelectItem value="Teaser">Pre-Launch</SelectItem>
                      <SelectItem value="Launch">Launch</SelectItem>
                      <SelectItem value="Sustenance">On-Going</SelectItem>
                      <SelectItem value="NRI">NRI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                      style={{ fontSize: '1.5rem' }}>
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl max-h-60">
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
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Configuration</label>
                  <Select value={bhk} onValueChange={setBhk}>
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                      style={{ fontSize: '1.5rem' }}>
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl">
                      {propertyType === "Plots" ? (
                        <>
                          <SelectItem value="Plot Size 1000 Sq - 2000 Sq">Plot Size 1000 Sq - 2000 Sq</SelectItem>
                          <SelectItem value="Plot Size 2000 Sq - 4000 Sq">Plot Size 2000 Sq - 4000 Sq</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="1 RK">1 RK</SelectItem>
                          <SelectItem value="1 BHK">1 BHK</SelectItem>
                          <SelectItem value="2 BHK">2 BHK</SelectItem>
                          <SelectItem value="3 BHK">3 BHK</SelectItem>
                          <SelectItem value="4 BHK">4 BHK</SelectItem>
                          <SelectItem value="5 BHK">5 BHK</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Marketing Channels */}
                <div>
                  <label className="text-foreground text-base font-semibold mb-2 block font-spartan">Marketing Channels</label>
                  <Select value={marketingChannels} onValueChange={setMarketingChannels}>
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                      style={{ fontSize: '1.5rem' }}>
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl">
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
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-lg h-12 text-base transition-all duration-200 shadow-sm"
                      style={{ fontSize: '1.5rem' }}>
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl">
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
              <div className="text-center mt-6 relative">
                <Button
                  onClick={handleViewResults}
                  disabled={!isFormValid}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl text-base transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  id="desktop-show-numbers-btn"
                >
                  {resultsUnlocked ? "Results Unlocked" : "Show me the Numbers!"}
                </Button>
                
              </div>

              <div className="text-xs pt-6 border-t mt-6 font-spartan text-muted-foreground border-border">
                <p><strong>Disclaimer:</strong> What you see is based on past wins. What you get with us? Possibly even bigger.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Layout - Stack */}
        <div className="lg:hidden max-w-4xl mx-auto">

          {/* Mobile Hero Section */}
          {/* Mobile Layout - Text Left, Image Right */}
<div className="lg:hidden flex flex-row items-center justify-between max-w-4xl mx-auto px-4 py-8 pt-0 gap-4">

  {/* Text Section */}
  <div className="w-1/2 pr-2 -mt-[120px]">
  <h1 className="text-3xl font-black font-spartan leading-tight transition-colors duration-300">
    <span className={`${isDarkMode ? 'text-yellow-400' : 'text-black'}`}>
      Get Benchmark in <span className='text-white'>SECONDS</span>
    </span>
  </h1>
  <p className={`mt-5 text-base font-spartan leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
    CPL, CPSV & CPB data used by <span className={`${isDarkMode ? 'text-yellow-300' : 'text-black font-semibold'}`}>India's top developers.</span>
  </p>
</div>

{/* Image Section */}
<div className="w-1/2 pl-2">
  <img 
    src="./lovable-uploads/img.png" 
    alt="Benchmark" 
    className="w-full h-auto object-contain scale-125"
  />
</div>

</div>

          {/* Mobile Calculator - First Fold */}
          <Card className="backdrop-blur-lg border-none shadow-2xl rounded-3xl overflow-hidden mb-8 bg-white">
            <CardContent className="p-8 calculator-inputs2">
              {/* Sell Units - Primary Input */}
              <div className="mb-8 text-center">
                <label className="text-foreground text-lg font-bold mb-4 block font-spartan">Units to Sell</label>
                <div className="flex items-center justify-center gap-1 max-w-sm mx-auto px-4 py-2">
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
                    onChange={(e) => setSellUnits(Math.max(1, parseInt(e.target.value) || 0))}
                    min="1"
                    className="bg-background border-2 border-secondary hover:border-primary focus:border-primary text-foreground text-center font-bold text-5xl rounded-xl h-24 text-center transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-7 border-border rounded-xl shadow-xl">
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Plots">Plots</SelectItem>
                      <SelectItem value="Shops cum Offices">Shops cum Offices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Launch Type */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Launch Type</label>
                  <Select value={launchType} onValueChange={setLaunchType}>
                    <SelectTrigger className="bg-white text-7 border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl">
                      <SelectItem value="Teaser">Pre-Launch</SelectItem>
                      <SelectItem value="Launch">Launch</SelectItem>
                      <SelectItem value="Sustenance">On-Going</SelectItem>
                      <SelectItem value="NRI">NRI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl max-h-60">
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
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl">
                      {propertyType === "Plots" ? (
                        <>
                          <SelectItem value="Plot Size 1000 Sq - 2000 Sq">Plot Size 1000 Sq - 2000 Sq</SelectItem>
                          <SelectItem value="Plot Size 2000 Sq - 4000 Sq">Plot Size 2000 Sq - 4000 Sq</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="1 RK">1 RK</SelectItem>
                          <SelectItem value="1 BHK">1 BHK</SelectItem>
                          <SelectItem value="2 BHK">2 BHK</SelectItem>
                          <SelectItem value="3 BHK">3 BHK</SelectItem>
                          <SelectItem value="4 BHK">4 BHK</SelectItem>
                          <SelectItem value="5 BHK">5 BHK</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Marketing Channels */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-3 block font-spartan">Marketing Channels</label>
                  <Select value={marketingChannels} onValueChange={setMarketingChannels}>
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl">
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
                    <SelectTrigger className="bg-white border-2 border-muted hover:border-secondary focus:border-primary text-foreground rounded-xl h-16 text-lg transition-all duration-200 shadow-sm">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border rounded-xl shadow-xl">
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
              <div className="text-center mt-8 relative">
                <Button
                  onClick={handleViewResults}
                  disabled={!isFormValid}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  id="mobile-show-numbers-btn"
                >
                  {resultsUnlocked ? "Results Unlocked" : "Show me the Numbers!"}
                </Button>
                
              </div>

              <div className="text-xs text-muted-foreground pt-6 border-t border-border mt-6 font-spartan">
                <p><strong>Disclaimer:</strong> What you see is based on past wins. What you get with us? Possibly even bigger. </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Aesthetic Divider after First Fold */}
      <div className="w-full px-4 sm:px-10 xl:px-24 my-12">
        <div className="flex items-center justify-center">
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
          <div className={`mx-4 text-2xl ${isDarkMode ? 'text-white/40' : 'text-white/50'}`}>✦</div>
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
        </div>
      </div>

      {/* Results Section */}
      <div id="results-section" className="w-full px-4 sm:px-6 lg:px-10 xl:px-24 mb-12">
        {/* Desktop Results */}
        <div className="hidden lg:block">
          <Card className="backdrop-blur-lg border-none shadow-xl rounded-2xl relative bg-white/95">
            {!resultsUnlocked && (
              <>
                <div className="absolute inset-0 z-20 blur-overlay rounded-2xl"></div>
                
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl px-8 py-6 shadow-lg animate-fade-in cursor-pointer relative" onClick={handleScrollToInputs}>
                    <p className="text-gray-800 font-bold text-center font-spartan text-lg">
                      Fill in the data to know your ad spend
                    </p>
                  </div>
                </div>
              </>
            )}

            <CardContent className="p-6">
              <div className={`transition-all duration-800 ${!resultsUnlocked ? 'blur-sm' : 'results-reveal'}`}>
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <Card className="backdrop-blur-lg border-none shadow-md rounded-lg text-center p-4 bg-white">
                    <div className="text-xl text-black">{metrics.leads.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 font-medium mb-2">Leads</div>
                    <div className="text-4xl font-bold text-black">₹{metrics.cpl.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 group relative cursor-help">
                      CPL
                      <span className="absolute z-10 hidden group-hover:block bg-black text-white text-xs font-medium rounded-md px-2 py-1 left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                        Cost Per Lead
                      </span>
                    </div>
                  </Card>

                  <Card className="backdrop-blur-lg border-none shadow-md rounded-lg text-center p-4 bg-white">
                    <div className="text-xl text-black">{metrics.qualifiedLeads.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 font-medium mb-2">Qualified Leads</div>
                    <div className="text-4xl font-bold text-black">₹{metrics.cpql.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 group relative cursor-help">
                      CPQL
                      <span className="absolute z-10 hidden group-hover:block bg-black text-white text-xs font-medium rounded-md px-2 py-1 left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                        Cost Per Qualified Lead
                      </span>
                    </div>
                  </Card>

                  <Card className="backdrop-blur-lg border-none shadow-md rounded-lg text-center p-4 bg-white">
                    <div className="text-xl text-black">{metrics.siteVisits.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 font-medium mb-2">Site Visits</div>
                    <div className="text-4xl font-bold text-black">₹{metrics.cpsv.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 group relative cursor-help">
                      CPSV
                      <span className="absolute z-10 hidden group-hover:block bg-black text-white text-xs font-medium rounded-md px-2 py-1 left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                        Cost Per Site Visit
                      </span>
                    </div>
                  </Card>

                  <Card className="backdrop-blur-lg border-none shadow-md rounded-lg text-center p-4 bg-white">
                    <div className="text-xl text-black">{metrics.bookings.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 font-medium mb-2">Bookings</div>
                    <div className="text-4xl font-bold text-black">₹{metrics.cpb.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 group relative cursor-help">
                      CPB
                      <span className="absolute z-10 hidden group-hover:block bg-black text-white text-xs font-medium rounded-md px-2 py-1 left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                        Cost Per Booking
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Total Budget */}
                <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Total Budget</h3>
                  <p className="text-5xl font-bold text-blue-600">₹{metrics.totalBudget.toLocaleString()}</p>
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

        {/* Mobile Results */}
        <div className="lg:hidden" id="results-section-mobile">
          <div className="relative">
            {!resultsUnlocked && (
              <>
                <div className="absolute inset-0 z-20 blur-overlay rounded-2xl"></div>
                
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl px-6 py-4 shadow-lg animate-fade-in cursor-pointer relative" onClick={handleScrollToInputs2}>
                    <p className="text-gray-800 font-bold text-center font-spartan">
                      Fill in the data to know your ad spend
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className={`transition-all duration-800 ${!resultsUnlocked ? 'blur-sm' : 'results-reveal'}`}>
              <div className="grid grid-cols-1 gap-4 mb-6">
              

    {/* Leads */}
    <Card className="backdrop-blur-lg border-none shadow-lg rounded-2xl bg-white">
      <CardContent className="p-0">
        <div className="grid grid-cols-3">
          <div className="bg-pink-500 text-white p-4 rounded-l-2xl flex items-center justify-center">
            <span className="text-[23px] font-bold font-spartan text-center">Leads</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center bg-gray-50">
            <span className="text-center text-black-500 font-spartan text-sm">No. of <br />Leads</span>
            <span className="text-2xl font-bold text-black font-spartan mt-1">{metrics.leads.toLocaleString()}</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center bg-gray-100 rounded-r-2xl">
            <span className="text-center text-black-500 font-spartan text-sm">
              <span className="text-sm">Cost Per</span><br />
              <span className="">Lead</span>
            </span>
            <span className="text-2xl font-bold text-black font-spartan mt-1">₹{metrics.cpl.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    

    {/* Qualified Leads */}
    <Card className="backdrop-blur-lg border-none shadow-lg rounded-2xl bg-white">
      <CardContent className="p-0">
        <div className="grid grid-cols-3">
          <div className="bg-purple-500 text-white p-4 rounded-l-2xl flex items-center justify-center">
            <span className="text-[23px] font-bold font-spartan text-center">Qualified</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center bg-gray-50">
            <span className="text-center text-black-500 font-spartan text-sm">No of<br /><span className="">Qualified Leads</span></span>
            <span className="text-2xl font-bold text-black font-spartan mt-1">{metrics.qualifiedLeads.toLocaleString()}</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center bg-gray-100 rounded-r-2xl">
            <span className="text-center text-black-500 font-spartan text-sm">
              <span className="text-sm">Cost Per</span><br />
              <span className="">Qualified Lead</span>
            </span>
            <span className="text-2xl font-bold text-black font-spartan mt-1">₹{metrics.cpql.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Site Visits */}
    <Card className="backdrop-blur-lg border-none shadow-lg rounded-2xl bg-white">
      <CardContent className="p-0">
        <div className="grid grid-cols-3">
          <div className="bg-purple-500 text-white p-4 rounded-l-2xl flex items-center justify-center">
            <span className="text-[23px] font-bold font-spartan text-center">Site Visits</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center bg-gray-50">
            <span className="text-center text-black-500 font-spartan text-sm">No of<br /><span className="">Site Visits</span></span>
            <span className="text-2xl font-bold text-black font-spartan mt-1">{metrics.siteVisits.toLocaleString()}</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center bg-gray-100 rounded-r-2xl">
            <span className="text-center text-black-500 font-spartan text-sm">
              <span className="text-sm">Cost Per</span><br />
              <span className="">Site Visit</span>
            </span>
            <span className="text-2xl font-bold text-black font-spartan mt-1">₹{metrics.cpsv.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Bookings */}
    <Card className="backdrop-blur-lg border-none shadow-lg rounded-2xl bg-white">
      <CardContent className="p-0">
        <div className="grid grid-cols-3">
          <div className="bg-purple-500 text-white p-4 rounded-l-2xl flex items-center justify-center">
            <span className="text-[23px] font-bold font-spartan text-center">Bookings</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center bg-gray-50">
            <span className="text-center text-black-500 font-spartan text-sm">No of<br /><span className="">Bookings</span></span>
            <span className="text-2xl font-bold text-black font-spartan mt-1">{metrics.bookings.toLocaleString()}</span>
          </div>
          <div className="p-4 flex flex-col items-center justify-center bg-gray-100 rounded-r-2xl">
            <span className="text-center text-black-500 font-spartan text-sm">
              <span className="text-sm">Cost Per</span><br />
              <span className="">Booking</span>
            </span>
            <span className="text-2xl font-bold text-black font-spartan mt-1">₹{metrics.cpb.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Total Budget */}
  <Card className="backdrop-blur-lg border-none shadow-2xl rounded-2xl bg-white">
    <CardContent className="p-0">
      <div className="grid grid-cols-3">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-l-2xl flex items-center justify-center">
          <span className="text-[23px] font-bold font-spartan text-center">Total Budget</span>
        </div>
        <div className="col-span-2 p-6 flex items-center justify-center bg-gray-50 rounded-r-2xl">
          <span className="text-4xl font-bold text-black font-spartan">₹{metrics.totalBudget.toLocaleString()}</span>
        </div>
      </div>
    </CardContent>
  </Card>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 justify-center mb-8 mt-8">
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
      </div>

      {/* Schedule Call Button - Desktop only */}
      <div className="hidden lg:block text-center mb-12">
        <BounceButton
          onClick={handleBookCall}
          className="py-6 px-16 rounded-lg text-2xl shadow-lg font-spartan"
        >
          <Calendar className="mr-2 h-6 w-6" />
          FREE Strategy Call
        </BounceButton>
      </div>

      {/* Unlock Results Dialog */}
      {showUnlockDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="border-none shadow-2xl rounded-3xl w-full max-w-md form-slide-in bg-white">
            <CardHeader className="relative">
              <Button
                onClick={() => setShowUnlockDialog(false)}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full bg-yellow-brand text-black hover:bg-yellow-brand/80"
              >
                <X className="h-4 w-4" />
              </Button>
              <h3 className="text-2xl font-bold text-center font-spartan text-black">Unlock Your Results</h3>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {!formData.name || !formData.mobile || !formData.email || !formData.organization ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-10 animate-fadeIn">
                  <img
                    src="./lovable-uploads/amicat-wow.gif"
                    alt="Loading..."
                    className="w-20 h-20 object-contain"
                  />
                  <div className="text-gray-600 font-spartan text-base text-center">
                    We're getting everything ready for you...<br />
                    Fill the form to see your growth plan instantly
                  </div>
                </div>
              ) : null}

              <div className="space-y-4">
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                />

                <Input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="Phone Number"
                  className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                />

                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Your Email"
                  className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                />

                <Input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Your Website"
                  className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                />

<Button
  onClick={handleUnlockResults}
  disabled={
    !formData.name ||
    !formData.mobile ||
    !isValidMobile(formData.mobile) ||
    !formData.email ||
    !isWorkEmail(formData.email) ||
    !formData.organization ||
    !isValidWebsite(formData.organization) ||
    isUnlockLoading
  }
  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12 transition-all duration-300 font-spartan disabled:opacity-50"
>
  {isUnlockLoading ? "Unlocking..." : "Show me the Numbers!"}
</Button>

{/* ✅ Email Format Error */}
{formData.email && !isValidEmail(formData.email) && (
  <div className="text-red-600 text-sm text-center font-spartan mt-2">
    Please enter a valid email address.
  </div>
)}

{/* ✅ Work Email Check (only if format is valid) */}
{isValidEmail(formData.email) && formData.email.includes('@gmail.com') && (
  <div className="text-red-600 text-sm text-center font-spartan mt-2">
    Sorry, Gmail addresses are not accepted. Please use a work email.
  </div>
)}

{/* ✅ Mobile Number Error */}
{formData.mobile && !isValidMobile(formData.mobile) && (
  <div className="text-red-600 text-sm text-center font-spartan mt-2">
    Please enter a valid 10-digit mobile number.
  </div>
)}
{formData.organization && !isValidWebsite(formData.organization) && (
  <div className="text-red-600 text-sm text-center font-spartan mt-2">
    Please enter a valid company website (e.g., example.com).
  </div>
)}

              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="border-none shadow-2xl rounded-3xl w-full max-w-md form-slide-in bg-white">
            <CardHeader className="relative">
              <Button
                onClick={() => setShowForm(false)}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full bg-yellow-brand text-black hover:bg-yellow-brand/80"
              >
                <X className="h-4 w-4" />
              </Button>
              <h3 className="text-2xl font-bold text-center font-spartan text-black">Want A Call Back</h3>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-4">
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                />
                <Input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="Phone Number"
                  className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Your Email"
                  className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                />
                <Input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Your Website"
                  className="border-0 rounded-xl h-12 placeholder:text-gray-500 font-spartan bg-gray-100 text-gray-600"
                />
                <Button
  onClick={handleUnlockResults}
  disabled={
    !formData.name ||
    !formData.mobile ||
    !isValidMobile(formData.mobile) ||
    !formData.email ||
    !isWorkEmail(formData.email) ||
    !formData.organization ||
    !isValidWebsite(formData.organization) ||
    isUnlockLoading
  }
  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12 transition-all duration-300 font-spartan disabled:opacity-50"
>
  {isUnlockLoading ? "Submiting" : "FREE Strategy Call"}
</Button>

{/* ✅ Email Format Error */}
{formData.email && !isValidEmail(formData.email) && (
  <div className="text-red-600 text-sm text-center font-spartan mt-2">
    Please enter a valid email address.
  </div>
)}

{/* ✅ Work Email Check (only if format is valid) */}
{isValidEmail(formData.email) && formData.email.includes('@gmail.com') && (
  <div className="text-red-600 text-sm text-center font-spartan mt-2">
    Sorry, Gmail addresses are not accepted. Please use a work email.
  </div>
)}

{/* ✅ Mobile Number Error */}
{formData.mobile && !isValidMobile(formData.mobile) && (
  <div className="text-red-600 text-sm text-center font-spartan mt-2">
    Please enter a valid 10-digit mobile number.
  </div>
)}
{formData.organization && !isValidWebsite(formData.organization) && (
  <div className="text-red-600 text-sm text-center font-spartan mt-2">
    Please enter a valid company website (e.g., example.com).
  </div>
)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aesthetic Divider before Clients Section */}
      <div className="w-full my-16">
        <div className="flex items-center justify-center">
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
          <div className={`mx-6 text-4xl ${isDarkMode ? 'text-white/40' : 'text-white/30'}`}>✧</div>
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
        </div>
      </div>

      {/* Clients Section */}
      <div id="clients" className="w-full px-4 md:px-10 py-12">
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-5xl font-bold font-spartan transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-white'}`}>
            Partnered with <span className={`${isDarkMode ? 'text-yellow-500' : 'text-black'}`}>Brands</span> that demand <span className={`${isDarkMode ? 'text-yellow-500' : 'text-black'}`}>Results</span>
          </h2>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 place-items-center">
  {Array.from({ length: 32 }, (_, i) => (
    <div
      key={i}
      className="group p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 h-20 w-28 flex items-center justify-center filter grayscale hover:grayscale-0 animate-fade-in"
      style={{ animationDelay: `${i * 0.05}s` }}
    >
      <img
        src={`./client-logo/logo-${i + 1}.png`}
        alt={`Client Logo ${i + 1}`}
        className={`object-contain ${
          i === 0 || i === 3 ? 'h-16' : 'h-12'
        } w-auto transition-all duration-300`}
      />
    </div>
  ))}
</div>


        {/* Mobile Infinite Scroll */}
        <div className="md:hidden overflow-hidden whitespace-nowrap px-2 py-4">
          <div className="inline-flex space-x-4 animate-scroll-slow">
            {[...Array(2)].flatMap(() => (
              Array.from({ length: 32 }, (_, i) => (
                <div
                  key={`loop-${i}-${Math.random()}`}
                  className="p-3 bg-white rounded-lg shadow-md h-16 w-20 flex items-center justify-center"
                >
                  <img
                    src={`./client-logo/logo-${i + 1}.png`}
                    alt={`Client Logo ${i + 1}`}
                    className="h-8 w-auto object-contain scale-300"
                  />
                </div>
              ))
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className={`md:hidden sticky-cta transition-all duration-300 ${hideStickyCTA ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100'}`}>
        <Button
          onClick={handleBookCall}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 shadow-2xl font-spartan font-bold"
        >
          <Phone className="mr-2 h-4 w-4" />
          FREE Strategy Call
        </Button>
      </div>

      {/* Aesthetic Divider before Footer */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-center">
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-gray-600/30'}`} />
          <div className={`mx-6 text-3xl ${isDarkMode ? 'text-white/40' : 'text-gray-600/50'}`}>❋</div>
          <Separator className={`flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-gray-600/30'}`} />
        </div>
      </div>

      {/* CTA Footer */}
      <div id="footer" className="bg-white dark:bg-black text-accent-black dark:text-white py-10 text-center">
  <div className="container mx-auto px-4">

    {/* Tagline */}
    <h3 className="text-2xl md:text-3xl font-bold mb-4 font-spartan">
    Sell your Real Estate <span className="italic text-[47px] md:text-[80px] text-red-500">47%</span> faster

    </h3>

    {/* CTA Button */}
    <Button
      onClick={handleBookCall}
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg font-spartan"
    >
      <Phone className="mr-2 h-5 w-5" />
      FREE Strategy Call
    </Button>

    {/* Footer Links & Credits */}
    <div className="mt-8 border-t border-gray-300 dark:border-gray-700 pt-4 text-sm flex flex-col sm:flex-row justify-between items-center px-2 sm:px-6 gap-2 sm:gap-4">

      {/* Left: Credit */}
      <p className="text-gray-600 dark:text-gray-400 font-spartan text-center sm:text-left">
        © 2025, Made with <span className="text-red-500">♥</span> by <span className="font-semibold text-black dark:text-yellow-400">Digital Mojo</span>
      </p>

      {/* Right: Links */}
      <div className="flex gap-4 justify-center flex-wrap text-sm font-spartan">
        <a
          href="https://digitalmojo.in/privacy-policy/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-black dark:text-yellow-300"
        >
          Privacy Policy
        </a>
        <span className="text-gray-400">|</span>
        <a
          href="https://digitalmojo.in/certifications/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-black dark:text-yellow-300"
        >
          ISO 9001:2015 Certified
        </a>
      </div>

    </div>
  </div>
</div>

    </div>
  );
};

export default LeadCalculator;
