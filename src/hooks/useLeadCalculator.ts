import { useState, useEffect } from 'react';
import { getCPLForLocation } from '@/data/cplData';

export interface Metrics {
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

export const useLeadCalculator = (initialState?: any) => {
  const [propertyType, setPropertyType] = useState(initialState?.propertyType || '');
  const [launchType, setLaunchType] = useState(initialState?.launchType || '');
  const [location, setLocation] = useState(initialState?.location || '');
  const [bhk, setBhk] = useState(initialState?.bhk || '');
  const [marketingChannels, setMarketingChannels] = useState(initialState?.marketingChannels || '');
  const [sellUnits, setSellUnits] = useState(initialState?.sellUnits || 50);
  const [duration, setDuration] = useState(initialState?.duration || '');
  
  const [metrics, setMetrics] = useState<Metrics>(initialState?.metrics || {
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

  const isFormValid = propertyType && launchType && location && bhk && marketingChannels && duration;

  const calculateMetrics = () => {
    if (!isFormValid) return;

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
    cpl = Math.round(cpl * launchMultiplier);
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

  return {
    propertyType, setPropertyType,
    launchType, setLaunchType,
    location, setLocation,
    bhk, setBhk,
    marketingChannels, setMarketingChannels,
    sellUnits, setSellUnits,
    duration, setDuration,
    metrics, calculateMetrics,
    isFormValid,
    chartData: generateTimeSeriesData()
  };
};
