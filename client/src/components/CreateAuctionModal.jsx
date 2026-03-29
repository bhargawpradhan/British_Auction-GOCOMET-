import React, { useState, useEffect } from 'react';
import { X, DollarSign, FileText, Zap, Clock, Calendar, Truck, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './common/GlassCard';
import GlowButton from './common/GlowButton';
import api from '../utils/api';

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(0,210,255,0.2)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
};

const labelStyle = {
    fontSize: '0.6rem',
    fontWeight: 900,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '6px'
};

// Helper: datetime-local input value must be a specific format
const toDatetimeLocal = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const pad = (n) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const defaultStart = () => { const d = new Date(); d.setMinutes(d.getMinutes() + 1); return toDatetimeLocal(d); };
const defaultEnd = () => { const d = new Date(); d.setMinutes(d.getMinutes() + 30); return toDatetimeLocal(d); };
const defaultForced = () => { const d = new Date(); d.setHours(d.getHours() + 2); return toDatetimeLocal(d); };
const defaultService = () => { const d = new Date(); d.setDate(d.getDate() + 7); return toDatetimeLocal(d); };

const emptyForm = () => ({
    title: '',
    description: '',
    basePrice: '',
    minIncrement: '100',
    startTime: defaultStart(),
    endTime: defaultEnd(),
    forcedCloseTime: defaultForced(),
    serviceDate: defaultService(),
    britishConfig: {
        triggerWindow: '10',
        extensionDuration: '5',
        extensionTrigger: 'bid_received',
    },
    currency: 'INR'
});

