import React, { useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import aiIcon from '../../assets/ai-assistant.png';

const AiChat = ({ auctionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: "Greetings. I am GOCOMET AI, your elite real-estate strategist. I've performed a deep-sector analysis of this asset. Ready for a strategic breakdown and auction prediction?" 
    }
  ]);
  const [loading, setLoading] = useState(false);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/ai/advice/${auctionId}`);
      setMessages([...messages, { role: 'ai', text: data.advice }]);
    } catch (err) {
      setMessages([...messages, { role: 'ai', text: 'Market synthesis in progress. My neural core is currently prioritizing high-latency data streams. Please retry shortly.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1100 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="glass-morphism"
            style={{ 
              width: '350px', 
              height: '450px', 
              marginBottom: '20px', 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255, 215, 0, 0.1)'
            }}
          >
            <div style={{ 
              padding: '15px', 
              background: 'linear-gradient(90deg, #1a1a1a, #2c2c2c)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.1)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={aiIcon} alt="AI Assistant" style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--primary)' }} />
                <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '0.85rem', letterSpacing: '1px' }}>GOCOMET AI</span>
              </div>
              <X 
                size={18} 
                color="#666" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setIsOpen(false)}
              />
            </div>
            
            <div style={{ 
              flex: 1, 
              padding: '20px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px',
              background: 'rgba(0,0,0,0.2)'
            }}>
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'ai' ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  style={{ 
                    alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                    background: msg.role === 'ai' ? 'rgba(255,255,255,0.03)' : 'var(--primary)',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'ai' ? '2px 15px 15px 15px' : '15px 2px 15px 15px',
                    maxWidth: '85%',
                    fontSize: '0.82rem',
                    lineHeight: '1.5',
                    color: msg.role === 'ai' ? '#e0e0e0' : '#000',
                    border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  }}
                >
                  {msg.text}
                </motion.div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '5px', padding: '10px' }}>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                </div>
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={getAdvice} 
                disabled={loading}
                className="glow-button"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  background: 'var(--primary)', 
                  border: 'none',
                  color: '#000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '900',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.3)'
                }}
              >
                <Sparkles size={16} /> ANALYZE ASSET STRATEGY
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '70px', 
          height: '70px', 
          borderRadius: '24px', 
          padding: '0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'var(--primary)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(255, 215, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <img 
          src={aiIcon} 
          alt="AI Button" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }} 
        />
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
          transform: 'translateX(-100%)',
          animation: 'shimmer 2s infinite'
        }} />
      </motion.button>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AiChat;
