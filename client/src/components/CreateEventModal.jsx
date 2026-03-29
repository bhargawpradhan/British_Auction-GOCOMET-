import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Type, FileText } from 'lucide-react';
import api from '../utils/api';

const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }
};

const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.3s ease'
};

const CreateEventModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        type: 'system'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/events', formData);
            setFormData({ title: '', description: '', date: '', type: 'system' });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="glass-morphism"
                        style={{
                            width: '100%', maxWidth: '500px', padding: '40px',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(0, 210, 255, 0.2)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            position: 'relative'
                        }}
                    >
                        <X 
                            size={24} 
                            style={{ position: 'absolute', top: '25px', right: '25px', cursor: 'pointer', opacity: 0.5 }} 
                            onClick={onClose} 
                        />

                        <div style={{ marginBottom: '30px' }}>
                            <h2 className="glow-text" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '5px' }}>NEW_EVENT_BROADCAST</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', letterSpacing: '1px' }}>INITIALIZE SYSTEM NOTIFICATION PROTOCOL</p>
                        </div>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.5)', borderRadius: '8px', color: '#f43f5e', fontSize: '0.8rem', marginBottom: '20px', fontWeight: 700 }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '1px' }}>
                                    <Type size={14} /> EVENT_TITLE
                                </label>
                                <input
                                    required
                                    style={inputStyle}
                                    placeholder="Enter transmission header..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '1px' }}>
                                    <FileText size={14} /> PAYLOAD_DESCRIPTION
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    style={{ ...inputStyle, resize: 'none' }}
                                    placeholder="Enter detailed broadcast message..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '1px' }}>
                                        <Calendar size={14} /> EXECUTION_DATE
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        style={inputStyle}
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '1px' }}>
                                        <Type size={14} /> CLASSIFICATION
                                    </label>
                                    <select
                                        style={{ ...inputStyle, appearance: 'none' }}
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="system" style={{ background: '#0f172a' }}>SYSTEM</option>
                                        <option value="auction" style={{ background: '#0f172a' }}>AUCTION</option>
                                        <option value="maintenance" style={{ background: '#0f172a' }}>MAINTENANCE</option>
                                        <option value="other" style={{ background: '#0f172a' }}>OTHER</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginTop: '10px',
                                    padding: '16px',
                                    background: loading ? 'rgba(0, 210, 255, 0.3)' : 'var(--primary)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem',
                                    fontWeight: 900,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    letterSpacing: '1px'
                                }}
                            >
                                {loading ? 'TRANSMITTING...' : 'BROADCAST_EVENT'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateEventModal;
