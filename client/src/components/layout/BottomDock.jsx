import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Hexagon, Activity, User, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomDock = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const location = useLocation();
    
    // Hide on auction page — the dock covers the bid form
    if (!user || location.pathname.startsWith('/auction')) return null;

    const navItems = [
        { icon: <Hexagon size={24} />, path: '/dashboard', label: 'HUB' },
        { icon: <Activity size={24} />, path: '/network', label: 'NETWORK' },
        { icon: <Radio size={24} />, path: '/events', label: 'EVENTS' },
        { icon: <User size={24} />, path: '/profile', label: 'ID' },
    ];

    return (
        <div className="bottom-dock-container" style={{ 
            position: 'fixed', 
            bottom: '40px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 1000
        }}>
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-morphism"
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px', 
                    padding: '8px 12px',
                    borderRadius: '24px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(40px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {navItems.map((item, idx) => (
                    <NavLink 
                        key={idx} 
                        to={item.path}
                        style={({ isActive }) => ({
                            color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                            background: isActive ? 'rgba(0, 210, 255, 0.05)' : 'transparent',
                            padding: '12px 20px',
                            borderRadius: '18px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            border: `1px solid ${isActive ? 'rgba(0, 210, 255, 0.1)' : 'transparent'}`
                        })}
                    >
                        <motion.div 
                            whileHover={{ scale: 1.1, y: -2 }} 
                            whileTap={{ scale: 0.95 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                        >
                            {item.icon}
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, letterSpacing: '1px' }}>{item.label}</span>
                        </motion.div>
                    </NavLink>
                ))}
            </motion.div>
        </div>
    );
};

export default BottomDock;
