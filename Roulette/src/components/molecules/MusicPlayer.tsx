import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Music2, Volume2, VolumeX, Pause, Play } from 'lucide-react';

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

        // Try to play immediately if user has already interacted
        audio.play().then(() => {
            setIsPlaying(true);
        }).catch(() => {
            const handleFirstInteraction = () => {
                audio.play().then(() => {
                    setIsPlaying(true);
                }).catch(err => console.log("Autoplay blocked:", err));
                window.removeEventListener('click', handleFirstInteraction);
                window.removeEventListener('keydown', handleFirstInteraction);
            };

            window.addEventListener('click', handleFirstInteraction);
            window.addEventListener('keydown', handleFirstInteraction);
        });

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.pause();
            audio.src = "";
            audioRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    return (
        <div
            className="fixed bottom-8 left-8 z-[100]"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex items-center gap-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl"
            >
                {/* Visualizer Animation */}
                <div className="flex items-end gap-1 h-6 w-8 px-1">
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            animate={isPlaying ? {
                                height: [4, 16, 8, 20, 4][i % 5],
                            } : { height: 4 }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.5 + (i * 0.1),
                                ease: "easeInOut"
                            }}
                            className="w-1 bg-gold-500 rounded-full"
                        />
                    ))}
                </div>

                <AnimatePresence>
                    {showControls && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 'auto', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="flex items-center gap-4 overflow-hidden pr-2"
                        >
                            <div className="h-8 w-[1px] bg-white/10 mx-1" />

                            <button
                                onClick={togglePlay}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
                            >
                                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            </button>

                            <div className="flex items-center gap-2 group/vol">
                                <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
                                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => {
                                        setVolume(parseFloat(e.target.value));
                                        if (isMuted) setIsMuted(false);
                                    }}
                                    className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                                />
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gold-500 leading-none">Midnight Jazz</span>
                                <span className="text-[8px] font-medium text-zinc-500 tracking-tighter uppercase mt-1">Lounge Radio</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!showControls && (
                    <div className="flex flex-col pr-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none">Jazz Playing</span>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default MusicPlayer;
