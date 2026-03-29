import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, User, LogOut, Zap, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!user) return null;

    const navItems = [
        { path: '/dashboard', icon: <Layout size={20} />, label: 'DASHBOARD' },
        { path: '/profile', icon: <User size={20} />, label: 'PROFILE' },
    ];

    return (
        <motion.nav 
            initial={{ y: -100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            className="iphone-nav"
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '0 20px',
                width: '90%',
                maxWidth: '900px',
                position: 'fixed',
                left: '50%',
                top: '20px',
                zIndex: 1000,
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: '50px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '70px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
        >
            {/* Left Section */}
            <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '8px 15px',
                        borderRadius: '40px',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                    <ArrowLeft size={16} /> 
                </button>

                {navItems.map(item => (
                    <Link 
                        key={item.path}
                        to={item.path} 
                        style={{ 
                            padding: '10px 18px',
                            borderRadius: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            color: location.pathname === item.path ? '#000' : 'rgba(255,255,255,0.6)',
                            background: location.pathname === item.path ? 'var(--primary)' : 'transparent',
                            transition: 'all 0.3s ease',
                            fontSize: '0.65rem',
                            fontWeight: 800
                        }}
                    >
                        {item.icon}
                        {location.pathname === item.path && <span>{item.label}</span>}
                    </Link>
                ))}
            </div>

            {/* Center Section (Logo) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#fff', padding: '4px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
                    <img src={logo} alt="GOCOMET" style={{ height: '24px', objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '2px', color: '#fff', opacity: 0.8 }}>GOCOMET</span>
            </div>

            {/* Right Section */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={handleLogout}
                    style={{
                        background: 'rgba(244,63,94,0.1)',
                        border: '1px solid rgba(244,63,94,0.2)',
                        padding: '10px 20px',
                        borderRadius: '40px',
                        cursor: 'pointer',
                        color: '#f43f5e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                        fontSize: '0.65rem',
                        fontWeight: 900
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(244,63,94,0.2)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(244,63,94,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(244,63,94,0.1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <LogOut size={16} />
                    <span>LOGOUT</span>
                </button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
