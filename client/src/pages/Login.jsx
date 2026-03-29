import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Hammer } from 'lucide-react';
import logo from '../assets/logo.png';
import api from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('bidder'); // default role
    const navigate = useNavigate();

    const tabs = [
        { id: 'admin', icon: <ShieldCheck size={18} />, label: 'ADMIN' },
        { id: 'bidder', icon: <User size={18} />, label: 'BIDDER' },
        { id: 'maker', icon: <Hammer size={18} />, label: 'BID_MAKER' },
    ];

    const rolesInfo = {
        admin: "System Oversight & Protocol Management",
        bidder: "Terminal Access for Real-Time RFQ Bidding",
        maker: "Auction Provisioning & Strategic Config"
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            // Full reload clears all stale React state from previous session
            window.location.href = '/dashboard';
        } catch (err) {
            alert(err.response?.data?.message || 'Authentication Protocol Failure');
        }
    };

    return (
        <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
                className="glass-morphism" 
                style={{ width: '450px', padding: '50px', border: '1px solid rgba(0,210,255,0.2)' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '15px', display: 'inline-flex', alignItems: 'center', marginBottom: '20px' }}>
                        <img src={logo} alt="GOCOMET" style={{ height: '50px', objectFit: 'contain' }} />
                    </div>
                    <h2 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px' }}>GOCOMET_ACCESS</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>BRITISH AUCTION TERMINAL</p>
                </div>

                {/* Role Switcher */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '6px', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                transition: 'all 0.3s ease',
                                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab.id ? '#000' : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        style={{ textAlign: 'center', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '30px', fontWeight: 600 }}
                    >
                        {rolesInfo[activeTab]}
                    </motion.p>
                </AnimatePresence>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>IDENTITY_TOKEN (EMAIL)</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass-morphism"
                            style={{ width: '100%', padding: '15px 20px', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: '1.1rem' }}
                            placeholder={`${activeTab}@gocomet.com`}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '40px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>ACCESS_KEY (PASSWORD)</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-morphism"
                            style={{ width: '100%', padding: '15px 20px', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: '1.1rem' }}
                            placeholder="********"
                            required
                        />
                    </div>
                    <button type="submit" className="bid-button" style={{ width: '100%', padding: '18px', fontSize: '1.1rem' }}>
                        AUTHORIZE_ACCESS
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>
                    Awaiting authorization? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Initialize ID</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