const CreateAuctionModal = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState(emptyForm());
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(prev => ({
                ...prev,
                title: initialData.title || prev.title,
                description: initialData.description || prev.description,
                basePrice: initialData.basePrice || prev.basePrice
            }));
        } else if (!isOpen) {
            setFormData(emptyForm());
        }
    }, [isOpen, initialData]);

    const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
    const setCfg = (key, val) => setFormData(prev => ({
        ...prev,
        britishConfig: { ...prev.britishConfig, [key]: val }
    }));

    const handleSubmit = async () => {
        if (!formData.title || !formData.description || !formData.basePrice || !formData.minIncrement) {
            alert('VALIDATION_ERROR: Please fill out RFQ Name, Description, Base Valuation, and Min Undercut Step.');
            return;
        }
        if (!formData.startTime || !formData.endTime || !formData.forcedCloseTime) {
            alert('VALIDATION_ERROR: Please ensure Start Time, End Time, and Forced Close Time are selected.');
            return;
        }
        if (new Date(formData.endTime) <= new Date(formData.startTime)) {
            alert('VALIDATION_ERROR: Bid Close Time must be AFTER Bid Start Time.');
            return;
        }
        if (new Date(formData.forcedCloseTime) <= new Date(formData.endTime)) {
            alert('VALIDATION_ERROR: Forced Close Time must be AFTER the Bid Close Time.');
            return;
        }

        setIsSubmitting(true);
        try {
            // const startTime = new Date();
            await api.post('/auctions', {
                title: formData.title,
                description: formData.description,
                basePrice: Number(formData.basePrice),
                minIncrement: Number(formData.minIncrement),
                startTime: new Date(formData.startTime),
                endTime: new Date(formData.endTime),
                forcedCloseTime: new Date(formData.forcedCloseTime),
                serviceDate: new Date(formData.serviceDate),
                britishConfig: {
                    triggerWindow: Number(formData.britishConfig.triggerWindow),
                    extensionDuration: Number(formData.britishConfig.extensionDuration),
                    extensionTrigger: formData.britishConfig.extensionTrigger,
                },
                currency: formData.currency
            });
            onSuccess();
            onClose();
        } catch (err) {
            alert('Failed to deploy: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', paddingBottom: '120px', overflowY: 'auto' }}>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)' }}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{ width: '100%', maxWidth: '680px', position: 'relative', maxHeight: '85vh', overflowY: 'auto', paddingBottom: '40px' }}
                    >
                        <GlassCard style={{ padding: '40px', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h2 className="glow-text" style={{ fontSize: '1.6rem', fontWeight: 900 }}>INITIALIZE_PROTOCOL</h2>
                                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginTop: '4px' }}>BRITISH AUCTION · RFQ DEPLOYMENT</p>
                                </div>
                                <X size={22} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={onClose} />
                            </div>

                            <div style={{ display: 'grid', gap: '20px' }}>

                                {/* RFQ Name */}
                                <div>
                                    <label style={labelStyle}><FileText size={10} style={{ display: 'inline', marginRight: 4 }} />RFQ Name / Reference ID</label>
                                    <input style={inputStyle} placeholder="e.g. FREIGHT_RFQ_2026_Q1" value={formData.title} onChange={e => set('title', e.target.value)} />
                                </div>

                                {/* Description */}
                                <div>
                                    <label style={labelStyle}>Technical Description</label>
                                    <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Shipment details, route, cargo type..." value={formData.description} onChange={e => set('description', e.target.value)} />
                                </div>

                                {/* Pricing */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Currency</label>
                                        <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.currency} onChange={e => set('currency', e.target.value)}>
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="AED">AED (dh)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}><DollarSign size={10} style={{ display: 'inline', marginRight: 4 }} />Base Price</label>
                                        <input type="number" style={inputStyle} placeholder="500000" value={formData.basePrice} onChange={e => set('basePrice', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}><Zap size={10} style={{ display: 'inline', marginRight: 4 }} />Min Step</label>
                                        <input type="number" style={inputStyle} placeholder="1000" value={formData.minIncrement} onChange={e => set('minIncrement', e.target.value)} />
                                    </div>
                                </div>

                                {/* Scheduling */}
                                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0,210,255,0.03)', border: '1px solid rgba(0,210,255,0.1)' }}>
                                    <p style={{ ...labelStyle, color: 'rgba(0,210,255,0.7)', marginBottom: '14px' }}><Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />Auction Schedule</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                        <div>
                                            <label style={labelStyle}>Bid Start Date & Time</label>
                                            <input type="datetime-local" style={inputStyle} value={formData.startTime} onChange={e => set('startTime', e.target.value)} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Bid Close Date & Time</label>
                                            <input type="datetime-local" style={inputStyle} value={formData.endTime} onChange={e => set('endTime', e.target.value)} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>🔒 Forced Bid Close Time</label>
                                            <input type="datetime-local" style={{ ...inputStyle, borderColor: 'rgba(244,63,94,0.3)' }} value={formData.forcedCloseTime} onChange={e => set('forcedCloseTime', e.target.value)} />
                                            <p style={{ fontSize: '0.58rem', color: 'rgba(244,63,94,0.7)', marginTop: '4px' }}>Hard cap — bidding stops regardless of extensions</p>
                                        </div>
                                        <div>
                                            <label style={labelStyle}><Truck size={10} style={{ display: 'inline', marginRight: 4 }} />Pickup / Service Date</label>
                                            <input type="datetime-local" style={inputStyle} value={formData.serviceDate} onChange={e => set('serviceDate', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* British Auction Config */}
                                <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                    <p style={{ ...labelStyle, color: 'rgba(99,102,241,0.9)', marginBottom: '14px' }}><Settings size={10} style={{ display: 'inline', marginRight: 4 }} />British Auction Configuration</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                        <div>
                                            <label style={labelStyle}>Trigger Window (X minutes)</label>
                                            <input type="number" style={inputStyle} placeholder="10" value={formData.britishConfig.triggerWindow} onChange={e => setCfg('triggerWindow', e.target.value)} />
                                            <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>System monitors bids in last X mins</p>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Extension Duration (Y minutes)</label>
                                            <input type="number" style={inputStyle} placeholder="5" value={formData.britishConfig.extensionDuration} onChange={e => setCfg('extensionDuration', e.target.value)} />
                                            <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>Time added when trigger fires</p>
                                        </div>
                                        <div style={{ gridColumn: '1/-1' }}>
                                            <label style={labelStyle}>Extension Trigger Rule</label>
                                            <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.britishConfig.extensionTrigger} onChange={e => setCfg('extensionTrigger', e.target.value)}>
                                                <option value="bid_received">Any Bid Received in Last X Minutes</option>
                                                <option value="rank_change">Any Supplier Rank Change in Last X Minutes</option>
                                                <option value="l1_rank_change">L1 (Lowest Bidder) Rank Change Only</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleSubmit} 
                                    type="button" 
                                    disabled={isSubmitting} 
                                    className="bid-button"
                                    style={{ 
                                        width: '100%', 
                                        padding: '18px', 
                                        marginTop: '8px', 
                                        background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontSize: '1rem',
                                        fontWeight: 800,
                                        letterSpacing: '1px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        opacity: isSubmitting ? 0.7 : 1,
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                                    }}
                                >
                                    {isSubmitting ? 'ESTABLISHING...' : 'DEPLOY_PROTOCOL'}
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateAuctionModal;
