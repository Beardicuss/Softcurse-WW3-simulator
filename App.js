import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
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

import useGameStore from './src/store/useGameStore';
import { FD } from './src/data/mapData';
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

const { width, height } = Dimensions.get('window');

const App = () => {
  const {
    uiMode, playerFaction, factions, regions,
    turn, date, gameLog, selectedRegionId, startGame, checkHasSave,
    nukeUsedThisTurn, launchNuke, orbitalStrike, blackoutRegion, aiMemory,
  } = useGameStore();

  const [showEconomy, setShowEconomy] = React.useState(false);
  const [showDiplomacy, setShowDiplomacy] = React.useState(false);
  const [showResearch, setShowResearch] = React.useState(false);
  const [showNukeModal, setShowNukeModal] = React.useState(false);

  React.useEffect(() => { checkHasSave(); }, [checkHasSave]);

  if (uiMode === 'SPLASH') return <SplashScreen />;
  if (uiMode === 'INTRO') return <IntroScreen />;
  if (uiMode === 'MENU') return <MainMenuView />;
  if (uiMode === 'FACTION') return <FactionSelectView onStart={startGame} />;
  if (uiMode === 'SETTINGS') return <SettingsView />;

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
        <View style={styles.mapLayer}>
          <GameMap />
        </View>

        {/* LAYER 2: SKIA OVERLAY (borders, hanging frames) */}
        <GameFrame />

        {/* LAYER 3: UI ELEMENTS */}
        <View style={styles.uiLayer} pointerEvents="box-none">

          {/* TOP BAR */}
          <View style={styles.topResourceBar}>

            <View style={styles.resourcesContainer}>
              <View style={styles.resourceItem}>
                <Droplet size={13} color="#ffd700" />
                <Text style={styles.resourceText}>{currentFS.oil} OIL</Text>
              </View>
              <View style={styles.resourceItem}>
                <Layers size={13} color="#bdc3c7" />
                <Text style={styles.resourceText}>{currentFS.supplies} STEEL</Text>
              </View>
              <View style={styles.resourceItem}>
                <Banknote size={13} color="#2ecc71" />
                <Text style={styles.resourceText}>${currentFS.funds} MONEY</Text>
              </View>
              <View style={styles.resourceItem}>
                <Zap size={13} color="#3498db" />
                <Text style={styles.resourceText}>{currentFS?.stability || 0}% ENERGY</Text>
              </View>
              <TouchableOpacity
                style={[styles.resourceItem, styles.techPointsItem, showResearch && styles.techPointsActive]}
                onPress={() => { setShowResearch(!showResearch); setShowEconomy(false); setShowDiplomacy(false); }}
              >
                <Text style={styles.techPointsIcon}>⚗</Text>
                <Text style={[styles.techPointsText, (currentFS?.techPoints || 0) > 0 && styles.techPointsAvailable]}>
                  {currentFS?.techPoints || 0} TP
                </Text>
              </TouchableOpacity>
              {(currentFS.nukes || 0) > 0 && (
                <View style={[styles.resourceItem, styles.nukesItem, nukeUsedThisTurn && styles.nukesUsed]}>
                  <Text style={styles.nukesIcon}>☢</Text>
                  <Text style={styles.nukesText}>{currentFS.nukes}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.menuIcon} onPress={() => useGameStore.setState({ uiMode: 'MENU' })}>
              <Menu color="#a0c8e0" size={20} />
            </TouchableOpacity>
          </View>

          {/* PANELS CONTAINER (occupies map area) */}
          <View style={styles.panelsContainer} pointerEvents="box-none">

            {/* TACTICAL BRIEFING — top left */}
            <View style={styles.briefingPanel} pointerEvents="box-none">
              <View style={styles.briefingHeader}>
                <Text style={styles.briefingTitle}>TACTICAL BRIEFING</Text>
              </View>
              <View style={styles.briefingList}>
                {(gameLog || []).slice(0, 4).map((log, i) => (
                  <View key={i} style={styles.logEntry}>
                    <Text style={styles.logEntryTitle}>MISSION REPORT:</Text>
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
                      <Text style={styles.aiIntelLabel}>detected: </Text>
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
                  {selectedRegionId ? selectedRegionId.replace(/_/g,' ').toUpperCase() : 'REGION INTEL'}
                </Text>
              </View>
              {selectedRegion ? (
                <View style={styles.intelBody}>
                  <View style={styles.intelFactionRow}>
                    <View style={[styles.intelFactionDot, { backgroundColor: FD[selectedRegion.faction]?.color || '#2a3d50' }]} />
                    <Text style={[styles.intelFactionName, { color: FD[selectedRegion.faction]?.color || '#aaa' }]}>
                      {FD[selectedRegion.faction]?.short || 'NEU'}
                    </Text>
                    {selectedRegion.isolated && <Text style={styles.intelWarning}> ⚠ISO</Text>}
                  </View>
                  <View style={styles.intelDivider} />
                  {[
                    { label: 'ECO', raw: selectedRegion.economy || 0, max: 100, color: '#f39c12' },
                    { label: 'IND', raw: selectedRegion.industry || 0, max: 25, color: '#3498db' },
                    { label: 'STB', raw: selectedRegion.stability || 0, max: 100, color: (selectedRegion.stability || 0) > 60 ? '#2ecc71' : '#e74c3c' },
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
                    <View style={styles.intelUnitChip}><Text style={styles.intelUnitText}>⚔ {selectedRegion.infantry || 0}</Text></View>
                    <View style={styles.intelUnitChip}><Text style={styles.intelUnitText}>🛡 {selectedRegion.armor || 0}</Text></View>
                    <View style={styles.intelUnitChip}><Text style={styles.intelUnitText}>✈ {selectedRegion.air || 0}</Text></View>
                  </View>
                </View>
              ) : (
                <View style={styles.intelBody}>
                  <Text style={styles.intelEmpty}>Tap a region{'\n'}to view intel</Text>
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
                      ? <Text style={{ color: '#e74c3c', fontSize: 10, marginLeft: 4, fontWeight: 'bold' }}>[ISO]</Text>
                      : null}
                  </View>
                  <View style={styles.selectionStats}>
                    <Text style={[styles.selectionFaction, { color: FD[selectedRegion?.faction]?.color }]}>
                      {FD[selectedRegion?.faction]?.short}
                    </Text>
                    <View style={styles.selectionUnitBox}>
                      <Text style={styles.selectionTroops}>I: {selectedRegion?.infantry || 0}</Text>
                      <Text style={styles.selectionTroops}>A: {selectedRegion?.armor || 0}</Text>
                      <Text style={styles.selectionTroops}>F: {selectedRegion?.air || 0}</Text>
                    </View>
                  </View>
                  {/* Special actions vs enemy regions */}
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
                          NUKE{'\n'}
                          <Text style={styles.specialBtnSub}>{currentFS.nukes}▸</Text>
                        </Text>
                      </TouchableOpacity>

                      {/* ORBITAL STRIKE — Space T3 */}
                      <TouchableOpacity
                        style={[styles.specialBtn, styles.specialBtnOrbital, !canOrbital && styles.specialBtnDisabled]}
                        onPress={() => { if (canOrbital) orbitalStrike(selectedRegionId); }}
                        disabled={!canOrbital}
                      >
                        <Text style={styles.specialBtnIcon}>⚡</Text>
                        <Text style={[styles.specialBtnLabel, !canOrbital && { color: '#444' }]}>
                          ORBITAL{'\n'}
                          <Text style={styles.specialBtnSub}>{canOrbital ? 'READY' : 'LOCKED'}</Text>
                        </Text>
                      </TouchableOpacity>

                      {/* E-WAR BLACKOUT — EW T3 */}
                      <TouchableOpacity
                        style={[styles.specialBtn, styles.specialBtnBlackout, !canBlackout && styles.specialBtnDisabled]}
                        onPress={() => { if (canBlackout) blackoutRegion(selectedRegionId); }}
                        disabled={!canBlackout}
                      >
                        <Text style={styles.specialBtnIcon}>📡</Text>
                        <Text style={[styles.specialBtnLabel, !canBlackout && { color: '#444' }]}>
                          BLACKOUT{'\n'}
                          <Text style={styles.specialBtnSub}>{canBlackout ? 'READY' : 'LOCKED'}</Text>
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
              { label: 'MAP',      icon: '🗺',  onPress: () => { setShowEconomy(false); setShowDiplomacy(false); setShowResearch(false); }, active: mapActive },
              { label: 'DEPLOY',   icon: '⚙',  onPress: () => { setShowEconomy(!showEconomy); setShowDiplomacy(false); setShowResearch(false); }, active: showEconomy },
              { label: 'RESEARCH', icon: '⚗',  onPress: () => { setShowResearch(!showResearch); setShowEconomy(false); setShowDiplomacy(false); }, active: showResearch },
              { label: 'ALLIANCE', icon: '🤝',  onPress: () => { setShowDiplomacy(!showDiplomacy); setShowEconomy(false); setShowResearch(false); }, active: showDiplomacy },
              { label: 'END TURN', icon: '▶',  onPress: () => useGameStore.getState().endTurn(), active: false, danger: true },
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
              <Text style={styles.nukeModalWarn}>One use per turn</Text>
            </View>
            <View style={styles.nukeModalBtns}>
              <TouchableOpacity style={styles.nukeCancelBtn} onPress={() => setShowNukeModal(false)}>
                <Text style={styles.nukeCancelTxt}>ABORT</Text>
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
    bottom: 42,
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
