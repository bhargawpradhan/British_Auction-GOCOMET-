import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Radio, Server, Shield, Trash2, Plus, Clock, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import GlassCard from '../components/common/GlassCard';
import GlowButton from '../components/common/GlowButton';
import CreateEventModal from '../components/CreateEventModal';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Only Admin or Maker can create/delete events
    const canManageEvents = user?.role === 'admin' || user?.role === 'maker';

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/events');
            
            // Separate into upcoming and past
            const now = new Date();
            const upcoming = data.filter(e => new Date(e.date) >= now);
            const past = data.filter(e => new Date(e.date) < now);
            
            // Sort appropriately (upcoming nearest first, past most recent first)
            upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
            past.sort((a, b) => new Date(b.date) - new Date(a.date));

            setEvents([...upcoming, ...past]);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm('WARNING: Irrevocable deletion of event record. Confirm?')) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (error) {
            alert('Deletion failed: ' + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const getTypeColor = (type) => {
        switch(type) {
            case 'system': return '#00d2ff'; // Primary blue
            case 'auction': return '#10b981'; // Emerald green
            case 'maintenance': return '#fbbf24'; // Amber
            default: return '#94a3b8'; // Slate
        }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <div className="l1-glow" style={{ width: '40px', height: '40px', background: 'var(--primary)' }} />
            <p className="glow-text" style={{ letterSpacing: '4px', fontSize: '0.8rem' }}>SYNCING_EVENT_LOGS...</p>
        </div>
    );

    return (
        <div className="events-page" style={{ padding: '80px 5%', minHeight: '100vh', position: 'relative' }}>
            <header style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <h1 className="glow-text" style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px' }}>EVENT_LOGS</h1>
                        <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '5px 15px', borderRadius: '50px', border: '1px solid rgba(0, 210, 255, 0.2)', height: 'fit-content' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px' }}>{events.length} RECORDS</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 900 }}>
                            <Radio size={14} className="pulse" color="var(--primary)" /> LIVE_FEED
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 900 }}>
                            <Shield size={14} color="#10b981" /> SECURE_LEDGER
                        </div>
                    </div>
                </div>

                {canManageEvents && (
                    <GlowButton onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Plus size={18} /> NEW_EVENT
                    </GlowButton>
                )}
            </header>

            <CreateEventModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchEvents} 
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                <AnimatePresence>
                    {events.map((event, index) => {
                        const isPast = new Date(event.date) < new Date();
                        const headerColor = getTypeColor(event.type);

                        return (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard style={{ 
                                    padding: '0', 
                                    overflow: 'hidden',
                                    border: `1px solid ${isPast ? 'rgba(255,255,255,0.05)' : `rgba(${headerColor === '#00d2ff' ? '0,210,255' : headerColor === '#10b981' ? '16,185,129' : '251,191,36'}, 0.2)`}`,
                                    opacity: isPast ? 0.6 : 1
                                }}>
                                    {/* Event Top Bar */}
                                    <div style={{ height: '4px', width: '100%', background: headerColor, opacity: isPast ? 0.2 : 0.8 }} />
                                    
                                    <div style={{ padding: '30px', position: 'relative' }}>
                                        
                                        {canManageEvents && (
                                            <button 
                                                onClick={() => deleteEvent(event._id)}
                                                style={{ 
                                                    position: 'absolute', top: '25px', right: '25px', 
                                                    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
                                                    color: '#f43f5e', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}

                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                                            <div style={{ 
                                                background: `rgba(${headerColor === '#00d2ff' ? '0,210,255' : headerColor === '#10b981' ? '16,185,129' : '251,191,36'}, 0.1)`, 
                                                border: `1px solid ${headerColor}`,
                                                color: headerColor,
                                                padding: '6px 14px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase' 
                                            }}>
                                                {event.type}
                                            </div>
                                            
                                            {isPast && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 800 }}>
                                                    <Clock size={14} /> ARCHIVED
                                                </div>
                                            )}
                                        </div>

                                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Calendar size={24} color={headerColor} style={{ opacity: isPast ? 0.5 : 1 }} /> 
                                            <span style={{ textDecoration: isPast ? 'line-through' : 'none', color: isPast ? 'rgba(255,255,255,0.6)' : '#fff' }}>
                                                {event.title}
                                            </span>
                                        </h2>
                                        
                                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '25px', paddingLeft: '34px' }}>
                                            {event.description}
                                        </p>

                                        <div style={{ paddingLeft: '34px', display: 'flex', gap: '30px', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: '4px' }}>EXECUTION_TIME</span>
                                                <span style={{ fontSize: '1rem', fontWeight: 800, color: isPast ? 'rgba(255,255,255,0.4)' : '#fff' }}>
                                                    {new Date(event.date).toLocaleString()}
                                                </span>
                                            </div>

                                            <div>
                                                <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: '4px' }}>INITIATOR_NODE</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                                    {event.createdBy?.name || 'SYSTEM_ADMIN'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {events.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                        <Server size={48} style={{ marginBottom: '20px', color: 'var(--primary)' }} />
                        <h3 className="glow-text" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px' }}>NO_EVENTS_FOUND</h3>
                        <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>The system ledger is currently empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
