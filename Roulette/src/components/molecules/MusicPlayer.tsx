import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Pause, Play, Music2 } from 'lucide-react';

const JAZZ_TRACK_URL = '/audio/bar-jazz-classics.mp3';

const MusicPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.4);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(JAZZ_TRACK_URL);
        audio.loop = true;
        audio.volume = volume;
        audioRef.current = audio;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        audio.play().catch(() => {
            const onInteract = () => {
                audio.play().catch(() => {});
                window.removeEventListener('click', onInteract);
            };
            window.addEventListener('click', onInteract);
        });

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    };

    return (
        <div
            className="fixed bottom-6 left-6 z-[100]"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                    background: 'rgba(8,9,14,0.92)',
                    border: '1px solid rgba(255,171,10,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {/* Visualizer */}
                <div className="flex items-end gap-[3px] h-5 w-7">
                    {[0.6, 1, 0.75, 0.9].map((h, i) => (
                        <motion.div
                            key={i}
                            animate={isPlaying ? { scaleY: [0.3, 1, 0.5, 0.8, 0.3] } : { scaleY: 0.3 }}
                            transition={{ repeat: Infinity, duration: 0.6 + i * 0.15, ease: 'easeInOut', delay: i * 0.08 }}
                            className="flex-1 rounded-full origin-bottom"
                            style={{ background: 'rgba(255,171,10,0.7)', height: '100%' }}
                        />
                    ))}
                </div>

                <AnimatePresence>
                    {showControls ? (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 'auto', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 overflow-hidden"
                        >
                            <div className="w-px h-6 bg-white/[0.08]" />
                            <button
                                onClick={togglePlay}
                                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                                style={{ color: 'rgba(255,255,255,0.5)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                            >
                                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                className="transition-colors"
                                style={{ color: 'rgba(255,255,255,0.4)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                            >
                                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                            </button>
                            <input
                                type="range" min="0" max="1" step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={e => { setVolume(parseFloat(e.target.value)); if (isMuted) setIsMuted(false); }}
                                className="w-16 h-1 rounded-full cursor-pointer accent-gold-500"
                                style={{ background: 'rgba(255,255,255,0.08)' }}
                            />
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-gold-500/70 leading-none whitespace-nowrap">Midnight Jazz</div>
                                <div className="text-[8px] text-white/25 tracking-widest uppercase mt-0.5 whitespace-nowrap">Lounge Radio</div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Music2 size={13} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default MusicPlayer;
