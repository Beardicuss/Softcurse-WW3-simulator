import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform, Animated } from 'react-native';
import {
  Zap,
  Globe,
  Shield,
  Menu,
  ChevronRight,
  Activity,
  Plane,
  Droplet,
  Layers,
  Banknote,
  Users,
  Compass
} from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated2, {
  useSharedValue, useAnimatedStyle,
  withSequence, withTiming,
  createAnimatedComponent,
} from 'react-native-reanimated';
import { View as RNView } from 'react-native';
const ReAnimatedView = createAnimatedComponent(RNView);

import useGameStore from './src/store/useGameStore';
import { FD, getTerrain } from './src/data/mapData';
import { computeTechModifiers } from './src/data/techTree';
import GameMap from './src/components/GameMap';
import IntroScreen from './src/components/IntroScreen';
import SplashScreen from './src/components/SplashScreen';
import MainMenuView from './src/components/MainMenuView';
import FactionSelectView from './src/components/FactionSelectView';
import EconomyPanel from './src/components/EconomyPanel';
import DiplomacyPanel from './src/components/DiplomacyPanel';
import ResearchPanel from './src/components/ResearchPanel';
import SettingsView from './src/components/SettingsView';
import GameFrame from './src/components/GameFrame';
import { useTranslation } from './src/i18n/i18n';
import { useAudio } from './src/audio/audioSystem';
import CombatEffects from './src/components/CombatEffects';
import CampaignPanel from './src/components/CampaignPanel';
import StatsScreen from './src/components/StatsScreen';
import ActCutscene from './src/components/ActCutscene';
import ScreenTransition from './src/components/ScreenTransition';
import LeaderboardScreen from './src/components/LeaderboardScreen';
import TradePanel from './src/components/TradePanel';
import TutorialOverlay from './src/components/TutorialOverlay';
import Tooltip from './src/components/Tooltip';
import AnimatedNumber from './src/components/AnimatedNumber';

const { width, height } = Dimensions.get('window');

