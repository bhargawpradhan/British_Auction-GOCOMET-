import React from 'react';
import { motion } from 'framer-motion';

const GlowButton = ({ children, onClick, style = {}, className = '', type = 'button', disabled = false }) => {
  return (
    <motion.button 
      whileHover={!disabled ? { scale: 1.02, y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      type={type}
      disabled={disabled}
      className={`bid-button ${className}`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '12px', 
        padding: '16px 32px', 
        fontSize: '1rem',
        borderRadius: '16px',
        fontWeight: 800,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
    >
      {children}
    </motion.button>
  );
};

export default GlowButton;
