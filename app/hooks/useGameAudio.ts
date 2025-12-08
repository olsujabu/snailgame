"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseGameAudioReturn {
    playBackgroundMusic: () => void;
    stopBackgroundMusic: () => void;
    playJumpSound: () => void;
    playHitSound: () => void;
    playCollectSound: () => void;
}

export function useGameAudio(): UseGameAudioReturn {
    const bgMusicRef = useRef<HTMLAudioElement | null>(null);
    const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
    const hitSoundRef = useRef<HTMLAudioElement | null>(null);
    const collectSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio elements
        if (typeof window !== "undefined") {
            // Background music - upbeat game music
            bgMusicRef.current = new Audio();
            bgMusicRef.current.loop = true;
            bgMusicRef.current.volume = 0.3;

            // Use Web Audio API to generate sounds procedurally
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Jump sound - bouncy boing
            const createJumpSound = () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            };

            // Hit sound - impact
            const createHitSound = () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const filter = audioContext.createBiquadFilter();

                oscillator.type = "sawtooth";
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(audioContext.destination);

                filter.type = "lowpass";
                filter.frequency.setValueAtTime(800, audioContext.currentTime);
                filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);

                oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);

                gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
            };

            // Collect sound - coin pickup
            const createCollectSound = () => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.type = "sine";
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
            };

            jumpSoundRef.current = { play: createJumpSound } as any;
            hitSoundRef.current = { play: createHitSound } as any;
            collectSoundRef.current = { play: createCollectSound } as any;
        }

        return () => {
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current = null;
            }
        };
    }, []);

    const playBackgroundMusic = useCallback(() => {
        if (bgMusicRef.current && bgMusicRef.current.paused) {
            // Use a simple upbeat melody as background
            // For now, we'll skip actual music file and rely on game sounds
            // You can add a music file to /public and use: bgMusicRef.current.src = "/background-music.mp3"
        }
    }, []);

    const stopBackgroundMusic = useCallback(() => {
        if (bgMusicRef.current) {
            bgMusicRef.current.pause();
            bgMusicRef.current.currentTime = 0;
        }
    }, []);

    const playJumpSound = useCallback(() => {
        if (jumpSoundRef.current) {
            try {
                jumpSoundRef.current.play();
            } catch (e) {
                console.log("Jump sound error:", e);
            }
        }
    }, []);

    const playHitSound = useCallback(() => {
        if (hitSoundRef.current) {
            try {
                hitSoundRef.current.play();
            } catch (e) {
                console.log("Hit sound error:", e);
            }
        }
    }, []);

    const playCollectSound = useCallback(() => {
        if (collectSoundRef.current) {
            try {
                collectSoundRef.current.play();
            } catch (e) {
                console.log("Collect sound error:", e);
            }
        }
    }, []);

    return {
        playBackgroundMusic,
        stopBackgroundMusic,
        playJumpSound,
        playHitSound,
        playCollectSound,
    };
}