const App = () => {
  const {
    uiMode, playerFaction, factions, regions,
    turn, date, gameLog, selectedRegionId, startGame, checkHasSave,
    nukeUsedThisTurn, launchNuke, orbitalStrike, blackoutRegion, aiMemory,
    updateSettings, undoLastAction, undoLabel, settings,
    isGameOver, gameOverReason, actPhase, actEvents, activeEventLog,
    weather, spyReveal, spySabotage, spyAssassinate,
    missionProgress, newlyCompletedMissions,
  } = useGameStore();
  const undoLabelLive = useGameStore(s => s.undoLabel);

  // ── Screen shake (Reanimated — UI thread) ────────────────────────────────
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { translateY: shakeY.value }],
  }));

  const t = useTranslation();
  const audio = useAudio();
  const [showEconomy, setShowEconomy] = React.useState(false);
  const [combatEffects, setCombatEffects] = React.useState([]);


  // Fire a combat visual effect
  // Mission completion toast
  React.useEffect(() => {
    if (newlyCompletedMissions?.length > 0) {
      const lang = useGameStore.getState().settings?.language || 'en';
      const m = newlyCompletedMissions[0];
      setMissionToast(lang === 'ru' ? m.titleRu : m.title);
      const timer = setTimeout(() => setMissionToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [newlyCompletedMissions]);



  const triggerShake = React.useCallback((intensity = 6) => {
    shakeX.value = withSequence(
      withTiming( intensity,       { duration: 40 }),
      withTiming(-intensity,       { duration: 40 }),
      withTiming( intensity * 0.6, { duration: 35 }),
      withTiming(-intensity * 0.6, { duration: 35 }),
      withTiming(0,                { duration: 30 })
    );
    shakeY.value = withSequence(
      withTiming(-intensity * 0.5, { duration: 40 }),
      withTiming( intensity * 0.5, { duration: 40 }),
      withTiming(-intensity * 0.3, { duration: 35 }),
      withTiming(0,                { duration: 35 })
    );
  }, []);

  const fireEffect = React.useCallback((type, regionId) => {
    const id = Date.now() + Math.random();
    const duration = type === 'nuke' ? 1400 : type === 'orbital' ? 1000 : 800;
    setCombatEffects(prev => [...prev.slice(-7), { type, regionId, id }]);
    setTimeout(() => setCombatEffects(prev => prev.filter(e => e.id !== id)), duration);
    // Screen shake — stronger for nukes
    if (type === 'nuke')    triggerShake(18);
    else if (type === 'orbital') triggerShake(10);
    else if (type === 'explosion' || type === 'defense') triggerShake(5);
  }, [triggerShake]);
  const [showDiplomacy, setShowDiplomacy] = React.useState(false);
  const [showResearch, setShowResearch] = React.useState(false);
  const [showNukeModal, setShowNukeModal] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState(null);
  const [showTutorial, setShowTutorial] = React.useState(false);
  // Show tutorial on first-ever game start
  const tutorialShownRef = React.useRef(false);
  React.useEffect(() => {
    if (uiMode === 'GAME' && !tutorialShownRef.current) {
      const alreadySeen = settings?.tutorialSeen;
      if (!alreadySeen) {
        setTimeout(() => setShowTutorial(true), 800);
        tutorialShownRef.current = true;
      }
    }
  }, [uiMode]);

  const dismissTutorial = () => {
    setShowTutorial(false);
    updateSettings({ tutorialSeen: true });
  };
  // Fire visual effects when attacks/nukes happen — watch gameLog length
  const gameLogLen = useGameStore(s => (s.gameLog || []).length);
  const gameLogRef = React.useRef(0);
  const regionsRef = React.useRef({});
  React.useEffect(() => { regionsRef.current = regions || {}; }, [regions]);

  React.useEffect(() => {
    if (gameLogLen <= gameLogRef.current) { gameLogRef.current = gameLogLen; return; }
    gameLogRef.current = gameLogLen;
    const log = useGameStore.getState().gameLog || [];
    const latest = log[0] || '';
    if (!selectedRegionId) return;
    if (latest.includes('☢') || latest.toLowerCase().includes('nuke') || latest.toLowerCase().includes('nuclear')) {
      fireEffect('nuke', selectedRegionId);
      audio.play('nuke');
    } else if (latest.includes('⚡') || latest.toLowerCase().includes('orbital')) {
      fireEffect('orbital', selectedRegionId);
      audio.play('orbital');
    } else if (latest.toLowerCase().includes('captur') || latest.toLowerCase().includes('conquer') || latest.includes('→')) {
      fireEffect('explosion', selectedRegionId);
      fireEffect('capture', selectedRegionId);
      audio.play('capture');
    } else if (latest.toLowerCase().includes('repel') || latest.toLowerCase().includes('defend') || latest.toLowerCase().includes('held')) {
      fireEffect('defense', selectedRegionId);
      audio.play('defense');
    } else if (latest.toLowerCase().includes('attack') || latest.toLowerCase().includes('assault')) {
      fireEffect('explosion', selectedRegionId);
      audio.play('attack');
    }
  }, [gameLogLen]);

 // { type, label, icon, detail, onConfirm }
  const [showSpyMenu, setShowSpyMenu] = React.useState(false);
  const [showCampaign, setShowCampaign] = React.useState(false);
  const [missionToast, setMissionToast] = React.useState(null);
  const [showStats, setShowStats] = React.useState(false);
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const [showTrade, setShowTrade] = React.useState(false);
  const [achievementToast, setAchievementToast] = React.useState(null);
  const [pendingCutscene, setPendingCutscene] = React.useState(null); // 2 | 3
  const [endTurnLoading, setEndTurnLoading] = React.useState(false);
  const loadingAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => { checkHasSave(); }, [checkHasSave]);

  // Watch for new achievements to toast
  const achievements = useGameStore(s => s.achievements || {});
  const prevAchCount = React.useRef(0);
  React.useEffect(() => {
    const newCount = Object.keys(achievements).length;
    if (newCount > prevAchCount.current) {
      const newId = Object.entries(achievements)
        .find(([, v]) => !v.seen)?.[0];
      if (newId) {
        const { ACHIEVEMENTS } = require('./src/logic/achievements');
        const ach = ACHIEVEMENTS.find(a => a.id === newId);
        if (ach) {
          const lang = useGameStore.getState().settings?.language || 'en';
          setAchievementToast(lang === 'ru' ? (ach.titleRu || ach.title) : ach.title);
          setTimeout(() => setAchievementToast(null), 4000);
        }
      }
    }
    prevAchCount.current = newCount;
  }, [achievements]);

  // Detect act transitions and trigger cutscene
  const prevActPhase = React.useRef(1);
  React.useEffect(() => {
    if (actPhase > prevActPhase.current && actPhase >= 2) {
      setPendingCutscene(actPhase);
    }
    prevActPhase.current = actPhase;
  }, [actPhase]);

  // Loading spinner pulse animation
  React.useEffect(() => {
    if (endTurnLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(loadingAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      loadingAnim.stopAnimation();
      loadingAnim.setValue(0);
    }
  }, [endTurnLoading]);

  if (uiMode === 'SPLASH') return <ScreenTransition type='fade' duration={400}><SplashScreen /></ScreenTransition>;
  if (uiMode === 'INTRO') return <ScreenTransition type='fade' duration={600}><IntroScreen /></ScreenTransition>;
  if (uiMode === 'MENU') return <ScreenTransition type='slideUp' duration={350}><MainMenuView /></ScreenTransition>;
  if (uiMode === 'FACTION') return <ScreenTransition type='slideUp' duration={300}><FactionSelectView onStart={startGame} /></ScreenTransition>;
  if (uiMode === 'SETTINGS') return <ScreenTransition type='slideUp' duration={300}><SettingsView /></ScreenTransition>;

  // ── GAME OVER SCREEN ─────────────────────────────────────────────────────────
  if (isGameOver) {
    const isVictory = gameOverReason === 'victory';
    const titles = { // translated below
      victory:  '🏆 WORLD DOMINATION',
      military: '💀 MILITARY DEFEAT',
      collapse: '🔥 SYSTEMATIC COLLAPSE',
      nuclear:  '☢ NUCLEAR ANNIHILATION',
    };
    const subtitles = {
      victory:  `${FD[playerFaction]?.name || playerFaction} conquers the globe in ${turn} turns.`,
      military: t('gameover.sub.military'),
      collapse: t('gameover.sub.collapse'),
      nuclear:  t('gameover.sub.nuclear'),
    };
    const colors = { victory: '#c8a35c', military: '#e74c3c', collapse: '#e67e22', nuclear: '#9b59b6' };
    const accentColor = colors[gameOverReason] || '#e74c3c';
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#05080a', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: accentColor, fontSize: 28, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 12 }}>
            {titles[gameOverReason] || t('gameover.default')}
          </Text>
          <Text style={{ color: '#a0b8c8', fontSize: 13, textAlign: 'center', letterSpacing: 1, marginBottom: 32, lineHeight: 20 }}>
            {subtitles[gameOverReason]}
          </Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#2c3a44', padding: 16, width: '100%', marginBottom: 24 }}>
            <Text style={{ color: '#5f727d', fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>{t('gameover.summary')}</Text>
            <Text style={{ color: '#c8d8e8', fontSize: 12, marginBottom: 4 }}>{t('gameover.turnsSurvived')} <Text style={{ color: '#fff', fontWeight: '700' }}>{turn}</Text></Text>
            <Text style={{ color: '#c8d8e8', fontSize: 12, marginBottom: 4 }}>{t('gameover.actReached')} <Text style={{ color: accentColor, fontWeight: '700' }}>{t('gameover.actLabel', { n: actPhase })}</Text></Text>
            <Text style={{ color: '#c8d8e8', fontSize: 12 }}>{t('gameover.regionsHeld')} <Text style={{ color: '#fff', fontWeight: '700' }}>{Object.values(regions).filter(r => r.faction === playerFaction).length}</Text></Text>
          </View>
          <View style={{ width: '100%', marginBottom: 32 }}>
            {(actEvents || []).slice(-3).map((ev, i) => (
              <Text key={i} style={{ color: '#5a8a9a', fontSize: 10, letterSpacing: 1, marginBottom: 4, textAlign: 'center' }}>{ev}</Text>
            ))}
          </View>
          <TouchableOpacity
            style={{ backgroundColor: accentColor, paddingHorizontal: 40, paddingVertical: 14, marginBottom: 12 }}
            onPress={() => useGameStore.setState({ uiMode: 'MENU', isGameOver: false, gameOverReason: null })}
          >
            <Text style={{ color: '#05080a', fontWeight: '900', fontSize: 14, letterSpacing: 3 }}>{t('gameover.mainMenu')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ borderWidth: 1, borderColor: '#2ecc71', paddingHorizontal: 40, paddingVertical: 14, marginBottom: 12 }}
            onPress={() => setShowStats(true)}
          >
            <Text style={{ color: '#2ecc71', fontWeight: '900', fontSize: 14, letterSpacing: 3 }}>
              📊 STATISTICS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ borderWidth: 1, borderColor: '#f0a030', paddingHorizontal: 40, paddingVertical: 14, marginBottom: 12 }}
            onPress={() => setShowLeaderboard(true)}
          >
            <Text style={{ color: '#f0a030', fontWeight: '900', fontSize: 14, letterSpacing: 3 }}>
              🏆 LEADERBOARD
            </Text>
          </TouchableOpacity>
          {showLeaderboard && <LeaderboardScreen onClose={() => setShowLeaderboard(false)} />}
          <TouchableOpacity
            style={{ borderWidth: 1, borderColor: '#2c3a44', paddingHorizontal: 40, paddingVertical: 14 }}
            onPress={() => useGameStore.getState().startGame(playerFaction)}
          >
            <Text style={{ color: '#5f727d', fontWeight: '900', fontSize: 14, letterSpacing: 3 }}>{t('gameover.newCampaign')}</Text>
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    );
  }

  const currentFD = FD[playerFaction];
  const currentFS = factions[playerFaction] || { funds: 0, oil: 0, supplies: 0, stability: 100, nukes: 0, techPoints: 0, unlockedTech: [] };
  const selectedRegion = selectedRegionId ? regions[selectedRegionId] : null;
  const mapActive = !showEconomy && !showDiplomacy && !showResearch;

  // Tech mods for player — drives what special actions are available
  const playerMods = computeTechModifiers(currentFS.unlockedTech || []);
  const canNuke = (currentFS.nukes || 0) > 0 && !nukeUsedThisTurn;
  const canOrbital = (playerMods.orbitalStrikeCharges || 0) > 0;
  const canBlackout = (playerMods.blackoutCharges || 0) > 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      {/* Black background behind the frame */}
      <View style={styles.screenRoot}>

        {/* LAYER 1: MAP BACKGROUND */}
        <ReAnimatedView style={[styles.mapLayer, shakeStyle]}>
          <GameMap />
        </ReAnimatedView>

        {/* LAYER 1b: COMBAT EFFECTS OVERLAY */}
        <CombatEffects effects={combatEffects} />

        {/* LAYER 2: SKIA OVERLAY (borders, hanging frames) */}
        <GameFrame />

        {/* LAYER 3: UI ELEMENTS */}
        <View style={styles.uiLayer} pointerEvents="box-none">

          {/* TOP BAR */}
          <View style={styles.topResourceBar}>

            <View style={styles.resourcesContainer}>
              <Tooltip text={t('tooltip.oil')} style={styles.resourceItem}>
                <Droplet size={13} color="#ffd700" />
                <AnimatedNumber value={currentFS.oil} style={styles.resourceText} suffix={" " + t('hud.oil')} />
              </Tooltip>
              <Tooltip text={t('tooltip.steel')} style={styles.resourceItem}>
                <Layers size={13} color="#bdc3c7" />
                <AnimatedNumber value={currentFS.supplies} style={styles.resourceText} suffix={" " + t('hud.steel')} />
              </Tooltip>
              <Tooltip text={t('tooltip.funds')} style={styles.resourceItem}>
                <Banknote size={13} color="#2ecc71" />
                <AnimatedNumber value={currentFS.funds} style={styles.resourceText} prefix="$" suffix={" " + t('hud.money')} />
              </Tooltip>
              <Tooltip text={t('tooltip.stability')} style={styles.resourceItem}>
                <Zap size={13} color="#3498db" />
                <AnimatedNumber value={currentFS?.stability || 0} style={styles.resourceText} suffix={"% " + t('hud.energy')} increaseColor="#2ecc71" decreaseColor="#e74c3c" />
              </Tooltip>
              <TouchableOpacity
                style={[styles.resourceItem, styles.techPointsItem, showResearch && styles.techPointsActive]}
                onPress={() => { setShowResearch(!showResearch); setShowEconomy(false); setShowDiplomacy(false); }}
              >
                <Text style={styles.techPointsIcon}>⚗</Text>
                <Text style={[styles.techPointsText, (currentFS?.techPoints || 0) > 0 && styles.techPointsAvailable]}>
                  {currentFS?.techPoints || 0} {t('hud.tp')}
                </Text>
              </TouchableOpacity>
              {(currentFS.nukes || 0) > 0 && (
                <View style={[styles.resourceItem, styles.nukesItem, nukeUsedThisTurn && styles.nukesUsed]}>
                  <Text style={styles.nukesIcon}>☢</Text>
                  <Text style={styles.nukesText}>{currentFS.nukes}</Text>
                </View>
              )}
            </View>
            {/* Weather indicator */}
            {(() => {
              const wData = { clear:'☀️', rain:'🌧', storm:'⛈', snow:'❄️', heatwave:'🌡', fog:'🌫' };
              const wLabel = { clear:t('weather.clear'), rain:t('weather.rain'), storm:t('weather.storm'), snow:t('weather.snow'), heatwave:t('weather.heatwave'), fog:t('weather.fog') };
              return (
                <View style={{ position: 'absolute', left: 8, bottom: -20, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 12 }}>{wData[weather] || '☀️'}</Text>
                  <Text style={{ color: '#5f727d', fontSize: 8, letterSpacing: 1 }}>{wLabel[weather] || t('weather.clear')}</Text>
                </View>
              );
            })()}
            {actPhase > 1 && (
              <View style={{
                position: 'absolute', left: 0, right: 0, bottom: -22,
                alignItems: 'center', zIndex: 20, pointerEvents: 'none',
              }}>
                <View style={{
                  backgroundColor: actPhase === 3 ? 'rgba(155,89,182,0.35)' : 'rgba(231,76,60,0.25)',
                  borderWidth: 1, borderColor: actPhase === 3 ? '#9b59b6' : '#e74c3c',
                  paddingHorizontal: 14, paddingVertical: 2,
                }}>
                  <Text style={{ color: actPhase === 3 ? '#be8ef5' : '#e74c3c', fontSize: 9, fontWeight: '900', letterSpacing: 2 }}>
                    {actPhase === 2 ? '⚔ ACT II · GLOBAL WAR' : '☢ ACT III · ESCALATION'}
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.menuIcon} onPress={() => useGameStore.setState({ uiMode: 'MENU' })}>
              <Menu color="#a0c8e0" size={20} />
            </TouchableOpacity>
          </View>

          {/* PANELS CONTAINER (occupies map area) */}
          <View style={styles.panelsContainer} pointerEvents="box-none">

            {/* TACTICAL BRIEFING — top left */}
            <View style={styles.briefingPanel} pointerEvents="box-none">
              <View style={styles.briefingHeader}>
                <Text style={styles.briefingTitle}>{t('briefing.title')}</Text>
              </View>
              <View style={styles.briefingList}>
                {(gameLog || []).slice(0, 4).map((log, i) => (
                  <View key={i} style={styles.logEntry}>
                    <Text style={styles.logEntryTitle}>{t('briefing.missionReport')}</Text>
                    <Text style={[styles.logText, i === 0 && { color: '#fff', fontWeight: 'bold' }]}>{log}</Text>
                  </View>
                ))}
              </View>
              {/* AI Intelligence read-out — shows what the AI has learned */}
              <View style={styles.aiIntelBlock}>
                {['EAST','CHINA'].filter(f => f !== playerFaction).map(aiKey => {
                  const mem = aiMemory?.[aiKey] || {};
                  const doctrine = mem.playerDoctrine || '—';
                  const lossCount = Object.values(mem.recentLosses || {}).reduce((a,b) => a+b, 0);
                  const fcolor = FD[aiKey]?.color || '#fff';
                  return (
                    <View key={aiKey} style={styles.aiIntelRow}>
                      <Text style={[styles.aiIntelFaction, { color: fcolor }]}>{FD[aiKey].short}</Text>
                      <Text style={styles.aiIntelLabel}>{t('intel.detected')}: </Text>
                      <Text style={[styles.aiIntelValue, { color: '#f39c12' }]}>{doctrine.replace('-',' ')}</Text>
                      {lossCount > 0.5 && (
                        <Text style={styles.aiIntelCaution}> ⚠{Math.ceil(lossCount)}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* TERRAIN INTEL — bottom left, styled */}
            <View style={styles.intelPanel} pointerEvents="none">
              <View style={styles.intelHeader}>
                <View style={styles.intelHeaderAccent} />
                <Text style={styles.intelTitle}>
                  {selectedRegionId ? selectedRegionId.replace(/_/g,' ').toUpperCase() : t('hud.regionIntel')}
                </Text>
              </View>
              {selectedRegion ? (
                <View style={styles.intelBody}>
                  <View style={styles.intelFactionRow}>
                    <View style={[styles.intelFactionDot, { backgroundColor: FD[selectedRegion.faction]?.color || '#2a3d50' }]} />
                    <Text style={[styles.intelFactionName, { color: FD[selectedRegion.faction]?.color || '#aaa' }]}>
                      {FD[selectedRegion.faction]?.short || 'NEU'}
                    </Text>
                    {(() => { const ter = getTerrain(selectedRegionId); return <Text style={{ color: '#4a7a9b', fontSize: 8, fontWeight: '700', letterSpacing: 1, marginLeft: 6 }}>{ter.emoji} {ter.label.toUpperCase()}</Text>; })()}
                    {selectedRegion.isolated && <Text style={styles.intelWarning}> ⚠ISO</Text>}
                  </View>
                  <View style={styles.intelDivider} />
                  {[
                    { label: t('hud.eco'), raw: selectedRegion.economy || 0, max: 100, color: '#f39c12' },
                    { label: t('hud.ind'), raw: selectedRegion.industry || 0, max: 25, color: '#3498db' },
                    { label: t('hud.stb'), raw: selectedRegion.stability || 0, max: 100, color: (selectedRegion.stability || 0) > 60 ? '#2ecc71' : '#e74c3c' },
                  ].map(row => (
                    <View key={row.label} style={styles.intelStatRow}>
                      <Text style={styles.intelStatLabel}>{row.label}</Text>
                      <View style={styles.intelBarBg}>
                        <View style={[styles.intelBarFill, {
                          width: `${Math.min(100, Math.round(row.raw / row.max * 100))}%`,
                          backgroundColor: row.color
                        }]} />
                      </View>
                      <Text style={[styles.intelStatVal, { color: row.color }]}>{row.raw}</Text>
                    </View>
                  ))}
                  <View style={styles.intelDivider} />
                  <View style={styles.intelUnitsRow}>
                    <View style={styles.intelUnitChip}><AnimatedNumber value={selectedRegion.infantry || 0} style={styles.intelUnitText} prefix={t('unit.infantry') + ' '} /></View>
                    <View style={styles.intelUnitChip}><AnimatedNumber value={selectedRegion.armor || 0} style={styles.intelUnitText} prefix={t('unit.armor') + ' '} /></View>
                    <View style={styles.intelUnitChip}><AnimatedNumber value={selectedRegion.air || 0} style={styles.intelUnitText} prefix={t('unit.air') + ' '} /></View>
                  </View>
                </View>
              ) : (
                <View style={styles.intelBody}>
                  <Text style={styles.intelEmpty}>{t('intel.tapRegion')}</Text>
                </View>
              )}
            </View>

            {/* SELECTION CARD — bottom right, above nav */}
            <View style={styles.selectionOverlay} pointerEvents="box-none">
              {selectedRegionId && (
                <View style={styles.selectionCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.selectionName}>{selectedRegionId.toUpperCase()}</Text>
                    {selectedRegion?.isolated
                      ? <Text style={{ color: '#e74c3c', fontSize: 10, marginLeft: 4, fontWeight: 'bold' }}>[{t('card.isolated')}]</Text>
                      : null}
                  </View>
                  <View style={styles.selectionStats}>
                    <Text style={[styles.selectionFaction, { color: FD[selectedRegion?.faction]?.color }]}>
                      {FD[selectedRegion?.faction]?.short}
                    </Text>
                    <View style={styles.selectionUnitBox}>
                      <Text style={styles.selectionTroops}>{t('card.infantry')}: {selectedRegion?.infantry || 0}</Text>
                      <Text style={styles.selectionTroops}>{t('card.armor')}: {selectedRegion?.armor || 0}</Text>
                      <Text style={styles.selectionTroops}>{t('card.air')}: {selectedRegion?.air || 0}</Text>
                    </View>
                  </View>
                  {/* Special actions vs enemy regions */}
                  {/* Spy action button */}
              {selectedRegion && (
                <TouchableOpacity
                  style={{ marginBottom: 4, paddingVertical: 6, paddingHorizontal: 10,
                    borderWidth: 1, borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142,68,173,0.15)' }}
                  onPress={() => setShowSpyMenu(!showSpyMenu)}
                >
                  <Text style={{ color: '#be8ef5', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }}>
                    {t('spy.title')} {showSpyMenu ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
              )}
              {showSpyMenu && selectedRegion && (
                <View style={{ borderWidth: 1, borderColor: '#2c3a44', padding: 8, marginBottom: 4, gap: 4 }}>
                  {selectedRegion.faction !== playerFaction && (
                    <>
                      <TouchableOpacity
                        style={{ paddingVertical: 5, paddingHorizontal: 8, backgroundColor: 'rgba(52,152,219,0.2)', borderWidth: 1, borderColor: '#3498db' }}
                        onPress={() => { spyReveal(selectedRegionId); setShowSpyMenu(false); audio.play('alert'); }}
                      >
                        <Text style={{ color: '#3498db', fontSize: 10, letterSpacing: 1 }}>{t('spy.reveal')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ paddingVertical: 5, paddingHorizontal: 8, backgroundColor: 'rgba(231,76,60,0.2)', borderWidth: 1, borderColor: '#e74c3c' }}
                        onPress={() => { spySabotage(selectedRegionId); setShowSpyMenu(false); audio.play('attack'); }}
                      >
                        <Text style={{ color: '#e74c3c', fontSize: 10, letterSpacing: 1 }}>{t('spy.sabotage')}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedRegion.faction !== playerFaction && selectedRegion.faction !== 'NEUTRAL' && (
                    <TouchableOpacity
                      style={{ paddingVertical: 5, paddingHorizontal: 8, backgroundColor: 'rgba(155,89,182,0.2)', borderWidth: 1, borderColor: '#9b59b6' }}
                      onPress={() => { spyAssassinate(selectedRegion.faction); setShowSpyMenu(false); audio.play('crisis'); }}
                    >
                      <Text style={{ color: '#9b59b6', fontSize: 10, letterSpacing: 1 }}>{t('spy.assassinate')}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setShowSpyMenu(false)}>
                    <Text style={{ color: '#5f727d', fontSize: 9, textAlign: 'center', marginTop: 2 }}>{t('card.close')}</Text>
                  </TouchableOpacity>
                </View>
              )}
              {selectedRegion?.faction !== playerFaction && selectedRegion?.faction !== 'NEUTRAL' && (
                    <View style={styles.specialActionsBar}>
                      {/* NUCLEAR — ultimate, requires stockpile + once per turn */}
                      <TouchableOpacity
                        style={[styles.specialBtn, styles.specialBtnNuke, (!canNuke) && styles.specialBtnDisabled]}
                        onPress={() => canNuke && setShowNukeModal(true)}
                        disabled={!canNuke}
                      >
                        <Text style={styles.specialBtnIcon}>☢</Text>
                        <Text style={[styles.specialBtnLabel, !canNuke && { color: '#444' }]}>
                          {t('action.nuke')}{'\n'}
                          <Text style={styles.specialBtnSub}>{currentFS.nukes}▸</Text>
                        </Text>
                      </TouchableOpacity>

                      {/* ORBITAL STRIKE — Space T3 */}
                      <TouchableOpacity
                        style={[styles.specialBtn, styles.specialBtnOrbital, !canOrbital && styles.specialBtnDisabled]}
                        onPress={() => {
                          if (!canOrbital) return;
                          setConfirmAction({
                            type: 'orbital', icon: '⚡',
                            label: t('action.orbital'),
                            detail: t('confirm.orbital.detail').replace('{region}', (selectedRegionId||'').replace(/_/g,' ').toUpperCase()),
                            onConfirm: () => { orbitalStrike(selectedRegionId); setConfirmAction(null); },
                          });
                        }}
                        disabled={!canOrbital}
                      >
                        <Text style={styles.specialBtnIcon}>⚡</Text>
                        <Text style={[styles.specialBtnLabel, !canOrbital && { color: '#444' }]}>
                          {t('action.orbital')}{'\n'}
                          <Text style={styles.specialBtnSub}>{canOrbital ? t('hud.ready') : t('hud.locked')}</Text>
                        </Text>
                      </TouchableOpacity>

                      {/* E-WAR BLACKOUT — EW T3 */}
                      <TouchableOpacity
                        style={[styles.specialBtn, styles.specialBtnBlackout, !canBlackout && styles.specialBtnDisabled]}
                        onPress={() => {
                          if (!canBlackout) return;
                          setConfirmAction({
                            type: 'blackout', icon: '📡',
                            label: t('action.blackout'),
                            detail: t('confirm.blackout.detail').replace('{region}', (selectedRegionId||'').replace(/_/g,' ').toUpperCase()),
                            onConfirm: () => { blackoutRegion(selectedRegionId); setConfirmAction(null); },
                          });
                        }}
                        disabled={!canBlackout}
                      >
                        <Text style={styles.specialBtnIcon}>📡</Text>
                        <Text style={[styles.specialBtnLabel, !canBlackout && { color: '#444' }]}>
                          {t('action.blackout')}{'\n'}
                          <Text style={styles.specialBtnSub}>{canBlackout ? t('hud.ready') : t('hud.locked')}</Text>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* BOTTOM NAV — real styled tabs */}
          <View style={styles.bottomNavBar}>
            {[
              { label: t('nav.map'),      icon: '🗺',  onPress: () => { setShowEconomy(false); setShowDiplomacy(false); setShowResearch(false); }, active: mapActive },
              { label: t('nav.deploy'),   icon: '⚙',  onPress: () => { setShowEconomy(!showEconomy); setShowDiplomacy(false); setShowResearch(false); }, active: showEconomy },
              { label: t('nav.research'), icon: '⚗',  onPress: () => { setShowResearch(!showResearch); setShowEconomy(false); setShowDiplomacy(false); }, active: showResearch },
              { label: t('nav.alliance'), icon: '🤝',  onPress: () => { setShowDiplomacy(!showDiplomacy); setShowEconomy(false); setShowResearch(false); setShowTrade(false); }, active: showDiplomacy },
              { label: '📦 TRADE',       icon: '📦',  onPress: () => { setShowTrade(!showTrade); setShowDiplomacy(false); setShowEconomy(false); setShowResearch(false); }, active: showTrade },
              { label: '🏆 RANK',       icon: '🏆',  onPress: () => setShowLeaderboard(!showLeaderboard), active: showLeaderboard },
              { label: t('nav.endTurn'), icon: '▶',  onPress: async () => {
                  if (endTurnLoading) return;
                  setEndTurnLoading(true);
                  audio.play('endTurn');
                  await useGameStore.getState().endTurn();
                  setEndTurnLoading(false);
               }, active: false, danger: true },
            ].map((tab, i) => (
              <TouchableOpacity
                key={i}
                onPress={tab.onPress}
                style={[styles.navTab, tab.active && styles.navTabActive, tab.danger && styles.navTabDanger]}
              >
                <Text style={styles.navTabIcon}>{tab.icon}</Text>
                <Text style={[styles.navTabLabel, tab.active && styles.navTabLabelActive, tab.danger && styles.navTabLabelDanger]}>
                  {tab.label}
                </Text>
                {tab.active && <View style={styles.navTabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>

        </View>

        {/* ACCENT DOTS overlaying everything */}
        <View style={[styles.accentDot, styles.accentDotLeft]} />
        <View style={[styles.accentDot, styles.accentDotRight]} />

      </View>

      {showEconomy && <EconomyPanel onClose={() => setShowEconomy(false)} />}
      {showDiplomacy && <DiplomacyPanel onClose={() => setShowDiplomacy(false)} />}
      {showResearch && <ResearchPanel onClose={() => setShowResearch(false)} />}

      {/* NUCLEAR LAUNCH CONFIRMATION MODAL */}
      {showNukeModal && selectedRegionId && (
        <View style={styles.nukeOverlay}>
          <View style={styles.nukeModal}>
            <Text style={styles.nukeModalWarning}>⚠ NUCLEAR AUTHORIZATION ⚠</Text>
            <Text style={styles.nukeModalTitle}>☢ STRIKE: {selectedRegionId.replace(/_/g,' ').toUpperCase()}</Text>
            <View style={styles.nukeModalInfo}>
              <Text style={styles.nukeModalDetail}>Warheads remaining: {currentFS.nukes}</Text>
              {playerMods.tacticalNukes && <Text style={styles.nukeModalTech}>✓ Tactical Warheads — region will be captured</Text>}
              {(playerMods.nukeDamageMult || 1) >= 1.5 && <Text style={styles.nukeModalTech}>✓ MIRV Arsenal — total annihilation + economy damage</Text>}
              <Text style={styles.nukeModalWarn}>Global stability −8 for all factions</Text>
              <Text style={styles.nukeModalWarn}>{t('nuke.oneUse')}</Text>
            </View>
            <View style={styles.nukeModalBtns}>
              <TouchableOpacity style={styles.nukeCancelBtn} onPress={() => setShowNukeModal(false)}>
                <Text style={styles.nukeCancelTxt}>{t('nuke.abort')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nukeConfirmBtn}
                onPress={() => { launchNuke(selectedRegionId); setShowNukeModal(false); }}
              >
                <Text style={styles.nukeConfirmTxt}>☢ LAUNCH</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

        {/* ── Act Cutscene ─────────────────────────────────── */}
        {pendingCutscene && (
          <ActCutscene
            act={pendingCutscene}
            onDismiss={() => setPendingCutscene(null)}
          />
        )}

        {/* ── Stats Screen ──────────────────────────────────── */}
        {showStats && (
          <StatsScreen onClose={() => setShowStats(false)} />
        )}

        {/* ── Leaderboard + Achievements ────────────────────────── */}
        {showLeaderboard && (
          <LeaderboardScreen onClose={() => setShowLeaderboard(false)} />
        )}

        {/* ── Trade Panel ───────────────────────────────────────── */}
        {showTrade && (
          <TradePanel onClose={() => setShowTrade(false)} />
        )}

        {/* ── Achievement toast ─────────────────────────────────── */}
        {achievementToast && (
          <View style={{
            position: 'absolute', top: 80, left: 20, right: 20,
            backgroundColor: 'rgba(240,160,48,0.97)',
            padding: 12, zIndex: 999,
            flexDirection: 'row', alignItems: 'center', gap: 8,
          }}>
            <Text style={{ fontSize: 20 }}>🏅</Text>
            <View>
              <Text style={{ color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 2 }}>{t('lb.ach.unlocked')}</Text>
              <Text style={{ color: '#000', fontSize: 13, fontWeight: '700' }}>{achievementToast}</Text>
            </View>
          </View>
        )}

        {/* ── Campaign Panel ────────────────────────────────── */}
        {showCampaign && (
          <CampaignPanel onClose={() => setShowCampaign(false)} />
        )}

        {/* ── Mission toast ─────────────────────────────────── */}
        {missionToast && (
          <View style={{
            position: 'absolute', top: 80, left: 20, right: 20,
            backgroundColor: 'rgba(240,160,48,0.95)',
            padding: 12, zIndex: 999,
            flexDirection: 'row', alignItems: 'center', gap: 8,
          }}>
            <Text style={{ fontSize: 16 }}>🎯</Text>
            <View>
              <Text style={{ color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 2 }}>{t('campaign.missionComplete')}</Text>
              <Text style={{ color: '#000', fontSize: 12, fontWeight: '700' }}>{missionToast}</Text>
            </View>
          </View>
        )}

        {/* ── End Turn loading ──────────────────────────────── */}
        {endTurnLoading && (
          <Animated.View style={{
            position: 'absolute', bottom: 80, alignSelf: 'center',
            opacity: loadingAnim,
            backgroundColor: 'rgba(6,14,26,0.95)',
            borderWidth: 1, borderColor: '#3a9eff',
            paddingHorizontal: 18, paddingVertical: 8,
            flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 100,
          }}>
            <Text style={{ color: '#3a9eff', fontSize: 9, letterSpacing: 2, fontWeight: '900' }}>
              PROCESSING...
            </Text>
          </Animated.View>
        )}


        {/* ── TUTORIAL OVERLAY ─────────────────────────────────────── */}
        {showTutorial && uiMode === 'GAME' && (
          <TutorialOverlay onDismiss={dismissTutorial} />
        )}

        {/* ── CONFIRM ACTION MODAL ──────────────────────────────────── */}
        {confirmAction && (
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmIcon}>{confirmAction.icon}</Text>
              <Text style={styles.confirmTitle}>{confirmAction.label}</Text>
              <Text style={styles.confirmDetail}>{confirmAction.detail}</Text>
              <View style={styles.confirmBtns}>
                <TouchableOpacity style={styles.confirmCancelBtn} onPress={() => setConfirmAction(null)}>
                  <Text style={styles.confirmCancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmOkBtn,
                    confirmAction.type === 'orbital'  && { backgroundColor: '#2980b9' },
                    confirmAction.type === 'blackout' && { backgroundColor: '#8e44ad' },
                  ]}
                  onPress={confirmAction.onConfirm}
                >
                  <Text style={styles.confirmOkText}>{t('common.confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}


        {/* ── UNDO LAST ACTION ─────────────────────────────────────── */}
        {undoLabelLive && uiMode === 'GAME' && (
          <View style={styles.undoBar}>
            <Text style={styles.undoLabel}>↩ {t('undo.label')} ({t('undo.' + undoLabelLive)})</Text>
            <TouchableOpacity style={styles.undoBtn} onPress={() => { undoLastAction(); }}>
              <Text style={styles.undoBtnText}>{t('undo.action')}</Text>
            </TouchableOpacity>
          </View>
        )}

    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({

  screenRoot: {
    flex: 1,
    backgroundColor: '#000',
  },

  mapLayer: {
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 0,   // Spread map across whole width to kill the black edge
    right: 0,  // Spread map across whole width to kill the black edge
    backgroundColor: 'transparent', // Let screenRoot #000 show if map fails
    overflow: 'hidden',
    zIndex: 1,
  },
  uiLayer: {
    position: 'absolute',
    top: 10, bottom: 10, left: 10, right: 10,
    zIndex: 100,
    justifyContent: 'space-between',
  },
  panelsContainer: {
    flex: 1,
    position: 'relative',
  },

  // Red glowing accent on left/right sides
  accentDot: {
    position: 'absolute',
    width: 8,
    height: 30,
    backgroundColor: '#cc2200',
    borderRadius: 2,
    zIndex: 300,
    shadowColor: '#ff3300',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    top: '45%',
  },
  accentDotLeft: { left: 6 },
  accentDotRight: { right: 6 },

  topResourceBar: {
    flexDirection: 'row',
    height: 42,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
    paddingHorizontal: 20,
  },

  resourcesContainer: {
    flexDirection: 'row',
    gap: 28,
    alignItems: 'center',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resourceText: {
    color: '#9ab8c8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  techPointsItem: {
    borderWidth: 1,
    borderColor: 'rgba(52,152,219,0.3)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(52,152,219,0.08)',
  },
  techPointsActive: {
    borderColor: '#3498db',
    backgroundColor: 'rgba(52,152,219,0.2)',
  },
  techPointsIcon: { fontSize: 12 },
  techPointsText: {
    color: '#3a5878',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  techPointsAvailable: { color: '#3498db' },
  menuIcon: {
    position: 'absolute',
    right: 16,
  },



  // TACTICAL BRIEFING — matches HTML .tactical-briefing exactly
  briefingPanel: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 156,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: '#3f515d',
    borderTopWidth: 3,
    borderTopColor: '#5f727d',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  briefingHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  briefingTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  briefingList: {
    padding: 10,
  },
  logEntry: {
    padding: 0,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    marginBottom: 6,
  },
  logEntryTitle: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 1,
    letterSpacing: 0.5,
  },
  logText: {
    color: '#a0aec0',
    fontSize: 10,
    lineHeight: 14,
  },
  aiIntelBlock: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: 6,
    paddingTop: 6,
    gap: 3,
  },
  aiIntelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  aiIntelFaction: { fontSize: 9, fontWeight: '900', width: 34 },
  aiIntelLabel:   { color: '#2a4050', fontSize: 9 },
  aiIntelValue:   { fontSize: 9, fontWeight: '700' },
  aiIntelCaution: { color: '#e74c3c', fontSize: 9, fontWeight: '900' },

  // TERRAIN INTEL panel
  intelPanel: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    width: 160,
    backgroundColor: 'rgba(6,14,26,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(52,152,219,0.25)',
    borderLeftWidth: 0,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  intelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52,152,219,0.2)',
  },
  intelHeaderAccent: {
    width: 3,
    height: 12,
    backgroundColor: '#3498db',
    marginRight: 7,
    borderRadius: 1,
  },
  intelTitle: {
    color: '#7fb3d3',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  intelBody: {
    padding: 10,
  },
  intelFactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  intelFactionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  intelFactionName: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  intelWarning: {
    color: '#e74c3c',
    fontSize: 8,
    fontWeight: '900',
    marginLeft: 4,
  },
  intelDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 5,
  },
  intelStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  intelStatLabel: {
    color: '#4a6278',
    fontSize: 8,
    fontWeight: '900',
    width: 24,
    letterSpacing: 0.5,
  },
  intelBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  intelBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  intelStatVal: {
    fontSize: 8,
    fontWeight: '900',
    width: 20,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  intelUnitsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  intelUnitChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    paddingVertical: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  intelUnitText: {
    color: '#8fa8bc',
    fontSize: 8,
    fontWeight: '700',
  },
  intelEmpty: {
    color: '#3a5060',
    fontSize: 10,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  intelText: {
    color: '#3a5060',
    fontSize: 9,
  },

  // SELECTION CARD
  selectionOverlay: {
    position: 'absolute',
    bottom: 42,
    right: 0,
  },
  selectionCard: {
    backgroundColor: 'rgba(6,14,26,0.95)',
    padding: 12,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#3a9eff',
    minWidth: 130,
    shadowColor: '#3a9eff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  selectionName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 1,
  },
  selectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionFaction: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  selectionUnitBox: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionTroops: {
    color: '#7aaabf',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  // SPECIAL ACTIONS BAR (on selection card)
  specialActionsBar: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  specialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 3,
    borderWidth: 1,
  },
  specialBtnNuke: {
    backgroundColor: 'rgba(231,76,60,0.15)',
    borderColor: '#e74c3c',
  },
  specialBtnOrbital: {
    backgroundColor: 'rgba(41,128,185,0.15)',
    borderColor: '#2980b9',
  },
  specialBtnBlackout: {
    backgroundColor: 'rgba(155,89,182,0.15)',
    borderColor: '#9b59b6',
  },
  specialBtnDisabled: {
    opacity: 0.3,
    borderColor: '#333',
    backgroundColor: 'transparent',
  },
  specialBtnIcon: { fontSize: 14 },
  specialBtnLabel: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 12,
  },
  specialBtnSub: {
    color: '#aaa',
    fontSize: 7,
    fontWeight: '700',
  },

  // NUKE STOCKPILE display in top bar


  // ── Undo bar ──────────────────────────────────────────────────────────────
  undoBar: {
    position: 'absolute', bottom: 90, left: 14, right: 14,
    backgroundColor: 'rgba(4,9,15,0.96)',
    borderWidth: 1, borderColor: '#1a3a4a',
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 8,
    zIndex: 200,
  },
  undoLabel: {
    color: '#4a7a8a', fontSize: 10, fontWeight: '700', letterSpacing: 1, flex: 1,
  },
  undoBtn: {
    backgroundColor: '#1a3a4a', paddingVertical: 6, paddingHorizontal: 14,
  },
  undoBtnText: {
    color: '#3a9eff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5,
  },
  confirmOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 300,
  },
  confirmModal: {
    backgroundColor: '#06101c',
    borderWidth: 1, borderColor: '#1a3a4a',
    padding: 24, marginHorizontal: 30,
    alignItems: 'center', minWidth: 280,
  },
  confirmIcon: { fontSize: 36, marginBottom: 10 },
  confirmTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  confirmDetail: { color: '#5a8a9a', fontSize: 11, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  confirmBtns: { flexDirection: 'row', gap: 12 },
  confirmCancelBtn: {
    paddingVertical: 10, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#1a3a4a',
  },
  confirmCancelText: { color: '#4a6070', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  confirmOkBtn: {
    paddingVertical: 10, paddingHorizontal: 24,
    backgroundColor: '#e74c3c',
  },
  confirmOkText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  nukesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.5)',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(231,76,60,0.1)',
  },
  nukesUsed: {
    opacity: 0.35,
    borderColor: '#333',
  },
  nukesIcon: { fontSize: 11 },
  nukesText: {
    color: '#e74c3c',
    fontSize: 11,
    fontWeight: '900',
  },

  // NUCLEAR CONFIRMATION MODAL
  nukeOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 600,
  },
  nukeModal: {
    width: '80%',
    backgroundColor: '#0d0608',
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 4,
    padding: 20,
    alignItems: 'center',
  },
  nukeModalWarning: {
    color: '#e74c3c',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  nukeModalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  nukeModalInfo: {
    width: '100%',
    backgroundColor: 'rgba(231,76,60,0.08)',
    borderRadius: 3,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  nukeModalDetail: { color: '#c0c0c0', fontSize: 11, fontWeight: '700' },
  nukeModalTech:   { color: '#2ecc71', fontSize: 10, fontWeight: '700' },
  nukeModalWarn:   { color: '#e74c3c', fontSize: 10, fontStyle: 'italic' },
  nukeModalBtns: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  nukeCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 3,
    borderWidth: 1, borderColor: '#555',
    alignItems: 'center',
  },
  nukeCancelTxt: { color: '#888', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  nukeConfirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 3,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  nukeConfirmTxt: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },

  // BOTTOM NAV — real styled tabs
  bottomNavBar: {
    height: 38,
    marginHorizontal: -10,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(6,12,22,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(52,152,219,0.3)',
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  navTabActive: {
    backgroundColor: 'rgba(41,128,185,0.15)',
  },
  navTabDanger: {
    backgroundColor: 'rgba(180,30,30,0.12)',
  },
  navTabIcon: {
    fontSize: 11,
    marginBottom: 1,
  },
  navTabLabel: {
    color: '#3a5878',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  navTabLabelActive: {
    color: '#ffffff',
  },
  navTabLabelDanger: {
    color: '#e74c3c',
  },
  navTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    backgroundColor: '#3498db',
    borderRadius: 1,
  },


  // Kept from original — used by other screens
  factionSelectionContent: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { backgroundColor: '#11151c', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  factionLabel: { flexDirection: 'row', alignItems: 'center' },
  flagText: { fontSize: 24, marginRight: 8 },
  factionNameText: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1.5 },
  dateDisplay: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dateLabel: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  turnLabel: { color: '#3498db', fontSize: 9, fontWeight: 'bold', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1f2937', alignItems: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { color: '#e5e7eb', fontSize: 13, fontWeight: 'bold', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 40, paddingHorizontal: 20 },
  factionGrid: { gap: 15 },
  factionButton: { backgroundColor: '#111', padding: 20, borderRadius: 12, borderWidth: 1 },
  factionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  factionFlag: { fontSize: 24, marginRight: 15 },
  factionName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  factionDesc: { color: '#888', fontSize: 12, lineHeight: 18, marginBottom: 15 },
  factionStats: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#222' },
  factionStatText: { color: '#555', fontSize: 10, fontWeight: 'bold' },
  backButton: { marginTop: 30, alignSelf: 'center' },
  backButtonText: { color: '#3a9eff', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
});

export default App;
