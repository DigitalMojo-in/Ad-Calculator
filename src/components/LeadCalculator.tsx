import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Phone, Mail, MapPin, Clock, Users, TrendingUp, DollarSign, Target, Zap, ArrowRight, Star, CheckCircle, BarChart3, PieChart, Award, Sparkles, Calculator } from 'lucide-react';
import { EnhancedCharts } from './EnhancedCharts';
import { cplData } from '@/data/cplData';
import { BounceButton } from './BounceButton';
import { useScrollAnimations } from '@/hooks/useScrollAnimations';

interface FormData {
  industry: string;
  budget: string;
  location: string;
  businessType: string;
  targetAudience: string;
  currentLeads: string;
  conversionGoal: string;
}

interface CalculationResults {
  estimatedLeads: number;
  costPerLead: number;
  conversionRate: number;
  monthlyRevenue: number;
  roi: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

const LeadCalculator = () => {
  const [formData, setFormData] = useState<FormData>({
    industry: '',
    budget: '',
    location: '',
    businessType: '',
    targetAudience: '',
    currentLeads: '',
    conversionGoal: ''
  });

  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Initialize scroll animations
  useScrollAnimations();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const scrollToCalculator = () => {
    calculatorRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const calculateResults = () => {
    if (!formData.industry || !formData.budget) {
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const budget = parseFloat(formData.budget);
      const industryData = cplData.find(data => 
        data.industry.toLowerCase() === formData.industry.toLowerCase()
      );
      
      const baseCPL = industryData?.averageCPL || 50;
      const locationMultiplier = getLocationMultiplier(formData.location);
      const businessTypeMultiplier = getBusinessTypeMultiplier(formData.businessType);
      
      const adjustedCPL = baseCPL * locationMultiplier * businessTypeMultiplier;
      const estimatedLeads = Math.floor(budget / adjustedCPL);
      const conversionRate = industryData?.conversionRate || 0.02;
      const avgOrderValue = industryData?.avgOrderValue || 1000;
      
      const calculatedResults: CalculationResults = {
        estimatedLeads,
        costPerLead: adjustedCPL,
        conversionRate: conversionRate * 100,
        monthlyRevenue: estimatedLeads * conversionRate * avgOrderValue,
        roi: ((estimatedLeads * conversionRate * avgOrderValue - budget) / budget) * 100,
        impressions: Math.floor(budget * 20),
        clicks: Math.floor(budget * 0.5),
        ctr: 2.5
      };
      
      setResults(calculatedResults);
      setShowResults(true);
      setIsLoading(false);
    }, 2000);
  };

  const getLocationMultiplier = (location: string): number => {
    const multipliers: Record<string, number> = {
      'usa': 1.2,
      'canada': 1.1,
      'uk': 1.15,
      'australia': 1.1,
      'india': 0.3,
      'other': 0.8
    };
    return multipliers[location.toLowerCase()] || 1;
  };

  const getBusinessTypeMultiplier = (type: string): number => {
    const multipliers: Record<string, number> = {
      'b2b': 1.5,
      'b2c': 1.0,
      'ecommerce': 0.8,
      'saas': 2.0,
      'local': 0.7
    };
    return multipliers[type.toLowerCase()] || 1;
  };

  const generateTimeSeriesData = () => {
    if (!results) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      leads: Math.floor(results.estimatedLeads * (1 + index * 0.15)),
      revenue: Math.floor(results.monthlyRevenue * (1 + index * 0.15)),
      conversions: Math.floor(results.estimatedLeads * (results.conversionRate / 100) * (1 + index * 0.15))
    }));
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechStart Inc.",
      text: "Digital Mojo increased our leads by 300% in just 3 months!",
      rating: 5
    },
    {
      name: "Mike Chen",
      company: "GrowthCorp",
      text: "ROI went from 150% to 400% with their optimization strategies.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      company: "ScaleUp Solutions",
      text: "Best investment we made for our marketing. Highly recommended!",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const chartData = generateTimeSeriesData();

  return (
    <div id="mouse-tracker" className={`min-h-screen px-0 transition-colors duration-300`} style={{ backgroundColor: isDarkMode ? '#000000' : '#f0bc00' }}>

      {/* Desktop Theme Toggle - Left Wall */}
      <div className="hidden sm:block fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <div className="flex flex-col items-center space-y-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
          <Sun className={`h-6 w-6 ${!isDarkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
          <Switch
            checked={isDarkMode}
            onCheckedChange={setIsDarkMode}
            className="data-[state=checked]:bg-gray-800"
          />
          <Moon className={`h-6 w-6 ${isDarkMode ? 'text-blue-300' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* Mobile Theme Toggle - Top Right */}
      <div className="sm:hidden fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
          <Sun className={`h-4 w-4 ${!isDarkMode ? 'text-yellow-500' : 'text-gray-400'}`} />
          <Switch
            checked={isDarkMode}
            onCheckedChange={setIsDarkMode}
            className="data-[state=checked]:bg-gray-800 scale-75"
          />
          <Moon className={`h-4 w-4 ${isDarkMode ? 'text-blue-300' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-green-500/20"></div>
        
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Left - Hero Content */}
            <div className="space-y-6 sm:space-y-8" data-scroll-animation="slide-in-left">
              
              {/* Logo */}
              <div className="flex justify-center lg:justify-start mb-6">
                <img 
                  src="./lovable-uploads/DMM.png" 
                  alt="Digital Mojo Marketing" 
                  className="h-16 sm:h-20 w-auto object-contain"
                />
              </div>

              {/* Main Heading */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4">
                  Calculate Your
                  <span className="block text-primary-600 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Lead Generation
                  </span>
                  <span className="block">Potential</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-2xl mx-auto lg:mx-0">
                  Discover how many qualified leads you can generate with our proven digital marketing strategies. Get instant estimates tailored to your industry and budget.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <BounceButton
                  onClick={scrollToCalculator}
                  className="hover-target bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate My Leads
                </BounceButton>
                
                <Button
                  variant="outline"
                  className="hover-target border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Free Strategy Call
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">10M+</div>
                  <div className="text-sm text-gray-600">Leads Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">300%</div>
                  <div className="text-sm text-gray-600">Avg ROI Increase</div>
                </div>
              </div>

              {/* Mobile CTA Text */}
              <div className="sm:hidden text-center">
                <p 
                  onClick={scrollToCalculator}
                  className="hover-target text-lg font-semibold text-gray-800 cursor-pointer hover:text-green-600 transition-colors animate-pulse"
                >
                  👇 Fill in the data to know your ad spend
                </p>
              </div>

              {/* Desktop Image moved here */}
              <div className="mt-8 mr-[50px] flex justify-end pr-50 sm:pr-10">
  <img
    src="./lovable-uploads/img.png"
    alt="Business Growth Calculator"
    className="hidden sm:block w-full max-w-md lg:max-w-lg object-contain opacity-90"
  />
</div>

            </div>

            {/* Right - Calculator */}
            <Card className="backdrop-blur-lg border-none shadow-xl rounded-2xl overflow-hidden bg-white/95 -mt-[180px] h-fit" data-scroll-animation="slide-in-right">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-bold text-center text-gray-900">Calculate Your Leads</h2>
              </CardHeader>
              
              <CardContent className="space-y-4" ref={calculatorRef}>
                {/* Desktop CTA Text */}
                <div className="hidden sm:block text-center mb-6">
                  <p 
                    onClick={scrollToCalculator}
                    className="hover-target text-lg font-semibold text-gray-800 cursor-pointer hover:text-green-600 transition-colors"
                  >
                    👆 Fill in the data to know your ad spend
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Select onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger className="hover-target bg-white">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="realestate">Real Estate</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget">Monthly Ad Budget (USD) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="e.g., 5000"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="hover-target bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Target Location</Label>
                    <Select onValueChange={(value) => handleInputChange('location', value)}>
                      <SelectTrigger className="hover-target bg-white">
                        <SelectValue placeholder="Select target location" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select onValueChange={(value) => handleInputChange('businessType', value)}>
                      <SelectTrigger className="hover-target bg-white">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="b2b">B2B</SelectItem>
                        <SelectItem value="b2c">B2C</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="saas">SaaS</SelectItem>
                        <SelectItem value="local">Local Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <BounceButton
                  onClick={calculateResults}
                  disabled={!formData.industry || !formData.budget || isLoading}
                  className="hover-target w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Visualize Your Growth
                    </>
                  )}
                </BounceButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Results Section with Scroll Animation */}
      {results && (
        <div className="relative" data-scroll-animation="fade-in-up">
          {/* Blur Overlay */}
          {!showResults && (
            <div className="absolute inset-0 backdrop-blur-sm bg-black/20 z-40 flex items-center justify-center rounded-2xl">
              <div className="text-center space-y-4 p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <h3 className="text-2xl font-bold text-white">Calculating Your Results...</h3>
                <p className="text-gray-200">Analyzing your industry data and market conditions</p>
              </div>
            </div>
          )}

          <div className={`container mx-auto px-4 py-12 transition-all duration-1000 ${showResults ? 'results-reveal' : ''}`}>
            <div className="text-center mb-8" data-scroll-animation="scale-in">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your Lead Generation Forecast</h2>
              <p className="text-lg text-gray-700">Based on industry data and your specific requirements</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { icon: Target, label: "Estimated Leads", value: results.estimatedLeads.toLocaleString(), color: "text-green-600" },
                { icon: DollarSign, label: "Cost Per Lead", value: `$${results.costPerLead.toFixed(2)}`, color: "text-blue-600" },
                { icon: TrendingUp, label: "Conversion Rate", value: `${results.conversionRate.toFixed(1)}%`, color: "text-purple-600" },
                { icon: Zap, label: "Monthly Revenue", value: `$${results.monthlyRevenue.toLocaleString()}`, color: "text-orange-600" }
              ].map((metric, index) => (
                <Card key={index} className="hover-target text-center p-6 hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm" data-scroll-animation="scale-in">
                  <metric.icon className={`h-8 w-8 ${metric.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </Card>
              ))}
            </div>

            {/* Charts Section */}
            <div className="mb-12" data-scroll-animation="slide-in-right">
              <EnhancedCharts data={chartData} />
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-6 bg-white/90 backdrop-blur-sm rounded-2xl p-8" data-scroll-animation="fade-in-up">
              <h3 className="text-2xl font-bold text-gray-900">Ready to Turn These Numbers Into Reality?</h3>
              <p className="text-lg text-gray-700">Our expert team will help you achieve these results and more.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <BounceButton className="hover-target bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold">
                  <Phone className="mr-2 h-5 w-5" />
                  Book Free Strategy Call
                </BounceButton>
                
                <Button variant="outline" className="hover-target border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold">
                  <Mail className="mr-2 h-5 w-5" />
                  Get Detailed Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      <div className="bg-white/80 backdrop-blur-sm py-16" data-scroll-animation="fade-in-up">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-lg text-gray-700">Join hundreds of successful businesses</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="hover-target p-8 text-center bg-white/90 backdrop-blur-sm shadow-lg">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl text-gray-800 mb-4 italic">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
              <div className="text-gray-600">{testimonials[currentTestimonial].company}</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky-cta">
        <BounceButton className="hover-target bg-green-600 hover:bg-green-700 text-white px-6 py-3 shadow-2xl">
          <Phone className="mr-2 h-4 w-4" />
          Get Started Today
        </BounceButton>
      </div>
    </div>
  );
};

export default LeadCalculator;
