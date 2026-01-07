import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from './components/HeroSection'; 
import { useEffect, useState } from 'react';
import Disclaimer from '../../../components/feedback/Disclaimer'

const CustomerSupport: React.FC = () => {
  const [openModal, setOpenModal] = useState<boolean>(true)

  const handleCloseModal = () => {
    setOpenModal(false)
  }

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
      

      {/* Modal Component */}
      <Disclaimer 
        open={openModal}
        onClose={handleCloseModal}
      />

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
 
        {/* <motion.div variants={itemVariants}>
          <CustomerSupportForm /> 
        </motion.div> */}
      </motion.div>
    </div>
  );
};

export default CustomerSupport;
