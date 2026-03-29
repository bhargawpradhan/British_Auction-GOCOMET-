import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, TrendingDown, ChevronRight, Plus, Activity, Zap, Users } from 'lucide-react';
import logo from '../assets/logo.png';
import api from '../utils/api';
import GlassCard from '../components/common/GlassCard';
import GlowButton from '../components/common/GlowButton';
import CreateAuctionModal from '../components/CreateAuctionModal';
import { motion } from 'framer-motion';
import { formatPrice, getCurrencySymbol } from '../utils/currency';

const Dashboard = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalActive: 0, totalVolume: '0' });
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin' || user?.role === 'maker';

    const fetchAuctions = async () => {
        try {
            const { data } = await api.get('/auctions');
            setAuctions(data);
            setStats({
                totalActive: data.filter(a => a.status === 'active').length,
                totalVolume: data.reduce((acc, curr) => acc + (curr.currentL1 || 0), 0).toLocaleString()
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
        if (location.state?.openCreateModal && isAdmin) {
            setIsModalOpen(true);
        }
    }, [location.state, isAdmin]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div className="l1-glow" style={{ width: '40px', height: '40px', background: 'var(--primary)' }} />
            <p className="glow-text" style={{ letterSpacing: '4px', fontSize: '0.8rem' }}>SYNCING_BRITISH_AUCTION_NEURAL_NODES...</p>
        </div>
    );

    return (
        <div className="dashboard" style={{ padding: '40px 5%', minHeight: '100vh' }}>
            {/* Platform Stats Header */}
            <header style={{ marginBottom: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                        <div style={{ background: '#fff', padding: '8px 15px', borderRadius: '15px', display: 'flex', alignItems: 'center' }}>
                            <img src={logo} alt="GOCOMET" style={{ height: '40px', objectFit: 'contain' }} />
                        </div>
                        <h1 className="glow-text" style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-3px', marginBottom: '0' }}>BRITISH_AUCTION_TERMINAL</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 800 }}>
                            <Activity size={14} color="#10b981" /> SERVER_STATUS: <span style={{ color: '#10b981' }}>OPTIMAL</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 800 }}>
                            <Users size={14} color="var(--primary)" /> NODE_ID: <span style={{ color: '#fff' }}>{user?.name?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <GlassCard style={{ padding: '15px 25px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '200px' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>{getCurrencySymbol('INR')}{stats.totalVolume}</span>
                    </GlassCard>
                    {isAdmin && (
                        <GlowButton
                            onClick={() => setIsModalOpen(true)}
                            style={{ height: 'fit-content', padding: '18px 30px' }}
                        >
                            <Plus size={20} style={{ marginRight: '10px' }} /> NEW_PROTOCOL
                        </GlowButton>
                    )}
                </div>
            </header>

            <CreateAuctionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAuctions}
                initialData={location.state}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '40px' }}>
                {auctions.map((auction, index) => (
                    <motion.div
                        key={auction._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard style={{ padding: '0', overflow: 'hidden', border: auction.status === 'force_closed' ? '1px solid rgba(244,63,94,0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', height: '100%',
                                    width: auction.status === 'active' ? '65%' : '100%',
                                    background: auction.status === 'active' ? 'var(--primary)' : auction.status === 'force_closed' ? '#f43f5e' : '#94a3b8',
                                    boxShadow: auction.status === 'active' ? '0 0 10px var(--primary)' : 'none'
                                }} />
                            </div>

                            <div style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{
                                        background: auction.status === 'active' ? 'rgba(0,255,100,0.05)' : auction.status === 'force_closed' ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.02)',
                                        padding: '5px 14px', borderRadius: '100px', fontSize: '0.6rem',
                                        color: auction.status === 'active' ? '#10b981' : auction.status === 'force_closed' ? '#f43f5e' : '#94a3b8',
                                        fontWeight: 900, letterSpacing: '2px',
                                        border: `1px solid ${auction.status === 'active' ? 'rgba(16,185,129,0.2)' : auction.status === 'force_closed' ? 'rgba(244,63,94,0.25)' : 'rgba(255,255,255,0.05)'}`
                                    }}>
                                        <Zap size={10} style={{ marginRight: '5px', display: 'inline' }} />
                                        {auction.status === 'force_closed' ? '🔒 FORCE CLOSED' : auction.status.toUpperCase()}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {auction.extensionCount > 0 && (
                                            <span style={{ fontSize: '0.58rem', color: '#fbbf24', fontWeight: 800, background: 'rgba(251,191,36,0.08)', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.2)' }}>
                                                ⏱ ×{auction.extensionCount} EXT
                                            </span>
                                        )}
                                        <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 900, background: 'rgba(0,210,255,0.1)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(0,210,255,0.2)', letterSpacing: '1px' }}>
                                            {auction.currency}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.3, fontWeight: 800 }}>#{auction._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                </div>

                                <h3 style={{ marginBottom: '8px', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>{auction.title}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '24px', lineHeight: '1.6', height: '42px', overflow: 'hidden' }}>
                                    {auction.description}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', fontSize: '0.45rem', color: '#fbbf24', background: 'rgba(251,191,36,0.08)', fontWeight: 900 }}>L1_LEADER</div>
                                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900, display: 'block', marginBottom: '4px' }}>CURRENT_L1</span>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>{formatPrice(auction.currentL1, auction.currency)}</span>
                                            <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', marginTop: '2px', opacity: 0.8 }}>
                                                {auction.l1Bidder?.name || 'Awaiting Protocols'}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900, display: 'block', marginBottom: '4px' }}>BID_CLOSE</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{new Date(auction.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {auction.forcedCloseTime && (
                                        <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.12)', gridColumn: '1/-1' }}>
                                            <span style={{ fontSize: '0.58rem', color: 'rgba(244,63,94,0.7)', fontWeight: 900, display: 'block', marginBottom: '4px' }}>🔒 FORCED_CLOSE_TIME</span>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'rgba(244,63,94,0.9)' }}>{new Date(auction.forcedCloseTime).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', WebkitMaskImage: 'linear-gradient(to right, black, transparent)' }}>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid var(--bg-dark)', marginLeft: i > 1 ? '-10px' : '0' }} />
                                        ))}
                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginLeft: '10px', fontWeight: 800 }}>+12 ACTIVE</span>
                                    </div>
                                    <Link to={`/auction/${auction._id}`} className="bid-button" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                        ENTER <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}

                {auctions.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                        <div style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '20px' }}>🛰️</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>NO_ACTIVE_PROTOCOLS_FOUND</h3>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem', marginTop: '10px' }}>Waiting for node administrator to initialize neural RFQ streams.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
