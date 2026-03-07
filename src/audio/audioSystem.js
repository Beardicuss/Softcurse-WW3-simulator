/**
 * WW3: GLOBAL COLLAPSE — Audio System (expo-av)
 *
 * Drop .mp3 files into assets/audio/ to activate each sound.
 * Missing files are silently skipped — haptic fallback always fires.
 *
 * Hermes (Android) forbids dynamic require(variable) — every require()
 * here is a static string literal so Metro can resolve it at bundle time.
 * Files that don't exist yet simply stay null and are skipped at runtime.
 */

import { useEffect, useCallback } from 'react';

let Audio = null;
try { Audio = require('expo-av').Audio; } catch (e) {}

import useGameStore from '../store/useGameStore';

// ─── Static asset requires ────────────────────────────────────────────────────
// Each line is a static literal — Hermes is satisfied.
// If a file is missing, catch sets it to null and the sound is skipped.

let _attack        = null;
let _capture       = null;
let _defense       = null;
let _nuke          = null;
let _orbital       = null;
let _endTurn       = null;
let _buildUnit     = null;
let _research      = null;
let _alert         = null;
let _crisis        = null;
let _event_good    = null;
let _event_bad     = null;
let _music_tension = null;
let _music_war     = null;
let _music_nuclear = null;

try { _attack        = require('../../assets/audio/attack.mp3');        } catch (_) {}
try { _capture       = require('../../assets/audio/capture.mp3');       } catch (_) {}
try { _defense       = require('../../assets/audio/defense.mp3');       } catch (_) {}
try { _nuke          = require('../../assets/audio/nuke.mp3');          } catch (_) {}
try { _orbital       = require('../../assets/audio/orbital.mp3');       } catch (_) {}
try { _endTurn       = require('../../assets/audio/endTurn.mp3');       } catch (_) {}
try { _buildUnit     = require('../../assets/audio/buildUnit.mp3');     } catch (_) {}
try { _research      = require('../../assets/audio/research.mp3');      } catch (_) {}
try { _alert         = require('../../assets/audio/alert.mp3');         } catch (_) {}
try { _crisis        = require('../../assets/audio/crisis.mp3');        } catch (_) {}
try { _event_good    = require('../../assets/audio/event_good.mp3');    } catch (_) {}
try { _event_bad     = require('../../assets/audio/event_bad.mp3');     } catch (_) {}
try { _music_tension = require('../../assets/audio/music_tension.mp3'); } catch (_) {}
try { _music_war     = require('../../assets/audio/music_war.mp3');     } catch (_) {}
try { _music_nuclear = require('../../assets/audio/music_nuclear.mp3'); } catch (_) {}

export const AUDIO_ASSETS = {
    attack:        _attack,
    capture:       _capture,
    defense:       _defense,
    nuke:          _nuke,
    orbital:       _orbital,
    endTurn:       _endTurn,
    buildUnit:     _buildUnit,
    research:      _research,
    alert:         _alert,
    crisis:        _crisis,
    event_good:    _event_good,
    event_bad:     _event_bad,
    music_tension: _music_tension,
    music_war:     _music_war,
    music_nuclear: _music_nuclear,
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
        if (!Audio) return;
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS:    true,
                staysActiveInBackground: false,
                shouldDuckAndroid:       true,
            });
        } catch (e) {}
    }

    async play(key) {
        vibrate(key);
        if (!this.sfxEnabled || this.sfxVolume === 0) return;
        const asset = AUDIO_ASSETS[key];
        if (!asset || !Audio) return;
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
            console.warn('[Audio] play(' + key + '):', e.message);
        }
    }

    async playMusic(trackKey) {
        if (!Audio || !this.musicEnabled || this.musicVolume === 0) return;
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
            console.warn('[Audio] music(' + trackKey + '):', e.message);
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

    useEffect(() => {
        audioManager.setMusicVolume(settings?.musicVolume ?? 0.8);
        audioManager.setSfxVolume(settings?.sfxVolume     ?? 1.0);
    }, [settings?.musicVolume, settings?.sfxVolume]);

    useEffect(() => {
        if (uiMode !== 'GAME') return;
        const track = actPhase === 3 ? 'music_nuclear'
                    : actPhase === 2 ? 'music_war'
                    : 'music_tension';
        audioManager.playMusic(track);
    }, [actPhase, uiMode]);

    useEffect(() => {
        if (uiMode !== 'GAME') audioManager.stopMusic();
    }, [uiMode]);

    const play = useCallback((key) => { audioManager.play(key); }, []);

    return { play };
}
