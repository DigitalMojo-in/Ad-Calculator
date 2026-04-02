import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0bc00] px-4 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1.2 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1.2 }}
        transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-2xl w-full text-center z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8 
          }}
          className="mb-8 flex justify-center"
        >
          <div className="bg-white p-6 rounded-full shadow-2xl">
            <CheckCircle2 className="w-24 h-24 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-5xl md:text-7xl font-black font-spartan text-black mb-6 leading-tight">
            THANK <span className="text-white">YOU!</span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-6 text-2xl font-spartan font-bold text-gray-900">
            <Sparkles className="w-6 h-6 text-white" />
            <span>Success! We've received your request.</span>
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <p className="text-xl md:text-2xl font-spartan text-gray-800 mb-12 max-w-lg mx-auto leading-relaxed">
            Our specialized strategy team is already reviewing your goals. 
            <span className="block mt-2 font-bold">Expect a call from us within 24 hours.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Button
            onClick={() => navigate('/', { state: { ...location.state, unlocked: true } })}
            className="group bg-black text-white hover:bg-gray-900 text-xl font-bold py-8 px-10 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 font-spartan w-full sm:w-auto"
          >
            <ArrowLeft className="mr-3 w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            Back to Results
          </Button>

          {/* <Button
            onClick={() => window.location.href = 'https://digitalmojo.in'}
            variant="outline"
            className="bg-transparent border-4 border-black text-black hover:bg-black hover:text-white text-xl font-bold py-8 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 font-spartan w-full sm:w-auto"
          >
            <Home className="mr-3 w-6 h-6" />
            Visit Website
          </Button> */}
        </motion.div>
      </div>

      {/* Decorative Floor */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-white to-red-600 opacity-20" />
    </div>
  );
};

export default ThankYou;
