import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from './components/HeroSection';
import footer_for_customer_support from '../../../assets/productsImages/footer_for_customer_support.png'
import CustomerSupportForm from './components/CustomerSupportForm';
import { useEffect } from 'react';

const CustomerSupport: React.FC = () => {
  // === Framer Motion Variants ===
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        duration: 0.8,
        ease: "easeOut"
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };
  
  useEffect(() => {
      document.title = "Customer Support - Beesee Global Technology Inc.;"
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Animated container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible" 
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants}>
          <HeroSection />
        </motion.div>

        {/* Image */}
        <motion.div variants={itemVariants}>
          <CustomerSupportForm />
          {/* <img 
            src={footer_for_customer_support} 
            alt="customer support" 
            className='w-full'
          /> */}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CustomerSupport;
