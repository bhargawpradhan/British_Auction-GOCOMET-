import React from 'react';
import { User, Shield, CreditCard, Activity, LogOut, Key, Fingerprint, CheckCircle } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import GlowButton from '../components/common/GlowButton';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const Profile = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [profileData, setProfileData] = React.useState(user);
    const [isBiometricEnabled, setIsBiometricEnabled] = React.useState(true);
    const [signature, setSignature] = React.useState(user?.id || 'GC-X772-9912-KB88');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [showFingerprint, setShowFingerprint] = React.useState(false);
    const [scanStatus, setScanStatus] = React.useState('scanning'); // 'scanning', 'success'

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                setProfileData(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    if (!user) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="glow-text">UNAUTHORIZED_ACCESS_DENIED</p>
        </div>
    );

    const handleBiometricToggle = () => {
        setScanStatus('scanning');
        setShowFingerprint(true);
        setTimeout(() => {
            setScanStatus('success');
            setTimeout(() => {
                setIsBiometricEnabled(prev => !prev);
                setShowFingerprint(false);
            }, 800);
        }, 2000);
    };

    const generateNewSignature = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const randomChunk = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            setSignature(`GC-${randomChunk()}-${randomChunk()}-${randomChunk()}`);
            setIsGenerating(false);
        }, 600);
    };

    const stats = [
        { label: 'NODE_REPUTATION', value: 'PREMIUM', icon: <Shield size={16} color="var(--primary)" /> },
        { label: 'TOTAL_BIDS', value: profileData?.totalBids?.toString() || '0', icon: <Activity size={16} color="#8b5cf6" /> },
        { label: 'ACCOUNT_TYPE', value: profileData?.role?.toUpperCase() || 'BIDDER', icon: <Key size={16} color="#f59e0b" /> },
    ];

    return (
        <div className="profile-page" style={{ padding: '80px 5%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '800px' }}
            >
                <header style={{ marginBottom: '50px', textAlign: 'center' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(0, 210, 255, 0.3)',
                        border: '4px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <User size={50} color="#fff" />
                    </div>
                    <h1 className="glow-text" style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', wordSpacing: '8px' }}>
                        {user.name ? user.name.replace(/([A-Z])/g, ' $1').trim().toUpperCase() : 'ANONYMOUS_NODE'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '2px', marginTop: '5px' }}>NODE_ID: {user.email?.split('@')[0].toUpperCase() || 'UNKNOWN'}</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    {stats.map((stat, idx) => (
                        <GlassCard key={idx} style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>{stat.icon}</div>
                            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900, marginBottom: '5px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{stat.value}</div>
                        </GlassCard>
                    ))}
                </div>

                <GlassCard style={{ padding: '40px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '30px', letterSpacing: '2px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>SECURITY_PROTOCOL</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div
                            onClick={handleBiometricToggle}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        >
                            <div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>BIOMETRIC_SYNC</h3>
                                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                                    {isBiometricEnabled ? 'Enabled for instant bid validation' : 'Disabled — requiring manual terminal input'}
                                </p>
                            </div>
                            <div
                                style={{
                                    width: '40px', height: '22px', borderRadius: '20px',
                                    background: isBiometricEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', padding: '0 4px',
                                    justifyContent: isBiometricEnabled ? 'flex-end' : 'flex-start',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <motion.div
                                    layout
                                    style={{ width: '14px', height: '14px', borderRadius: '50%', background: isBiometricEnabled ? '#fff' : 'rgba(255,255,255,0.5)' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>DIGITAL_SIGNATURE</h3>
                                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontFamily: 'monospace', letterSpacing: '1px' }}>
                                    {isGenerating ? 'GENERATING...' : signature}
                                </p>
                            </div>
                            <div onClick={generateNewSignature}>
                                <GlowButton style={{ padding: '8px 15px', fontSize: '0.65rem' }}>GENERATE_NEW</GlowButton>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                        style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', padding: '15px 40px', borderRadius: '100px', color: '#ff4444', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        <LogOut size={16} /> TERMINATE_SESSION
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                {showFingerprint && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(2, 6, 23, 0.90)', backdropFilter: 'blur(16px)',
                            zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            animate={scanStatus === 'scanning' ? { scale: [1, 1.1, 1] } : { scale: 1.2 }}
                            transition={scanStatus === 'scanning' ? { repeat: Infinity, duration: 1.5 } : { duration: 0.3 }}
                            style={{
                                width: '120px', height: '120px', borderRadius: '50%',
                                border: `2px solid ${scanStatus === 'scanning' ? 'var(--primary)' : '#10b981'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 0 40px ${scanStatus === 'scanning' ? 'rgba(0,210,255,0.4)' : 'rgba(16,185,129,0.4)'}`,
                                marginBottom: '30px'
                            }}
                        >
                            {scanStatus === 'scanning' ? (
                                <Fingerprint size={60} color="var(--primary)" />
                            ) : (
                                <CheckCircle size={60} color="#10b981" />
                            )}
                        </motion.div>
                        <h2 className="glow-text" style={{ fontSize: '1.5rem', marginBottom: '10px', color: scanStatus === 'scanning' ? 'var(--primary)' : '#10b981', letterSpacing: '2px' }}>
                            {scanStatus === 'scanning' ? 'BIOMETRIC SCAN IN PROGRESS' : 'VERIFIED'}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                            {scanStatus === 'scanning' ? 'Awaiting node authorization...' : 'Security protocol updated'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
