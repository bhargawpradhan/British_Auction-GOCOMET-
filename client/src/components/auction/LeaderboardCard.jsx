import React from 'react';
import { Trophy, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const rankColors = ['#fbbf24', '#94a3b8', '#b45309'];
const rankLabels = ['L1', 'L2', 'L3'];

const LeaderboardCard = ({ bids }) => {
  const safeBids = Array.isArray(bids) ? bids : [];

  // Reverse auction: LOWEST total price wins (L1 = cheapest supplier)
  const sortedBids = [...safeBids]
    .filter(v => v && v.bidderId)
    // De-duplicate per bidder — keep only their BEST (lowest) quote
    .reduce((acc, bid) => {
      const bidderId = bid.bidderId?._id?.toString() || bid.bidderId?.toString();
      const existing = acc.find(b => (b.bidderId?._id?.toString() || b.bidderId?.toString()) === bidderId);
      if (!existing || bid.price < existing.price) {
        return [...acc.filter(b => (b.bidderId?._id?.toString() || b.bidderId?.toString()) !== bidderId), bid];
      }
      return acc;
    }, [])
    .sort((a, b) => (a.price || 0) - (b.price || 0))   // ← ASCENDING: lowest price = L1
    .slice(0, 5);

  return (
    <div className="glass-morphism" style={{ padding: '24px', minWidth: '300px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Trophy size={18} color="#fbbf24" />
        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
          Supplier Rankings
        </h4>
        <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
          LOWEST = BEST
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {sortedBids.map((bid, index) => {
            const rankColor = rankColors[Math.min(index, rankColors.length - 1)];
            const isL1 = index === 0;
            const name = bid.carrierName || bid.bidderId?.name || 'Unknown Supplier';
            return (
              <motion.div
                key={bid.bidderId?._id || index}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: `1px solid ${rankColor}33`,
                  background: isL1 ? `${rankColor}08` : 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    minWidth: '32px', height: '32px', borderRadius: '8px',
                    background: `${rankColor}22`, border: `1px solid ${rankColor}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 900, color: rankColor
                  }}>
                    {rankLabels[index] || `L${index + 1}`}
                  </span>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: isL1 ? '#fbbf24' : '#fff' }}>{name}</p>
                    {isL1 && (
                      <p style={{ fontSize: '0.58rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>
                        ⭐ Lowest Bidder
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 900, color: rankColor }}>
                    ₹{(bid.price || 0).toLocaleString()}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px', marginTop: '2px' }}>
                    <TrendingDown size={10} color={rankColor} />
                    <span style={{ fontSize: '0.58rem', color: rankColor, fontWeight: 800 }}>-</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedBids.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', padding: '24px 0' }}>
            Awaiting first supplier quote...
          </p>
        )}
      </div>
    </div>
  );
};

export default LeaderboardCard;
