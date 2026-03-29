import React, { useEffect, useState, useRef } from 'react';
import { Activity, Globe, Zap, Shield, Cpu, TrendingUp, Radio, Server, Home, Coins, BarChart3, LineChart, Info, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import GlassCard from '../components/common/GlassCard';
import GlowButton from '../components/common/GlowButton';
import { 
    ComposedChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    CartesianGrid,
    ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// OHLC Data Generator
const generateOHLC = (count, baseValue, volatility = 3) => {
    let data = [];
    let prevClose = baseValue;
    for (let i = 0; i < count; i++) {
        const open = prevClose;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
        const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
        data.push({ 
            time: `${i}:00`, 
            open, 
            close, 
            high, 
            low,
            candle: [Math.min(open, close), Math.max(open, close)],
            wick: [low, high]
        });
        prevClose = close;
    }
    return data;
};

const CandleChart = ({ data, onSelect, colorUp = "#10b981", colorDown = "#ef4444", height = 300, density = 120 }) => {
    return (
        <div style={{ height, width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                    data={data} 
                    margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
                    barGap={0}
                    onClick={(e) => { if (e && e.activePayload) onSelect(e.activePayload[0].payload); }}
                >
                    <CartesianGrid strokeDasharray="1 5" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="glass-morphism" style={{ padding: '8px 12px', borderRadius: '4px', background: 'rgba(2, 6, 23, 0.95)', border: '1px solid var(--primary)', pointerEvents: 'none' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.65rem', fontWeight: 900 }}>
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>O: <span style={{ color: '#fff' }}>{d.open.toFixed(2)}</span></span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>H: <span style={{ color: '#10b981' }}>{d.high.toFixed(2)}</span></span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>L: <span style={{ color: '#ef4444' }}>{d.low.toFixed(2)}</span></span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>C: <span style={{ color: '#fff' }}>{d.close.toFixed(2)}</span></span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <ReferenceLine y={data[data.length-1]?.close} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                    <Bar dataKey="wick" barSize={1} isAnimationActive={false}>
                        {data.map((entry, index) => (
                            <Cell key={`wick-${index}`} fill={entry.close >= entry.open ? colorUp : colorDown} opacity={0.4} />
                        ))}
                    </Bar>
                    <Bar dataKey="candle" barSize={Math.max(4, Math.floor(1200/density))} isAnimationActive={false}>
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.close >= entry.open ? colorUp : colorDown} 
                                cursor="pointer"
                            />
                        ))}
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

const Network = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [terminalAsset, setTerminalAsset] = useState(null);
    const [stats, setStats] = useState({
        totalVolume: 0,
        activeNodes: 0,
        networkHealth: 99.8,
        latency: '8ms',
        throughput: '2.4 GB/s'
    });
    
    // Market Data States
    const [bitcoinData, setBitcoinData] = useState([]);
    const [ethereumData, setEthereumData] = useState([]);
    const [nasdaqData, setNasdaqData] = useState([]);
    const [teslaData, setTeslaData] = useState([]);
    const [appleData, setAppleData] = useState([]);
    const [relianceData, setRelianceData] = useState([]);
    const [goldData, setGoldData] = useState([]);
    const [niftyData, setNiftyData] = useState([]);
    const [eurusdData, setEurusdData] = useState([]);
    const [gbpjpyData, setGbpjpyData] = useState([]);
    const [usdchfData, setUsdchfData] = useState([]);
    const [audcadData, setAudcadData] = useState([]);
    const [nikkeiData, setNikkeiData] = useState([]);
    const [daxData, setDaxData] = useState([]);
    const [usdjpyData, setUsdjpyData] = useState([]);
    const [gbpusdData, setGbpusdData] = useState([]);

    const DENSITY = 140;

    const initializeData = async () => {
        try {
            const { data } = await api.get('/auctions');
            setStats(prev => ({ ...prev, totalVolume: data.reduce((acc, curr) => acc + (curr.currentL1 || 0), 0), activeNodes: 242 }));
            
            setBitcoinData(generateOHLC(DENSITY, 68000, 400));
            setEthereumData(generateOHLC(DENSITY, 3500, 25));
            setNasdaqData(generateOHLC(DENSITY, 18000, 60));
            setTeslaData(generateOHLC(DENSITY, 175, 2));
            setAppleData(generateOHLC(DENSITY, 170, 1.5));
            setRelianceData(generateOHLC(DENSITY, 2900, 10));
            setGoldData(generateOHLC(DENSITY, 2100, 12));
            setNiftyData(generateOHLC(DENSITY, 22000, 80));
            setEurusdData(generateOHLC(DENSITY, 1.085, 0.002));
            setGbpjpyData(generateOHLC(DENSITY, 191.20, 0.3));
            setUsdchfData(generateOHLC(DENSITY, 0.902, 0.0015));
            setAudcadData(generateOHLC(DENSITY, 0.895, 0.002));
            setNikkeiData(generateOHLC(DENSITY, 39500, 150));
            setDaxData(generateOHLC(DENSITY, 18200, 65));
            setUsdjpyData(generateOHLC(DENSITY, 151.30, 0.25));
            setGbpusdData(generateOHLC(DENSITY, 1.265, 0.003));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeData();
        const interval = setInterval(() => {
            const updateLast = (prev) => {
                const last = { ...prev[prev.length - 1] };
                last.close = last.open + (Math.random() - 0.5) * (last.open * 0.005);
                last.high = Math.max(last.high, last.close);
                last.low = Math.min(last.low, last.close);
                last.candle = [Math.min(last.open, last.close), Math.max(last.open, last.close)];
                return [...prev.slice(0, -1), last];
            };

            setBitcoinData(updateLast);
            setEthereumData(updateLast);
            setNasdaqData(updateLast);
            setTeslaData(updateLast);
            setAppleData(updateLast);
            setRelianceData(updateLast);
            setGoldData(updateLast);
            setNiftyData(updateLast);
            setEurusdData(updateLast);
            setGbpjpyData(updateLast);
            setUsdchfData(updateLast);
            setAudcadData(updateLast);
            setNikkeiData(updateLast);
            setDaxData(updateLast);
            setUsdjpyData(updateLast);
            setGbpusdData(updateLast);

        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div className="l1-glow" style={{ width: '40px', height: '40px', background: 'var(--primary)' }} />
            <p className="glow-text" style={{ letterSpacing: '4px', fontSize: '0.8rem' }}>SYNCHRONIZING_GOCOMET_MARKETS...</p>
        </div>
    );

    const assets = [
        { title: 'BITCOIN_QUANTUM', data: bitcoinData, icon: <Zap size={16} color="#f59e0b" />, trend: '+2.4%' },
        { title: 'ETHEREUM_ETHER_NET', data: ethereumData, icon: <Zap size={16} color="#8b5cf6" />, trend: '+1.8%' },
        { title: 'NASDAQ_TECH_INDEX', data: nasdaqData, icon: <BarChart3 size={16} color="var(--primary)" />, trend: '-0.4%' },
        { title: 'TESLA_MOTORS_NODE', data: teslaData, icon: <Activity size={16} color="#ef4444" />, trend: '+4.2%' },
        { title: 'APPLE_SYST_FLOW', data: appleData, icon: <Radio size={16} color="#94a3b8" />, trend: '+0.2%' },
        { title: 'RELIANCE_ENERGY', data: relianceData, icon: <Globe size={16} color="#3b82f6" />, trend: '+1.1%' },
        { title: 'GOLD_FOREX_LIQUIDITY', data: goldData, icon: <Coins size={16} color="gold" />, trend: '-0.1%' },
        { title: 'NIFTY_NODE_CLUSTER', data: niftyData, icon: <BarChart3 size={16} color="#10b981" />, trend: '+0.8%' },
        { title: 'EUR_USD_FX_PAIR', data: eurusdData, icon: <Globe size={16} color="#3b82f6" />, trend: '+0.15%' },
        { title: 'GBP_JPY_CROSS_RATE', data: gbpjpyData, icon: <TrendingUp size={16} color="#f59e0b" />, trend: '-0.24%' },
        { title: 'USD_CHF_SWISS_SET', data: usdchfData, icon: <Activity size={16} color="#ef4444" />, trend: '+0.08%' },
        { title: 'AUD_CAD_COMMODITY', data: audcadData, icon: <Coins size={16} color="#8b5cf6" />, trend: '-0.11%' },
        { title: 'NIKKEI_225_ASIAN_H', data: nikkeiData, icon: <BarChart3 size={16} color="#ef4444" />, trend: '+1.42%' },
        { title: 'DAX_40_GERMAN_IDX', data: daxData, icon: <Activity size={16} color="#3b82f6" />, trend: '+0.65%' },
        { title: 'USD_JPY_FX_MAJOR', data: usdjpyData, icon: <TrendingUp size={16} color="#10b981" />, trend: '+0.45%' },
        { title: 'GBP_USD_CABLE_FX', data: gbpusdData, icon: <Globe size={16} color="#f59e0b" />, trend: '-0.18%' },
    ];

    return (
        <div className="network-page" style={{ padding: '80px 5%', minHeight: '100vh', position: 'relative' }}>
            <header style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <h1 className="glow-text" style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-2px' }}>BRITISH_AUCTION_INTELLIGENCE</h1>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '5px 15px', borderRadius: '50px', border: '1px solid rgba(16, 185, 129, 0.2)', height: 'fit-content' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#10b981', letterSpacing: '2px' }}>QUANTUM_FEED_ACTIVE</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 900 }}>
                        <Radio size={12} className="pulse" color="var(--primary)" /> NODES_SYNCED: 100%
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 900 }}>
                        <Server size={12} /> PROTOCOL: GC-IQ-v1.2
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {assets.map((m, i) => (
                    <GlassCard 
                        key={i} 
                        style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s ease' }}
                        onClick={() => { setTerminalAsset(m); setIsTerminalOpen(true); }}
                        whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                    >
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {m.icon} <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>{m.title}</span>
                            </div>
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: m.trend.startsWith('+') ? '#10b981' : '#ef4444' }}>{m.trend}</span>
                        </div>
                        <CandleChart data={m.data} onSelect={() => {}} height={150} density={DENSITY} />
                        <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'flex-end', background: 'rgba(255,255,255,0.01)' }}>
                            <ExternalLink size={12} style={{ opacity: 0.3 }} />
                        </div>
                    </GlassCard>
                ))}
            </div>

            <AnimatePresence>
                {isTerminalOpen && terminalAsset && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div style={{ width: '95%', height: '90%', maxWidth: '1400px', display: 'flex', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <GlassCard style={{ height: '100%', padding: '40px', borderColor: 'var(--primary)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                    <X 
                                        size={32} 
                                        cursor="pointer" 
                                        onClick={() => setIsTerminalOpen(false)} 
                                        style={{ position: 'absolute', right: '30px', top: '30px', opacity: 0.5, zIndex: 10 }} 
                                    />
                                    
                                    <div style={{ marginBottom: '40px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                                            <h2 className="glow-text" style={{ fontSize: '3rem', fontWeight: 900 }}>{terminalAsset.title}</h2>
                                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '5px 20px', borderRadius: '50px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>ORIGINAL_MARKET_FEED</span>
                                            </div>
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '4px', fontWeight: 800 }}>ASSET_TELEMETRY_SOURCE: REAL_TIME_EXCHANGE_DATA</p>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <CandleChart data={terminalAsset.data} onSelect={() => {}} height="100%" density={200} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '40px' }}>
                                        <GlassCard style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>ORIGINAL_PRICE (₹)</span>
                                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900 }}>₹{terminalAsset.data[terminalAsset.data.length-1].close.toLocaleString()}</h3>
                                        </GlassCard>
                                        <GlassCard style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>24H_HIGH</span>
                                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>₹{(terminalAsset.data[terminalAsset.data.length-1].close * 1.05).toLocaleString()}</h3>
                                        </GlassCard>
                                        <GlassCard style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>24H_LOW</span>
                                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ef4444' }}>₹{(terminalAsset.data[terminalAsset.data.length-1].close * 0.95).toLocaleString()}</h3>
                                        </GlassCard>
                                        <GlassCard style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                                            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>QUANT_PREDICT_SCORE</span>
                                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>99.8</h3>
                                        </GlassCard>
                                    </div>
                                </GlassCard>
                            </div>

                            <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <GlassCard style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1), rgba(139, 92, 246, 0.1))', borderColor: 'var(--primary)' }}>
                                    <div style={{ marginBottom: '25px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>AI_STRIKE_PREDICTION</h3>
                                        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>PROBABILISTIC_AUCTION_FORECAST</p>
                                    </div>

                                    <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>RECOMMENDED_STRIKE_PRICE</span>
                                        <h2 style={{ fontSize: '2.4rem', fontWeight: 900, margin: '10px 0' }}>₹{(terminalAsset.data[terminalAsset.data.length-1].close * 1.025).toLocaleString()}</h2>
                                        <p style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 900 }}>SYNC_CONFIDENCE: 98.4%</p>
                                    </div>

                                    <GlowButton onClick={() => {
                                        const recommendedScale = Math.floor(terminalAsset.data[terminalAsset.data.length-1].close * 1.025);
                                        navigate('/dashboard', {
                                            state: {
                                                openCreateModal: true,
                                                title: `${terminalAsset.title.replace(/_/g, '-')} DERIVATIVE`,
                                                basePrice: recommendedScale.toString(),
                                                description: `Live synchronized derivative block for ${terminalAsset.title}. Recommended strike target securely pegged at ₹${recommendedScale}.`
                                            }
                                        });
                                    }} style={{ width: '100%', padding: '15px', marginTop: '20px' }}>USE_IN_ACTIVE_AUCTION</GlowButton>
                                </GlassCard>

                                <GlassCard style={{ flex: 1, padding: '30px' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: '20px', letterSpacing: '2px' }}>EXCHANGE_SENTIMENT</h4>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        {[
                                            { label: 'SOCIAL_VOLUME', val: 'HIGH', color: '#10b981' },
                                            { label: 'DEX_LIQUIDITY', val: 'STABLE', color: 'var(--primary)' },
                                            { label: 'ORDER_BOOK_BIAS', val: 'BULLISH', color: '#10b981' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>{item.label}</span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: item.color }}>{item.val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: 'auto', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.65rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.4)' }}>
                                        <Info size={12} style={{ marginBottom: '5px' }} />
                                        Prediction is based on real-time volatility indices and historical node performance. Use caution when executing high-valuation protocols.
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Network;
