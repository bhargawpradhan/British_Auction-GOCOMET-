import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../utils/api';
import { playSound } from '../utils/sounds';

import LiveTimer from '../components/auction/LiveTimer';
import PriceChart from '../components/auction/PriceChart';
import LeaderboardCard from '../components/auction/LeaderboardCard';
import BidTable from '../components/auction/BidTable';
import AiChat from '../components/auction/AiChat';
import ActivityLog from '../components/auction/ActivityLog';

import GlassCard from '../components/common/GlassCard';
import GlowButton from '../components/common/GlowButton';
import { formatPrice, getCurrencySymbol } from '../utils/currency';

const inputStyle = {
    flex: 1,
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(0,210,255,0.25)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    outline: 'none',
};

const AuctionPage = () => {
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem('user'));

    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [extensionEvents, setExtensionEvents] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const socketRef = useRef();

    // RFQ Quote form state
    const [quote, setQuote] = useState({
        carrierName: '',
        freightCharges: '',
        originCharges: '',
        destinationCharges: '',
        transitTime: '',
        validity: '',
    });

    const setQ = (k, v) => setQuote(prev => ({ ...prev, [k]: v }));

    // ─── Initial Data Fetch ───────────────────────────────────────────────────
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const { data: auctionData } = await api.get(`/auctions/${id}`);
                const { data: bidData } = await api.get(`/bids/${id}`);
                setAuction(auctionData);
                setBids(Array.isArray(bidData) ? bidData : []);

                // Seed extension history from DB so it survives page refresh
                if (Array.isArray(auctionData.extensionLog) && auctionData.extensionLog.length > 0) {
                    setExtensionEvents(auctionData.extensionLog.map(e => ({
                        newEndTime: e.newEndTime,
                        reason: e.reason,
                        triggeredBy: e.triggeredBy,
                        extendedAt: e.extendedAt
                    })).reverse()); // newest first
                }

                const formatted = Array.isArray(bidData) ? [...bidData].reverse().map((b) => ({
                    time: new Date(b.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    price: b.price
                })) : [];
                setChartData(formatted);
            } catch (err) {
                console.error('[TELEMETRY] Initialization Failure:', err);
            }
        };
        fetchInitialData();
    }, [id]);

    // ─── Socket Integration ───────────────────────────────────────────────────
    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join_auction', id);
        });

        socketRef.current.on('new_bid', (data) => {
            playSound('bid');
            setBids(prevBids => {
                const newBid = {
                    _id: Date.now(),
                    bidderId: { name: data.bidder, _id: data.bidderId },
                    price: data.price,
                    carrierName: data.carrierName,
                    freightCharges: data.freightCharges,
                    originCharges: data.originCharges,
                    destinationCharges: data.destinationCharges,
                    transitTime: data.transitTime,
                    validity: data.validity,
                    timestamp: new Date()
                };
                return [newBid, ...prevBids].slice(0, 50);
            });

            setChartData(prev => [...prev.slice(-19), {
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                price: data.price
            }]);

            setAuction(prev => ({ ...prev, currentL1: data.price, endTime: data.endTime }));
        });

        socketRef.current.on('time_extension', (data) => {
            playSound('bid');
            setAuction(prev => ({ ...prev, endTime: data.newEndTime }));
            setExtensionEvents(prev => [data, ...prev]);
        });

        socketRef.current.on('auction_closed', (data) => {
            playSound('win');
            setAuction(prev => ({ ...prev, status: data.status || 'closed', winner: data.winner }));
            // Show winner modal and confetti for the winning bidder
            const winnerId = data.winner?._id?.toString() || data.winner?.toString();
            if (winnerId && winnerId === user?._id?.toString()) {
                setShowWinnerModal(true);
                confetti({ particleCount: 300, spread: 100, colors: ['#00d2ff', '#10b981', '#fbbf24'], origin: { y: 0.4 } });
                setTimeout(() => confetti({ particleCount: 200, spread: 120, colors: ['#8b5cf6', '#f43f5e'], angle: 120 }), 500);
            } else {
                confetti({ particleCount: 80, spread: 60, colors: ['#00d2ff', '#3a7bd5'] });
            }
        });

        return () => socketRef.current.disconnect();
    }, [id]);

    // ─── Razorpay Loader ─────────────────────────────────────────────────────
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { if (document.body.contains(script)) document.body.removeChild(script); };
    }, []);

    // ─── Quote Submit Handler ─────────────────────────────────────────────────
    const handleBid = async (e) => {
        e.preventDefault();
        if (user?.role !== 'bidder') { alert('Only Bidders can place bids.'); return; }
        if (isProcessing) return;

        const total = Number(quote.freightCharges) + Number(quote.originCharges) + Number(quote.destinationCharges);
        if (total <= 0) { alert('Please fill in at least Freight, Origin, or Destination charges.'); return; }

        setIsProcessing(true);
        try {
            await api.post('/bids', {
                auctionId: id,
                carrierName: quote.carrierName,
                freightCharges: Number(quote.freightCharges) || 0,
                originCharges: Number(quote.originCharges) || 0,
                destinationCharges: Number(quote.destinationCharges) || 0,
                transitTime: quote.transitTime,
                validity: quote.validity,
            });
            setQuote({ carrierName: '', freightCharges: '', originCharges: '', destinationCharges: '', transitTime: '', validity: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Quote rejected by protocol');
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── Payment Handler ──────────────────────────────────────────────────────
    const handlePayment = async () => {
        if (paymentProcessing) return;
        if (!window.Razorpay) { alert('Razorpay SDK not loaded. Please refresh and try again.'); return; }
        setPaymentProcessing(true);
        try {
            const { data: order } = await api.post('/payments/create-order', { auctionId: id });
            const rzp = new window.Razorpay({
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: order.amount,
                currency: order.currency,
                name: 'AEON PROTOCOL — GOCOMET',
                description: `Freight Settlement · Auction ${id?.slice(-8).toUpperCase()}`,
                order_id: order.id,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                },
                notes: { auctionId: id },
                theme: { color: '#00d2ff' },
                handler: async (response) => {
                    try {
                        await api.post('/payments/verify-payment', {
                            auctionId: id,
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });
                        setAuction(prev => ({ ...prev, status: 'paid' }));
                        setShowWinnerModal(false);
                        confetti({ particleCount: 400, spread: 130, colors: ['#00d2ff', '#10b981', '#fbbf24', '#8b5cf6'], origin: { y: 0.3 } });
                        setTimeout(() => confetti({ particleCount: 200, spread: 160, angle: 60, origin: { y: 0.5 } }), 400);
                    } catch (verifyErr) {
                        alert('⚠️ Payment received but verification pending. Contact support with Payment ID: ' + response.razorpay_payment_id);
                    } finally {
                        setPaymentProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => setPaymentProcessing(false)
                }
            });
            rzp.open();
        } catch (err) {
            alert('Payment initialization failed: ' + (err.response?.data?.message || err.message));
            setPaymentProcessing(false);
        }
    };

    if (!auction) return (
        <div style={{ textAlign: 'center', marginTop: '20%', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', letterSpacing: '4px' }}>
            SYNCING TELEMETRY...
        </div>
    );

    // L1 (lowest bid) = winner in this reverse auction.
    // We use l1Bidder as the authoritative winner source; winner field is a backup.
    const userId = user?._id?.toString();
    const l1BidderId = (auction.l1Bidder?._id || auction.l1Bidder)?.toString();
    const winnerId = (auction.winner?._id || auction.winner)?.toString();
    // Also check from live bids list — rank 1 = L1 = winner
    const l1BidInList = bids.find(b => b.rank === 1 || b.price === Math.min(...bids.map(x => x.price)));
    const l1FromBids = (l1BidInList?.bidderId?._id || l1BidInList?.bidderId)?.toString();

    const isAuctionOver = ['closed', 'force_closed', 'paid'].includes(auction.status);
    const isWinner = isAuctionOver && userId && (
        userId === l1BidderId ||
        userId === winnerId ||
        (bids.length > 0 && userId === l1FromBids)
    );
    const canBid = auction.status === 'active' && user?.role === 'bidder';
    const isReadOnly = auction.status === 'active' && user?.role !== 'bidder';
    const cfg = auction.britishConfig || {};

    // Winner display name — prefer winner, fall back to l1Bidder, then L1 from bids list
    const winnerName = auction.winner?.name || auction.l1Bidder?.name || l1BidInList?.bidderId?.name || l1BidInList?.carrierName || 'L1 BIDDER';
    const finalAmount = auction.currentL1 || auction.basePrice;

    return (
        <div className="auction-page" style={{ maxWidth: '1600px', margin: 'auto', padding: '20px 20px 220px', minHeight: '100vh' }}>

            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px' }}>
                <div>
                    <h1 className="glow-text" style={{ fontSize: '3rem', fontWeight: 800 }}>{auction.title}</h1>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '1px' }}>ID: {id?.slice(-8).toUpperCase()}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>SYNCHRONIZED</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>
                            [{user?.role}] {user?.name}
                        </span>
                        {auction.forcedCloseTime && (
                            <span style={{ fontSize: '0.7rem', color: 'rgba(244,63,94,0.8)', fontWeight: 700, background: 'rgba(244,63,94,0.08)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.2)' }}>
                                🔒 FORCED CLOSE: {new Date(auction.forcedCloseTime).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>
                <LiveTimer endTime={auction.endTime} onEnd={() => setAuction(prev => ({ ...prev, status: 'closed' }))} />
            </motion.div>

            {/* Time Extension Alert Banner */}
            {extensionEvents.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '24px', padding: '16px 24px', borderRadius: '12px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⏱</span>
                    <div>
                        <p style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.85rem', margin: 0 }}>
                            TIME EXTENDED × {extensionEvents.length} — +{cfg.extensionDuration}min each trigger
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0 }}>
                            Last: {extensionEvents[0]?.reason} by {extensionEvents[0]?.triggeredBy}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ── Main Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '40px' }}>
                <div>
                    {/* L1 Price Card */}
                    <GlassCard style={{ padding: '32px', marginBottom: '30px', textAlign: 'center', border: '1px solid rgba(0,210,255,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(0,210,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
                        
                        <p style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '4px', marginBottom: '8px' }}>Current Lowest Quote (L1)</p>
                        
                        {(() => {
                            const l1Price = bids.length > 0 ? Math.min(...bids.map(b => b.price)) : auction.currentL1;
                            const l1Bid = bids.find(b => b.price === l1Price) || {};
                            const displayName = l1Bid.carrierName || l1Bid.bidderId?.name || 'Awaiting Protocols...';

                            return (
                                <>
                                    <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12rem', fontWeight: 900, color: 'rgba(255,255,255,0.03)', pointerEvents: 'none', zIndex: 0, userSelect: 'none' }}>
                                        {getCurrencySymbol(auction.currency)}
                                    </div>
                                    <motion.h2 
                                        key={l1Price} 
                                        initial={{ scale: 1.1, filter: 'brightness(2)' }} 
                                        animate={{ scale: 1, filter: 'brightness(1)' }}
                                        transition={{ duration: 0.8 }} 
                                        style={{ fontSize: '4.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-3px', margin: 0 }}
                                    >
                                        {formatPrice(l1Price, auction.currency)}
                                    </motion.h2>
                                    
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
                                    >
                                        <div style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {displayName}
                                        </div>
                                    </motion.div>
                                </>
                            );
                        })()}

                        {canBid && (
                            <div style={{ marginTop: '24px', padding: '12px 20px', borderRadius: '10px', background: 'rgba(0,210,255,0.05)', border: '1px dashed rgba(0,210,255,0.2)', display: 'inline-block' }}>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(0,210,255,0.7)', fontWeight: 700, margin: 0 }}>
                                    ↓ SUBMIT YOUR QUOTE IN THE TERMINAL BELOW
                                </p>
                            </div>
                        )}
                        {isReadOnly && (
                            <div style={{ marginTop: '30px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'inline-block' }}>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, margin: 0 }}>
                                    PROTOCOL READ-ONLY — <span style={{ color: 'var(--primary)' }}>{user?.role?.toUpperCase()}</span>
                                </p>
                            </div>
                        )}

                    </GlassCard>

                    {/* ── Standalone Payment / Settlement Section ── */}
                    {/* Placed OUTSIDE GlassCard to avoid 3D transform click-area issues */}
                    {isAuctionOver && auction.status !== 'paid' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ marginBottom: '30px' }}
                        >
                            <div style={{
                                padding: '36px',
                                borderRadius: '20px',
                                background: isWinner
                                    ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,210,255,0.08))'
                                    : 'rgba(255,255,255,0.03)',
                                border: isWinner
                                    ? '1px solid rgba(16,185,129,0.6)'
                                    : '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(20px)'
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                                    <span style={{ fontSize: '2.2rem' }}>
                                        {isWinner ? '🏆' : auction.status === 'force_closed' ? '🔒' : '📋'}
                                    </span>
                                    <div>
                                        <h3 style={{
                                            color: isWinner ? '#10b981' : auction.status === 'force_closed' ? '#f43f5e' : '#fff',
                                            fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px'
                                        }}>
                                            {isWinner ? '🎉 YOU ARE THE WINNER — PAY TO FINALIZE' : 'AUCTION ENDED — RESULTS FINALIZED'}
                                        </h3>
                                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', margin: '4px 0 0', letterSpacing: '1px', fontWeight: 700 }}>
                                            {isWinner ? 'SETTLEMENT PAYMENT REQUIRED TO CONFIRM CONTRACT' : 'L1 CARRIER SETTLEMENT IN PROGRESS'}
                                        </p>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                                    <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', fontWeight: 900, marginBottom: '8px', letterSpacing: '1px' }}>L1_WINNER</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#fbbf24' }}>{isWinner ? '★ YOU' : winnerName}</span>
                                    </div>
                                    <div style={{ padding: '18px', borderRadius: '12px', background: isWinner ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', border: isWinner ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.07)' }}>
                                        <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', fontWeight: 900, marginBottom: '8px', letterSpacing: '1px' }}>SETTLEMENT_AMOUNT</span>
                                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981' }}>{formatPrice(finalAmount, auction.currency)}</span>
                                    </div>
                                    <div style={{ padding: '18px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                        <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', fontWeight: 900, marginBottom: '8px', letterSpacing: '1px' }}>STATUS</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: auction.status === 'force_closed' ? '#f43f5e' : '#fbbf24', textTransform: 'uppercase' }}>
                                            {auction.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* PAY NOW — plain native button, no transform wrappers */}
                                {isWinner ? (
                                    <button
                                        id="pay-now-btn"
                                        onClick={handlePayment}
                                        disabled={paymentProcessing}
                                        style={{
                                            width: '100%',
                                            padding: '20px',
                                            background: paymentProcessing
                                                ? 'rgba(16,185,129,0.4)'
                                                : 'linear-gradient(135deg, #10b981, #059669)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '14px',
                                            fontSize: '1.1rem',
                                            fontWeight: 900,
                                            letterSpacing: '2px',
                                            cursor: paymentProcessing ? 'not-allowed' : 'pointer',
                                            fontFamily: 'inherit',
                                            boxShadow: paymentProcessing ? 'none' : '0 0 30px rgba(16,185,129,0.4)',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            zIndex: 10
                                        }}
                                        onMouseOver={e => { if(!paymentProcessing) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(16,185,129,0.6)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = paymentProcessing ? 'none' : '0 0 30px rgba(16,185,129,0.4)'; }}
                                    >
                                        {paymentProcessing ? '⏳ INITIATING RAZORPAY GATEWAY...' : '💳  PAY NOW — FINALIZE FREIGHT CONTRACT'}
                                    </button>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '1px' }}>
                                        AWAITING SETTLEMENT FROM L1 CARRIER
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Paid confirmation */}
                    {auction.status === 'paid' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: '30px' }}>
                            <div style={{ padding: '40px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,210,255,0.08))', border: '1px solid #10b981', backdropFilter: 'blur(20px)', textAlign: 'center' }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✅</div>
                                <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>SETTLEMENT COMPLETE</h3>
                                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', marginBottom: '20px' }}>Payment verified. Freight contract finalized and locked.</p>
                                <div style={{ display: 'inline-block', padding: '12px 28px', background: 'rgba(16,185,129,0.12)', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 900, color: '#10b981', letterSpacing: '2px', border: '1px solid rgba(16,185,129,0.3)' }}>
                                    📋 CONTRACT_LOCKED · {formatPrice(finalAmount, auction.currency)}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <PriceChart data={chartData} />
                    <BidTable bids={bids} />
                </div>

                {/* ── Sidebar ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <LeaderboardCard bids={bids} />

                    {/* Protocol Parameters */}
                    <GlassCard style={{ padding: '28px' }}>
                        <h4 style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 800, letterSpacing: '1px' }}>Protocol Parameters</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                            {[
                                ['Base Valuation', formatPrice(auction.basePrice, auction.currency)],
                                ['Min Undercut Step', formatPrice(auction.minIncrement, auction.currency)],
                                ['Bid Start', new Date(auction.startTime).toLocaleString()],
                                ['Bid Close', new Date(auction.endTime).toLocaleString()],
                                ['Trigger Window', `${cfg.triggerWindow || 10} min`],
                                ['Extension Duration', `${cfg.extensionDuration || 5} min`],
                                ['Extension Rule', (cfg.extensionTrigger || 'bid_received').replace(/_/g, ' ').toUpperCase()],
                                ['Extensions So Far', auction.extensionCount || 0],
                                ['Status', auction.status?.toUpperCase()]
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{label}</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: label === 'Status' ? '#10b981' : '#fff' }}>{val}</span>
                                </div>
                            ))}
                            {auction.serviceDate && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>Service Date</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Date(auction.serviceDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    <ActivityLog bids={bids} status={auction.status} extensionEvents={extensionEvents} />
                </div>
            </div>

            <AiChat auctionId={id} />

            {/* ─── Fixed RFQ Quote Terminal ───────────────────────────────────── */}
            {canBid && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
                    background: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(24px)',
                    borderTop: '1px solid rgba(0,210,255,0.25)', padding: '16px 32px',
                    boxShadow: '0 -8px 32px rgba(0,0,0,0.5)'
                }}>
                    <form onSubmit={handleBid} style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '2px' }}>RFQ_QUOTE_TERMINAL</div>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
                                Current L1: {formatPrice(auction.currentL1, auction.currency)} &nbsp;|&nbsp; Submit LOWER to compete
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr auto', gap: '8px' }}>
                            <input style={inputStyle} placeholder="Carrier Name *" value={quote.carrierName} onChange={e => setQ('carrierName', e.target.value)} />
                            <input type="number" style={inputStyle} placeholder={`Freight ${getCurrencySymbol(auction.currency)}`} value={quote.freightCharges} onChange={e => setQ('freightCharges', e.target.value)} />
                            <input type="number" style={inputStyle} placeholder={`Origin ${getCurrencySymbol(auction.currency)}`} value={quote.originCharges} onChange={e => setQ('originCharges', e.target.value)} />
                            <input type="number" style={inputStyle} placeholder={`Dest ${getCurrencySymbol(auction.currency)}`} value={quote.destinationCharges} onChange={e => setQ('destinationCharges', e.target.value)} />
                            <input style={inputStyle} placeholder="Transit" value={quote.transitTime} onChange={e => setQ('transitTime', e.target.value)} />
                            <input style={inputStyle} placeholder="Validity" value={quote.validity} onChange={e => setQ('validity', e.target.value)} />
                            <button type="submit" disabled={isProcessing} style={{
                                padding: '10px 24px', background: isProcessing ? 'rgba(0,210,255,0.3)' : 'var(--primary)',
                                color: '#000', fontWeight: 900, fontSize: '0.85rem', border: 'none', borderRadius: '10px',
                                cursor: isProcessing ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap'
                            }}>
                                {isProcessing ? 'SYNCING...' : 'SUBMIT QUOTE'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                            {(quote.freightCharges || quote.originCharges || quote.destinationCharges) && (
                                <span style={{ fontSize:'0.7rem', color:'rgba(0,210,255,0.8)', fontWeight:700 }}>
                                    TOTAL: {formatPrice((Number(quote.freightCharges||0) + Number(quote.originCharges||0) + Number(quote.destinationCharges||0)), auction.currency)}
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* ── Winner Announcement Modal ── */}
            <AnimatePresence>
                {showWinnerModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 999999,
                            background: 'rgba(2, 6, 23, 0.92)', backdropFilter: 'blur(20px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0, y: 60 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                            style={{
                                width: '100%', maxWidth: '560px', padding: '56px 48px',
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,210,255,0.1))',
                                border: '1px solid rgba(16,185,129,0.5)',
                                borderRadius: '24px',
                                backdropFilter: 'blur(40px)',
                                textAlign: 'center',
                                boxShadow: '0 0 80px rgba(16,185,129,0.2), 0 25px 50px rgba(0,0,0,0.6)',
                                position: 'relative'
                            }}
                        >
                            {/* Animated background glow */}
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '24px',
                                background: 'radial-gradient(circle at 50% 30%, rgba(16,185,129,0.2) 0%, transparent 60%)',
                                pointerEvents: 'none'
                            }} />

                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: 2 }}
                                style={{ fontSize: '5rem', marginBottom: '20px' }}
                            >
                                🏆
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glow-text"
                                style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', marginBottom: '10px', letterSpacing: '-1px' }}
                            >
                                YOU WON!
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '32px', letterSpacing: '1px' }}
                            >
                                CONGRATULATIONS — YOU ARE THE L1 CARRIER
                            </motion.p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '36px' }}>
                                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, marginBottom: '8px', letterSpacing: '1px' }}>AUCTION</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{auction.title?.slice(0, 22)}...</span>
                                </div>
                                <div style={{ padding: '20px', background: 'rgba(16,185,129,0.08)', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, marginBottom: '8px', letterSpacing: '1px' }}>YOUR BID</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>{formatPrice(finalAmount, auction.currency)}</span>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                            >
                                <GlowButton
                                    onClick={() => { setShowWinnerModal(false); handlePayment(); }}
                                    style={{ width: '100%', padding: '18px', fontSize: '1rem', fontWeight: 900, letterSpacing: '2px', background: '#10b981' }}
                                >
                                    💳 PAY NOW — FINALIZE CONTRACT
                                </GlowButton>

                                <button
                                    onClick={() => setShowWinnerModal(false)}
                                    style={{
                                        background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'rgba(255,255,255,0.4)', padding: '12px', borderRadius: '12px',
                                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px'
                                    }}
                                >
                                    Pay later from the auction page
                                </button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuctionPage;
