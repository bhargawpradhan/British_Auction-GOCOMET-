import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const rankColors = ['#fbbf24', '#94a3b8', '#b45309', 'rgba(255,255,255,0.5)'];
const rankLabels = ['L1', 'L2', 'L3'];

const BidTable = ({ bids }) => {
    const safeBids = Array.isArray(bids) ? bids : [];

    return (
        <div className="glass-morphism" style={{ padding: '24px', marginTop: '24px', overflowX: 'auto' }}>
            <h4 style={{ marginBottom: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Supplier Quote Board — Ranked by Total Price
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', minWidth: '700px' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        {['RANK', 'CARRIER', 'FREIGHT', 'ORIGIN', 'DEST', 'TOTAL', 'TRANSIT', 'VALIDITY', 'TIME'].map(h => (
                            <th key={h} style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {safeBids.slice(0, 15).map((bid, index) => {
                            const rank = bid.rank || (index + 1);
                            const rankColor = rankColors[Math.min(rank - 1, rankColors.length - 1)];
                            const isL1 = rank === 1;
                            return (
                                <motion.tr
                                    key={bid._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        background: isL1 ? 'rgba(251,191,36,0.04)' : 'transparent'
                                    }}
                                >
                                    <td style={{ padding: '10px 12px' }}>
                                        <span style={{
                                            background: `${rankColor}22`,
                                            color: rankColor,
                                            padding: '3px 10px',
                                            borderRadius: '8px',
                                            fontWeight: 900,
                                            fontSize: '0.7rem',
                                            border: `1px solid ${rankColor}44`
                                        }}>
                                            {rankLabels[rank - 1] || `L${rank}`}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', fontWeight: 700, color: isL1 ? '#fbbf24' : '#fff' }}>
                                        {bid.carrierName || bid.bidderId?.name || 'N/A'}
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>₹{(bid.freightCharges || 0).toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>₹{(bid.originCharges || 0).toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.7)' }}>₹{(bid.destinationCharges || 0).toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: 900, color: 'var(--primary)' }}>₹{(bid.price || 0).toLocaleString()}</td>
                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)' }}>{bid.transitTime || '—'}</td>
                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)' }}>{bid.validity || '—'}</td>
                                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                                        {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </tbody>
            </table>
            {safeBids.length === 0 && (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', padding: '30px 0' }}>
                    Awaiting supplier quotes...
                </p>
            )}
        </div>
    );
};

export default BidTable;
