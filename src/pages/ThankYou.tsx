import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, Sparkles, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useLeadCalculator } from '@/hooks/useLeadCalculator';
import EnhancedCharts from '@/components/EnhancedCharts';
import BounceButton from '@/components/BounceButton';

const ThankYou = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [isDarkMode] = useState(false);

  const {
    propertyType, setPropertyType,
    launchType, setLaunchType,
    location, setLocation,
    bhk, setBhk,
    marketingChannels, setMarketingChannels,
    sellUnits, setSellUnits,
    duration, setDuration,
    metrics, 
    isFormValid,
    chartData
  } = useLeadCalculator(routerLocation.state?.calculatorState);

  // Scroll to results if we came from the calculator and it was already unlocked
  useEffect(() => {
    if (routerLocation.state?.unlocked) {
      setTimeout(() => {
        const resultsSection = document.getElementById("results-section-thankyou");
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 800);
    }
  }, [routerLocation.state]);

  const handleBookCall = () => {
    window.location.href = 'https://digitalmojo.in/contact/';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-[#f0bc00] text-black'}`}>
      
      {/* Success Message Header */}
      <div className="pt-12 pb-8 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Background Decorative Elements */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1.2 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl pointer-events-none"
        />
        
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, duration: 0.8 }}
          className="mb-6 z-10"
        >
          <div className="bg-white p-4 rounded-full shadow-2xl">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="z-10"
        >
          <h1 className="text-4xl md:text-6xl font-black font-spartan mb-4 leading-tight">
            THANK <span className="text-white">YOU!</span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-4 text-xl font-spartan font-bold">
            <Sparkles className="w-5 h-5 text-white" />
            <span>Success! We've received your request.</span>
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <p className="text-lg md:text-xl font-spartan mb-8 max-w-lg mx-auto leading-relaxed">
            Our specialized strategy team is already reviewing your goals. 
            <span className="block mt-1 font-bold">Expect a call from us within 24 hours.</span>
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 my-10">
        <Separator className="bg-white/30 dark:bg-gray-800" />
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        
        {/* The Question Box (Input Card) */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-spartan mb-6 text-center italic">Refine Your Numbers Below</h2>
          <Card className="backdrop-blur-lg border-none shadow-2xl rounded-3xl overflow-hidden bg-white/95 max-w-4xl mx-auto">
            <CardHeader className="pb-2">
              <h3 className="text-xl font-bold text-center text-gray-900 font-spartan">The Question Box</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Units to Sell */}
                <div className="md:col-span-2 mb-4">
                  <label className="text-foreground text-center text-lg font-bold mb-3 block font-spartan">Units to Sell</label>
                  <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 w-10 p-0 border-2 border-secondary hover:border-primary rounded-lg"
                      onClick={() => setSellUnits(Math.max(1, sellUnits - 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={sellUnits}
                      onChange={(e) => setSellUnits(Math.max(1, parseInt(e.target.value) || 0))}
                      className="bg-background border-2 border-secondary text-center font-extrabold text-2xl h-14 w-28 rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 w-10 p-0 border-2 border-secondary hover:border-primary rounded-lg"
                      onClick={() => setSellUnits(sellUnits + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-2 block font-spartan">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="bg-white border-2 border-muted rounded-xl h-12">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Plots">Plots</SelectItem>
                      <SelectItem value="Shops cum Offices">Shops cum Offices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Launch Type */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-2 block font-spartan">Launch Type</label>
                  <Select value={launchType} onValueChange={setLaunchType}>
                    <SelectTrigger className="bg-white border-2 border-muted rounded-xl h-12">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teaser">Pre-Launch</SelectItem>
                      <SelectItem value="Launch">Launch</SelectItem>
                      <SelectItem value="Sustenance">On-Going</SelectItem>
                      <SelectItem value="NRI">NRI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-2 block font-spartan">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-white border-2 border-muted rounded-xl h-12">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
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
                  <label className="text-foreground text-sm font-semibold mb-2 block font-spartan">Configuration</label>
                  <Select value={bhk} onValueChange={setBhk}>
                    <SelectTrigger className="bg-white border-2 border-muted rounded-xl h-12">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent>
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

                {/* Channels */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-2 block font-spartan">Marketing Channels</label>
                  <Select value={marketingChannels} onValueChange={setMarketingChannels}>
                    <SelectTrigger className="bg-white border-2 border-muted rounded-xl h-12">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google">Google Ads</SelectItem>
                      <SelectItem value="Meta">Meta Ads</SelectItem>
                      <SelectItem value="G+M">Google Ads+Meta Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-foreground text-sm font-semibold mb-2 block font-spartan">Duration</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-white border-2 border-muted rounded-xl h-12">
                      <SelectValue placeholder="-select-" />
                    </SelectTrigger>
                    <SelectContent>
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
              
              <div className="mt-8 text-center">
                <Button 
                  onClick={() => {
                    const results = document.getElementById('results-section-thankyou');
                    results?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  disabled={!isFormValid}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-12 rounded-2xl text-xl shadow-xl transform hover:scale-105 transition-all font-spartan"
                >
                  Show me the Numbers!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto px-4 my-16">
          <Separator className="bg-white/30 dark:bg-gray-800" />
        </div>

        {/* The Answer Box (Results Section) */}
        <div id="results-section-thankyou" className="pt-8">
          <Card className="backdrop-blur-lg border-none shadow-2xl rounded-3xl overflow-hidden bg-white/95">
            <CardHeader className="pb-4">
              <h3 className="text-2xl font-bold text-center text-gray-900 font-spartan">The Answer Box (Results)</h3>
            </CardHeader>
            <CardContent className="p-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Leads", count: metrics.leads, cost: metrics.cpl, full: "Cost Per Lead" },
                  { label: "Qualified Leads", count: metrics.qualifiedLeads, cost: metrics.cpql, full: "Cost Per Qualified Lead" },
                  { label: "Site Visits", count: metrics.siteVisits, cost: metrics.cpsv, full: "Cost Per Site Visit" },
                  { label: "Bookings", count: metrics.bookings, cost: metrics.cpb, full: "Cost Per Booking" }
                ].map((item, idx) => (
                  <Card key={idx} className="border-none shadow-md rounded-2xl text-center p-4 bg-gray-50 flex flex-col items-center justify-center">
                    <div className="text-lg font-bold text-gray-500 mb-1 font-spartan">{item.label}</div>
                    <div className="text-xl font-black text-black mb-2">{item.count.toLocaleString()}</div>
                    <Separator className="w-12 my-2 bg-gray-200" />
                    <div className="text-3xl font-black text-red-600">₹{item.cost.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.full}</div>
                  </Card>
                ))}
              </div>

              {/* Total Budget */}
              <div className="bg-black text-white p-8 rounded-3xl text-center mb-8 shadow-2xl">
                <h4 className="text-lg font-bold font-spartan mb-2 text-gray-400 uppercase tracking-widest">Estimated Total Budget</h4>
                <p className="text-5xl md:text-6xl font-black text-yellow-400">₹{metrics.totalBudget.toLocaleString()}</p>
              </div>

              {/* Charts */}
              <EnhancedCharts
                metrics={metrics}
                chartData={chartData}
                duration={duration}
              />
              
              <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
                <BounceButton
                  onClick={handleBookCall}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-12 rounded-2xl text-xl shadow-xl font-spartan"
                >
                  <Calendar className="mr-2 h-6 w-6" />
                  FREE Strategy Call
                </BounceButton>
                
                <Button
                  onClick={() => navigate('/', { 
                    state: { 
                      unlocked: true,
                      calculatorState: {
                        propertyType, launchType, location, bhk, marketingChannels, sellUnits, duration, metrics
                      }
                    } 
                  })}
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-black hover:text-white font-bold py-6 px-12 rounded-2xl text-xl font-spartan transition-all"
                >
                  <Home className="mr-2 h-6 w-6" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
