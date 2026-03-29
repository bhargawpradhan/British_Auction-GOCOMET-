import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Bar } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-morphism" style={{ padding: '12px 16px', background: 'rgba(2, 6, 23, 0.9)', border: '1px solid var(--primary)' }}>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: '4px', letterSpacing: '1px' }}>QUOTE_VALUE</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>₹{payload[0].value.toLocaleString()}</p>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{new Date().toLocaleTimeString()}</p>
            </div>
        );
    }
    return null;
};

const PriceChart = ({ data }) => {
    return (
        <div className="glass-morphism" style={{ height: '450px', width: '100%', padding: '35px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div>
                    <h4 style={{ color: '#fff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 900, marginBottom: '5px' }}>
                        MARKET_TELEMETRY
                    </h4>
                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>CORE_NODE: GC_TRADING_V1 // SYNC_STABLE</p>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                    <span style={{ color: '#10b981' }}>● LIVE_STREAM</span>
                    <span style={{ color: 'var(--primary)' }}>NODES: {data.length}</span>
                </div>
            </div>
            
            <div style={{ height: '400px', width: '100%', position: 'relative' }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                            <XAxis dataKey="time" hide />
                            <YAxis 
                                domain={['auto', 'auto']}
                                orientation="right"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(val) => `₹${(val / 1000).toFixed(1)}k`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,210,255,0.2)', strokeWidth: 2 }} />
                            <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke="var(--primary)" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorPrice)" 
                                animationDuration={1000}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', letterSpacing: '2px' }}>AWAITING_TELEMETRY_STREAM</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriceChart;
