import { useRef, useCallback } from 'react';

const SOUNDS = {
    chip: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Poker chip
    spin: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3', // Mechanical spin
    win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Success chime
    lose: 'https://assets.mixkit.co/active_storage/sfx/2180/2180-preview.mp3', // Thud
    ball: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Small click/impact
    music: '/audio/bar-jazz-classics.mp3', // Consistent background Jazz
};

export const useAudio = () => {
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    const play = useCallback((soundName: keyof typeof SOUNDS, volume: number = 0.5, loop: boolean = false) => {
        // Only allow background music, skip all other sound effects as per user request
        if (soundName !== 'music') return;

        if (!audioRefs.current[soundName]) {
            audioRefs.current[soundName] = new Audio(SOUNDS[soundName]);
        }

        const audio = audioRefs.current[soundName];
        audio.volume = volume;
        audio.loop = loop;

        // For background music, if it's already playing, don't restart it
        if (soundName === 'music' && !audio.paused) return;

        audio.currentTime = 0;
        audio.play().catch(e => console.warn('Audio play failed:', e));
    }, []);

    const stop = useCallback((soundName: keyof typeof SOUNDS) => {
        const audio = audioRefs.current[soundName];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, []);

    const setVolume = useCallback((soundName: keyof typeof SOUNDS, volume: number) => {
        const audio = audioRefs.current[soundName];
        if (audio) {
            audio.volume = volume;
        }
    }, []);

    return { play, stop, setVolume };
};
