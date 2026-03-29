import React from 'react';
import { Terminal, Database, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';

const ActivityLog = ({ bids, status, extensionEvents = [] }) => {
    // Merge bids + extension events into a unified feed, sorted by time (newest first)
    const safeBids = Array.isArray(bids) ? bids : [];

    const bidEntries = safeBids.map(bid => ({
        type: 'bid',
        id: bid._id,
        timestamp: new Date(bid.timestamp),
        label: bid.rank === 1 ? '[L1_OVERRIDE]' : '[BID_SUBMITTED]',
        color: bid.rank === 1 ? '#fbbf24' : 'rgba(255,255,255,0.4)',
        text: `${(bid.carrierName || bid.bidderId?.name || 'UNKNOWN').toUpperCase()} — ₹${(bid.price || 0).toLocaleString()}${bid.carrierName ? ` · ${bid.carrierName}` : ''}`
    }));

    const extEntries = extensionEvents.map((ev, i) => ({
        type: 'extension',
        id: `ext_${i}`,
        timestamp: new Date(ev.extendedAt || Date.now()),
        label: '[TIME_EXTENDED]',
        color: '#fbbf24',
        text: `+${ev.reason || 'TRIGGER FIRED'} by ${ev.triggeredBy || 'SYSTEM'} → New close: ${ev.newEndTime ? new Date(ev.newEndTime).toLocaleTimeString() : '...'}`
    }));

    const allEntries = [...bidEntries, ...extEntries].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <GlassCard style={{ padding: '0', background: 'rgba(2, 6, 23, 0.7)', border: '1px solid rgba(0, 210, 255, 0.1)', height: '100%' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Terminal size={16} color="var(--primary)" />
                <h4 style={{ fontSize: '0.75rem', color: '#fff', textTransform: 'uppercase', margin: 0, fontWeight: 800, letterSpacing: '2px' }}>NEURAL_ACTIVITY_FEED</h4>
            </div>

            <div style={{ height: '380px', overflowY: 'auto', padding: '16px', position: 'relative' }} className="mono-text">
                <div className="scanning-bar" />
                <AnimatePresence initial={false}>
                    {allEntries.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{
                                marginBottom: '10px',
                                padding: '10px 14px',
                                background: entry.type === 'extension'
                                    ? 'rgba(251,191,36,0.05)'
                                    : (index === 0 ? 'rgba(0, 210, 255, 0.04)' : 'transparent'),
                                borderRadius: '8px',
                                borderLeft: `2px solid ${entry.color}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span style={{ color: entry.color, fontSize: '0.65rem', fontWeight: 800 }}>
                                    {entry.type === 'extension' && <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />}
                                    {entry.label}
                                </span>
                                <span style={{ opacity: 0.3, fontSize: '0.6rem' }}>
                                    {entry.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: entry.type === 'extension' ? '#fbbf24' : '#fff', opacity: 0.85 }}>
                                {entry.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {allEntries.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', paddingTop: '40px' }}>
                        Awaiting activity...
                    </div>
                )}

                <div style={{ padding: '14px 0 4px', textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '0.65rem' }}>
                    --- END OF LIVE FEED ---
                </div>
            </div>

            <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>
                    <Database size={11} /> {allEntries.length} EVENTS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>
                    <Shield size={11} color="#10b981" /> SECURE_NODE
                </div>
            </div>
        </GlassCard>
    );
};

export default ActivityLog;
