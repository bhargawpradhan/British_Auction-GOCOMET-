import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StartupSequence = ({ onComplete }) => {
  const [stage, setStage] = useState('init'); // init, process, done
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const initLogs = [
    { text: 'SYSTEM.INIT[BOOTING]', delay: 0.2 },
    { text: 'KERNEL_IMAGE_LOAD[SUCCESS]', delay: 0.5 },
    { text: 'NEURAL_BRIDGE_STABILIZING...', delay: 0.8 },
    { text: 'ENCRYPT_HANDSHAKE[ACTIVE]', delay: 1.1 },
    { text: 'SYNCING_RECORDS_WITH_LEDGER', delay: 1.4 },
    { text: 'READY_FOR_DEPLOYMENT', delay: 1.7 }
  ];

  useEffect(() => {
    let timeoutIds = [];

    // Stage 1: Init logs
    initLogs.forEach((log, index) => {
      const tid = setTimeout(() => {
        setLogs(prev => [...prev, log.text]);
      }, log.delay * 1000);
      timeoutIds.push(tid);
    });

    // Move to Stage 2: Process
    const processTid = setTimeout(() => {
      setStage('process');
    }, 2500);
    timeoutIds.push(processTid);

    return () => timeoutIds.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'process') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage('done'), 500);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'done') {
      const finalTid = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(finalTid);
    }
  }, [stage, onComplete]);

  return (
    <motion.div 
      className="startup-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="startup-content">
        <AnimatePresence mode="wait">
          {stage === 'init' && (
            <motion.div 
              key="init-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="terminal-logs"
            >
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="log-entry mono-text"
                >
                  <span className="prompt-char">{'>'}</span> {log}
                </motion.div>
              ))}
              <motion.div 
                animate={{ opacity: [0, 1] }} 
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="cursor"
              />
            </motion.div>
          )}

          {stage === 'process' && (
            <motion.div 
              key="process-stage"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="processing-unit"
            >
              <h2 className="glow-text startup-title">ESTABLISHING CONNECTION</h2>
              <div className="progress-wrapper glass-morphism">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                />
                <div className="scanning-bar" />
              </div>
              <div className="progress-status mono-text">
                {Math.round(progress)}% SECURE_TUNNEL_READY
              </div>
            </motion.div>
          )}

          {stage === 'done' && (
            <motion.div 
              key="done-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="final-handshake"
            >
              <h1 className="glow-text welcome-text">AEON SYSTEMS ONLINE</h1>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="pulse-circle"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};

export default StartupSequence;
