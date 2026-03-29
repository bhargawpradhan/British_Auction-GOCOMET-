import React, { useMemo, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

import { TrendingUp, Gavel } from 'lucide-react';

const BackgroundSystem = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const [clickPos, setClickPos] = useState({ x: -1000, y: -1000 });
    const [rippleKey, setRippleKey] = useState(0);

    const springConfig = { stiffness: 60, damping: 20 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const rotateX = useTransform(springY, [-500, 500], [12, -12]);
    const rotateY = useTransform(springX, [-500, 500], [-12, 12]);
    const liquidScale = useTransform(springX, (v) => 1 + Math.abs(v) / 5000);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            mouseX.set(clientX - centerX);
            mouseY.set(clientY - centerY);
        };
        const handleClick = (e) => {
            setClickPos({ x: e.clientX, y: e.clientY });
            setRippleKey(prev => prev + 1);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleClick);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleClick);
        };
    }, [mouseX, mouseY]);

    // Constellation Particles
    const nodes = useMemo(() => Array.from({ length: 45 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.4 + 0.1
    })), []);

    // Floating Currency Symbols
    const currencyNodes = useMemo(() => {
        const symbols = ['₹', '$', '€', '£', 'AED', '¥'];
        return Array.from({ length: 25 }, (_, i) => ({
            id: i,
            symbol: symbols[i % symbols.length],
            x: Math.random() * 100,
            y: Math.random() * 100,
            z: Math.random() * -200,
            rotation: Math.random() * 360,
            speed: Math.random() * 0.3 + 0.2
        }));
    }, []);

    // Rare Ghost Motifs
    const ghostMotifs = useMemo(() => Array.from({ length: 4 }, (_, i) => ({
        id: i,
        type: i % 2 === 0 ? 'gavel' : 'chart',
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        delay: i * 5
    })), []);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            background: '#010409',
            overflow: 'hidden',
        }}>
            {/* Deep Space Nebula Layer */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.05) 0%, transparent 80%)',
                filter: 'blur(100px)',
                opacity: 0.5
            }} />
            {/* Click Shockwave 'Wealth Pulse' */}
            <motion.div
                key={rippleKey}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                    position: 'absolute',
                    left: clickPos.x,
                    top: clickPos.y,
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    border: '2px solid rgba(0, 210, 255, 0.4)',
                    boxShadow: '0 0 50px rgba(0, 210, 255, 0.2)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 10
                }}
            />

            {/* 3D Liquid Grid Layer */}
            <motion.div 
                style={{
                    position: 'absolute',
                    inset: '-15%',
                    rotateX,
                    rotateY,
                    scale: liquidScale,
                    perspective: '1200px',
                    transformStyle: 'preserve-3d',
                    pointerEvents: 'none'
                }}
            >
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(0, 210, 255, 0.25) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 210, 255, 0.25) 1px, transparent 1px)
                    `,
                    backgroundSize: '120px 120px',
                    transform: 'translateZ(-150px) rotateX(55deg)',
                    maskImage: 'radial-gradient(circle at center, black 15%, transparent 95%)'
                }}>
                    {/* Grid Intersection Glowing Dots */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(rgba(0, 210, 255, 0.4) 1px, transparent 1px)',
                        backgroundSize: '120px 120px',
                        backgroundPosition: '-0.5px -0.5px'
                    }} />
                </div>
            </motion.div>

            {/* Ghost Motifs (Gavels & Charts) */}
            {ghostMotifs.map(g => (
                <motion.div
                    key={g.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 0.28, 0], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 10, repeat: Infinity, delay: g.delay }}
                    style={{
                        position: 'absolute',
                        left: `${g.x}%`,
                        top: `${g.y}%`,
                        color: 'rgba(0, 210, 255, 0.9)',
                        filter: 'blur(1.5px)',
                        pointerEvents: 'none'
                    }}
                >
                    {g.type === 'gavel' ? <Gavel size={140} /> : <TrendingUp size={140} />}
                </motion.div>
            ))}

            {/* 3D Currency Nodes */}
            {currencyNodes.map(c => (
                <motion.div
                    key={c.id}
                    style={{
                        position: 'absolute',
                        left: `${c.x}%`,
                        top: `${c.y}%`,
                        color: 'var(--primary)',
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        opacity: 0.35,
                        textShadow: '0 0 20px var(--primary)',
                        x: useTransform(springX, (v) => (v * c.speed * -0.2)),
                        y: useTransform(springY, (v) => (v * c.speed * -0.2)),
                        rotateY: c.rotation + (c.id * 5),
                    }}
                    animate={{ 
                        rotateY: [c.rotation, c.rotation + 360],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ duration: 15 + c.id, repeat: Infinity, ease: 'linear' }}
                >
                    {c.symbol}
                </motion.div>
            ))}

            {/* AEON NEURAL CONSTELLATION SVG */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3, pointerEvents: 'none' }}>
                {nodes.map((n1, i) => 
                    nodes.slice(i + 1, i + 3).map((n2, j) => (
                        <motion.line
                            key={`${n1.id}-${n2.id}`}
                            x1={`${n1.x}%`} y1={`${n1.y}%`}
                            x2={`${n2.x}%`} y2={`${n2.y}%`}
                            stroke="rgba(0, 210, 255, 0.2)"
                            strokeWidth="0.8"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{ duration: 12 + Math.random() * 5, repeat: Infinity }}
                        />
                    ))
                )}
            </svg>

            {/* Interaction Particles */}
            {nodes.map(n => (
                <motion.div
                    key={n.id}
                    style={{
                        position: 'absolute',
                        left: `${n.x}%`,
                        top: `${n.y}%`,
                        width: `${n.size}px`,
                        height: `${n.size}px`,
                        background: 'var(--primary)',
                        borderRadius: '50%',
                        boxShadow: `0 0 15px var(--primary)`,
                        x: useTransform(springX, (v) => (v * n.speed * 0.15)),
                        y: useTransform(springY, (v) => (v * n.speed * 0.15)),
                        pointerEvents: 'none'
                    }}
                    animate={{ 
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.6, 1] 
                    }}
                    transition={{ duration: 5 + (n.id % 5), repeat: Infinity }}
                />
            ))}

            {/* Global Interaction Aurora */}
            <motion.div
                style={{
                    position: 'absolute',
                    left: springX,
                    top: springY,
                    width: '1400px',
                    height: '1400px',
                    background: 'radial-gradient(circle, rgba(0, 210, 255, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(120px)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};




export default BackgroundSystem;
