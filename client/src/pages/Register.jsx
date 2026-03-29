import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Shield, User as UserIcon } from 'lucide-react';
import logo from '../assets/logo.png';
import api from '../utils/api';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('bidder');
    const navigate = useNavigate();

    const roles = [
        { id: 'bidder', label: 'BIDDER' },
        { id: 'maker', label: 'BID_MAKER' },
    ];

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Admin accounts cannot be self-registered
        if (role === 'admin') {
            alert('Admin accounts are provisioned by system operators. Please select BIDDER or BID_MAKER.');
            return;
        }

        try {
            await api.post('/auth/register', { name, email, password, role });
            alert(`Account created! You can now log in as ${role === 'maker' ? 'BID_MAKER' : 'BIDDER'}.`);
            window.location.href = '/login';
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Registration failed. Check your details and try again.';
            alert(`Registration Error: ${msg}`);
        }
    };

    return (
        <div className="register-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
                className="glass-morphism" 
                style={{ width: '500px', padding: '60px', border: '1px solid rgba(0,210,255,0.2)' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '15px', display: 'inline-flex', alignItems: 'center', marginBottom: '20px' }}>
                        <img src={logo} alt="GOCOMET" style={{ height: '40px', objectFit: 'contain' }} />
                    </div>
                    <h2 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '10px' }}>GOCOMET_REGISTRY</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '2px' }}>Initialize Real Estate Node Access</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>LEGAL_ENTITY_NAME</label>
                        <div style={{ position: 'relative' }}>
                            <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="glass-morphism"
                                style={{ width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: '1rem' }}
                                placeholder="Full Name or Org"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>IDENTITY_TOKEN (EMAIL)</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-morphism"
                                style={{ width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: '1rem' }}
                                placeholder="node@gocomet.network"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>ACCESS_KEY (PASSWORD)</label>
                        <div style={{ position: 'relative' }}>
                            <Shield size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-morphism"
                                style={{ width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(255,255,255,0.02)', color: '#fff', fontSize: '1rem' }}
                                placeholder="********"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>PROTOCOL_PERMISSION_LEVEL</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {roles.map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRole(r.id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        background: role === r.id ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                                        color: role === r.id ? '#000' : 'rgba(255,255,255,0.5)',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="bid-button" style={{ width: '100%', padding: '18px', fontSize: '1.1rem' }}>
                        INITIALIZE_IDENTITY
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)' }}>
                    Identity already active? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Enter Terminal</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
