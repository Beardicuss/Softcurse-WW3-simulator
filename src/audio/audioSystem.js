/**
 * WW3: GLOBAL COLLAPSE — Audio System (expo-av activated)
 *
 * expo-av is installed. Drop .mp3 files into assets/audio/ 
 * then uncomment the matching require() line in AUDIO_ASSETS.
 *
 * REQUIRED FILES (create folder assets/audio/ first):
 *   attack.mp3        explosion/gunfire burst        0.5-1s
 *   capture.mp3       triumphant stab                0.5s
 *   defense.mp3       impact thud                    0.3s
 *   nuke.mp3          deep rumble + siren             2s
 *   orbital.mp3       energy beam                    0.8s
 *   endTurn.mp3       mechanical confirm click        0.3s
 *   buildUnit.mp3     deploy/equipment sound          0.4s
 *   research.mp3      tech beep/unlock               0.4s
 *   alert.mp3         urgent ping                    0.3s
 *   crisis.mp3        tension alarm                  0.6s
 *   music_tension.mp3 Act I ambient loop             60s+
 *   music_war.mp3     Act II military loop           60s+
 *   music_nuclear.mp3 Act III intense loop           60s+
 *
 * FREE SOURCES:
 *   SFX:   mixkit.co | freesound.org (CC0 license)
 *   Music: incompetech.com (Kevin MacLeod, royalty-free)
 */

import { useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import useGameStore from '../store/useGameStore';

// ─── Asset Map ────────────────────────────────────────────────────────────────
// Uncomment each line after adding the file to assets/audio/

export const AUDIO_ASSETS = {
    attack: require('../../assets/audio/attack.mp3'),
    capture: require('../../assets/audio/capture.mp3'),
    defense: require('../../assets/audio/defense.mp3'),
    nuke: require('../../assets/audio/nuke.mp3'),
    orbital: require('../../assets/audio/orbital.mp3'),
    endTurn: require('../../assets/audio/endTurn.mp3'),
    buildUnit: require('../../assets/audio/buildUnit.mp3'),
    research: require('../../assets/audio/research.mp3'),
    alert: require('../../assets/audio/alert.mp3'),
    crisis: require('../../assets/audio/crisis.mp3'),
    event_good: require('../../assets/audio/event_good.mp3'),
    event_bad: require('../../assets/audio/event_bad.mp3'),
    music_tension: require('../../assets/audio/music_tension.mp3'),
    music_war: require('../../assets/audio/music_war.mp3'),
    music_nuclear: require('../../assets/audio/music_nuclear.mp3'),
};

// ─── Haptic Fallback ──────────────────────────────────────────────────────────
const HAPTIC_PATTERNS = {
    attack:    [0, 50, 30, 50],
    capture:   [0, 100],
    defense:   [0, 30],
    nuke:      [0, 200, 100, 200, 100, 300],
    endTurn:   [0, 40],
    buildUnit: [0, 20],
    alert:     [0, 80, 40, 80],
    crisis:    [0, 150, 80, 150],
    research:  [0, 30],
    orbital:   [0, 80, 40, 120],
};

function vibrate(key) {
    try {
        const { Vibration } = require('react-native');
        const p = HAPTIC_PATTERNS[key];
        if (p) Vibration.vibrate(p);
    } catch (e) {}
}

// ─── Audio Manager ────────────────────────────────────────────────────────────

class AudioManager {
    constructor() {
        this.sfxVolume    = 1.0;
        this.musicVolume  = 0.6;
        this.sfxEnabled   = true;
        this.musicEnabled = true;
        this._cache       = {};
        this._music       = null;
        this._track       = null;
        this._setup();
    }

    async _setup() {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS:    true,
                staysActiveInBackground: false,
                shouldDuckAndroid:       true,
            });
        } catch (e) {
            console.warn('[Audio] setup failed:', e.message);
        }
    }

    async play(key) {
        vibrate(key); // instant haptic regardless of audio
        if (!this.sfxEnabled || this.sfxVolume === 0) return;
        const asset = AUDIO_ASSETS[key];
        if (!asset) return;
        try {
            let sound = this._cache[key];
            if (!sound) {
                const { sound: s } = await Audio.Sound.createAsync(asset, { shouldPlay: false });
                this._cache[key] = s;
                sound = s;
            }
            await sound.setVolumeAsync(this.sfxVolume);
            await sound.replayAsync();
        } catch (e) {
            console.warn(`[Audio] play(${key}):`, e.message);
        }
    }

    async playMusic(trackKey) {
        if (!this.musicEnabled || this.musicVolume === 0) return;
        if (this._track === trackKey) return;
        await this.stopMusic();
        const asset = AUDIO_ASSETS[trackKey];
        if (!asset) { this._track = trackKey; return; }
        try {
            const { sound } = await Audio.Sound.createAsync(asset, {
                volume: this.musicVolume, isLooping: true, shouldPlay: true,
            });
            this._music = sound;
            this._track = trackKey;
        } catch (e) {
            console.warn(`[Audio] music(${trackKey}):`, e.message);
        }
    }

    async stopMusic() {
        if (this._music) {
            try { await this._music.stopAsync(); await this._music.unloadAsync(); } catch (e) {}
            this._music = null;
            this._track = null;
        }
    }

    setMusicVolume(vol) {
        this.musicVolume  = vol;
        this.musicEnabled = vol > 0;
        if (this._music) this._music.setVolumeAsync(vol).catch(() => {});
        if (vol === 0) this.stopMusic();
    }

    setSfxVolume(vol) {
        this.sfxVolume  = vol;
        this.sfxEnabled = vol > 0;
        Object.values(this._cache).forEach(s => s.setVolumeAsync(vol).catch(() => {}));
    }

    async unloadAll() {
        await this.stopMusic();
        for (const s of Object.values(this._cache)) {
            try { await s.unloadAsync(); } catch (e) {}
        }
        this._cache = {};
    }
}

export const audioManager = new AudioManager();

// ─── React Hook ───────────────────────────────────────────────────────────────

export function useAudio() {
    const settings = useGameStore(s => s.settings);
    const actPhase = useGameStore(s => s.actPhase);
    const uiMode   = useGameStore(s => s.uiMode);

    // Sync volume — store uses musicVolume/sfxVolume directly (0 = off, >0 = on)
    useEffect(() => {
        audioManager.setMusicVolume(settings?.musicVolume ?? 0.8);
        audioManager.setSfxVolume(settings?.sfxVolume     ?? 1.0);
    }, [settings?.musicVolume, settings?.sfxVolume]);

    // Ambient music changes with act
    useEffect(() => {
        if (uiMode !== 'GAME') return;
        const track = actPhase === 3 ? 'music_nuclear'
                    : actPhase === 2 ? 'music_war'
                    : 'music_tension';
        audioManager.playMusic(track);
    }, [actPhase, uiMode]);

    // Stop when leaving game
    useEffect(() => {
        if (uiMode !== 'GAME') audioManager.stopMusic();
    }, [uiMode]);

    const play = useCallback((key) => { audioManager.play(key); }, []);

    return { play };
}
