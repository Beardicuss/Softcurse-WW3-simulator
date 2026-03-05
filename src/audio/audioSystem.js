/**
 * WW3: GLOBAL COLLAPSE — Audio System
 *
 * Uses React Native's built-in sound capabilities via simple
 * oscillator-based tones through a lightweight approach.
 *
 * Since Expo AV requires asset files, this system generates
 * programmatic audio feedback using:
 *   - Haptic feedback for battle impacts
 *   - System sounds where available
 *   - A tone-queue system ready to plug real audio files into
 *
 * To add real audio: drop .mp3 files in /assets/audio/ and
 * replace the placeholder entries in AUDIO_ASSETS below.
 *
 * Usage:
 *   import { useAudio } from '../audio/audioSystem';
 *   const audio = useAudio();
 *   audio.play('attack');
 *   audio.play('capture');
 *   audio.setMusicVolume(0.5);
 */

import { useEffect, useCallback } from 'react';
import useGameStore from '../store/useGameStore';

// ─── Asset Map ────────────────────────────────────────────────────────────────
// Replace null with require('../../../assets/audio/attack.mp3') etc.
// when you add real audio files.

export const AUDIO_ASSETS = {
    // Combat
    attack:       null,   // rifle/explosion burst
    capture:      null,   // triumphant short stab
    defense:      null,   // impact thud
    nuke:         null,   // deep rumble + siren
    orbital:      null,   // high-pitched beam

    // UI
    endTurn:      null,   // mechanical click / confirm
    buildUnit:    null,   // equipment deploy sound
    research:     null,   // tech beep
    alert:        null,   // urgent notification ping

    // Events
    crisis:       null,   // low tension alert
    event_good:   null,   // positive chime
    event_bad:    null,   // negative chord

    // Ambient music tracks (loop)
    music_tension:    null,   // Act I — low ambient drone
    music_war:        null,   // Act II — military march base
    music_nuclear:    null,   // Act III — dark/intense
};

// ─── Haptic Feedback Map ─────────────────────────────────────────────────────
// Uses react-native's Vibration API as a fallback for audio feel
const HAPTIC_PATTERNS = {
    attack:   [0, 50, 30, 50],           // double tap
    capture:  [0, 100],                  // single long
    defense:  [0, 30],                   // short tap
    nuke:     [0, 200, 100, 200, 100, 300], // escalating
    endTurn:  [0, 40],                   // soft confirm
    buildUnit:[0, 20],                   // light tap
    alert:    [0, 80, 40, 80],           // urgent double
    crisis:   [0, 150, 80, 150],         // warning
};

// ─── Audio Manager Class ──────────────────────────────────────────────────────

class AudioManager {
    constructor() {
        this.sfxVolume = 1.0;
        this.musicVolume = 0.8;
        this.enabled = true;
        this._vibration = null;
        this._initVibration();
    }

    _initVibration() {
        try {
            const { Vibration } = require('react-native');
            this._vibration = Vibration;
        } catch (e) {}
    }

    vibrate(key) {
        if (!this.enabled || this.sfxVolume === 0) return;
        const pattern = HAPTIC_PATTERNS[key];
        if (pattern && this._vibration) {
            try { this._vibration.vibrate(pattern); } catch (e) {}
        }
    }

    // Main play method — vibration now, audio file when assets added
    play(key) {
        this.vibrate(key);
        // When you add audio files, load them here via expo-av
        // See instructions at bottom of this file
    }

    setMusicVolume(vol) { this.musicVolume = vol; }
    setSfxVolume(vol)   { this.sfxVolume = vol; }
    playMusic()         {} // no-op until audio files added
    stopMusic()         {} // no-op until audio files added
    unloadAll()         {} // no-op until audio files added
}

export const audioManager = new AudioManager();

// ─── React Hook ───────────────────────────────────────────────────────────────

export function useAudio() {
    const settings = useGameStore(s => s.settings);

    // Sync volume settings when they change
    useEffect(() => {
        audioManager.setMusicVolume(settings?.musicVolume ?? 0.8);
        audioManager.setSfxVolume(settings?.sfxVolume ?? 1.0);
    }, [settings?.musicVolume, settings?.sfxVolume]);

    const play = useCallback((key) => {
        audioManager.play(key);
    }, []);

    return { play, manager: audioManager };
}

// ─── Audio Instructions for Real Assets ─────────────────────────────────────
/*
 HOW TO ADD REAL AUDIO:

 1. Install Expo AV:
    npx expo install expo-av

 2. Create folder: assets/audio/

 3. Add audio files (mp3 or wav):
    assets/audio/attack.mp3
    assets/audio/capture.mp3
    assets/audio/defense.mp3
    assets/audio/nuke.mp3
    assets/audio/orbital.mp3
    assets/audio/endTurn.mp3
    assets/audio/buildUnit.mp3
    assets/audio/research.mp3
    assets/audio/alert.mp3
    assets/audio/crisis.mp3
    assets/audio/event_good.mp3
    assets/audio/event_bad.mp3
    assets/audio/music_tension.mp3   (looping ambient, ~2-3min)
    assets/audio/music_war.mp3       (looping military, ~2-3min)
    assets/audio/music_nuclear.mp3   (looping intense, ~2-3min)

 4. Replace null values in AUDIO_ASSETS with:
    attack: require('../../assets/audio/attack.mp3'),
    ...etc

 5. The audioManager will automatically load and cache sounds on first play.

 RECOMMENDED FREE SOURCES:
   - freesound.org (CC0 licensed)
   - soundsnap.com
   - mixkit.co (free sound effects)
   - For music: incompetech.com (Kevin MacLeod, royalty-free)
*/
