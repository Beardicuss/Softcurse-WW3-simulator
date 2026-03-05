import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import {
  Zap,
  Globe,
  Shield,
  Skull,
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
import GameMap from './src/components/GameMap';
import IntroScreen from './src/components/IntroScreen';
import SplashScreen from './src/components/SplashScreen';
import MainMenuView from './src/components/MainMenuView';
import FactionSelectView from './src/components/FactionSelectView';
import EconomyPanel from './src/components/EconomyPanel';
import DiplomacyPanel from './src/components/DiplomacyPanel';
import SettingsView from './src/components/SettingsView';
import GameFrame from './src/components/GameFrame';

const { width, height } = Dimensions.get('window');

const App = () => {
  const {
    uiMode, playerFaction, factions, regions,
    turn, date, gameLog, selectedRegionId, startGame, checkHasSave
  } = useGameStore();

  const [showEconomy, setShowEconomy] = React.useState(false);
  const [showDiplomacy, setShowDiplomacy] = React.useState(false);

  React.useEffect(() => { checkHasSave(); }, [checkHasSave]);

  if (uiMode === 'SPLASH') return <SplashScreen />;
  if (uiMode === 'INTRO') return <IntroScreen />;
  if (uiMode === 'MENU') return <MainMenuView />;
  if (uiMode === 'FACTION') return <FactionSelectView onStart={startGame} />;
  if (uiMode === 'SETTINGS') return <SettingsView />;

  const currentFD = FD[playerFaction];
  const currentFS = factions[playerFaction] || { funds: 0, oil: 0, supplies: 0, stability: 100, nukes: 0 };
  const selectedRegion = selectedRegionId ? regions[selectedRegionId] : null;
  const mapActive = !showEconomy && !showDiplomacy;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      {/* Black background behind the frame */}
      <View style={styles.screenRoot}>

        {/* LAYER 1: MAP BACKGROUND */}
        <View style={styles.mapLayer}>
          <GameMap />
        </View>

        {/* LAYER 2: SKIA OVERLAY (borders, hanging frames) */}
        <GameFrame activeTab={showEconomy ? 1 : showDiplomacy ? 2 : 0} />

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
            </View>

            {/* TERRAIN & DEPTH INTEL — bottom left, above nav */}
            <View style={styles.intelPanel} pointerEvents="none">
              <View style={styles.intelHeader}>
                <Text style={styles.intelTitle}>TERRAIN & DEPTH INTEL</Text>
              </View>
              <View style={styles.intelBody}>
                <View style={styles.intelRow}>
                  {/* Color scale bar */}
                  <View style={{ width: 12, height: 50, borderWidth: 1, borderColor: '#4a5568', overflow: 'hidden' }}>
                    <View style={{ flex: 1, backgroundColor: '#8b4513' }} />
                    <View style={{ flex: 1, backgroundColor: '#cd853f' }} />
                    <View style={{ flex: 1, backgroundColor: '#228b22' }} />
                    <View style={{ flex: 1, backgroundColor: '#4169e1' }} />
                    <View style={{ flex: 1, backgroundColor: '#000080' }} />
                  </View>
                  <View>
                    <Text style={styles.intelLabel}>Elevation</Text>
                    <Text style={styles.intelText}>1000km</Text>
                    <Text style={styles.intelText}>200km</Text>
                    <Text style={styles.intelText}>-80km</Text>
                  </View>
                  <View>
                    <Text style={styles.intelLabel}>Depth</Text>
                    <Text style={styles.intelText}>0</Text>
                    <Text style={styles.intelText}>-100</Text>
                    <Text style={styles.intelText}>-2500</Text>
                  </View>
                </View>
              </View>
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
                  {selectedRegion?.faction !== playerFaction && (
                    <TouchableOpacity
                      style={styles.nukeBtnMap}
                      onPress={() => {
                        useGameStore.setState(s => {
                          const newRegions = { ...s.regions };
                          newRegions[selectedRegionId].infantry = Math.floor((newRegions[selectedRegionId].infantry || 0) * 0.1);
                          newRegions[selectedRegionId].armor = Math.floor((newRegions[selectedRegionId].armor || 0) * 0.1);
                          newRegions[selectedRegionId].air = Math.floor((newRegions[selectedRegionId].air || 0) * 0.1);
                          newRegions[selectedRegionId].bombed = true;
                          return { regions: newRegions, gameLog: [`NUCLEAR STRIKE on ${selectedRegionId.toUpperCase()}!`, ...s.gameLog].slice(0, 10) };
                        });
                      }}
                    >
                      <Skull size={13} color="#e74c3c" />
                      <Text style={styles.nukeTextMap}>LAUNCH STRIKE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* BOTTOM NAV — inside frame, exactly 5 tabs */}
          <View style={styles.bottomNavBar}>
            <TouchableOpacity
              style={[styles.navItem, mapActive && styles.navItemActive]}
              onPress={() => { setShowEconomy(false); setShowDiplomacy(false); }}
            >
              <Text style={[styles.navText, mapActive && styles.navTextActive]}>MAP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, showEconomy && styles.navItemActive]}
              onPress={() => { setShowEconomy(!showEconomy); setShowDiplomacy(false); }}
            >
              <Text style={[styles.navText, showEconomy && styles.navTextActive]}>DEPLOY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => { }}
            >
              <Text style={styles.navText}>RESEARCH</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, showDiplomacy && styles.navItemActive]}
              onPress={() => { setShowDiplomacy(!showDiplomacy); setShowEconomy(false); }}
            >
              <Text style={[styles.navText, showDiplomacy && styles.navTextActive]}>ALLIANCE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => useGameStore.getState().endTurn()}>
              <Text style={styles.navText}>END TURN</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* ACCENT DOTS overlaying everything */}
        <View style={[styles.accentDot, styles.accentDotLeft]} />
        <View style={[styles.accentDot, styles.accentDotRight]} />

      </View>

      {showEconomy && <EconomyPanel onClose={() => setShowEconomy(false)} />}
      {showDiplomacy && <DiplomacyPanel onClose={() => setShowDiplomacy(false)} />}

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

  // TERRAIN & DEPTH INTEL — matches HTML .terrain-panel exactly
  intelPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 156,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: '#3f515d',
    borderBottomWidth: 3,
    borderBottomColor: '#2c3a44',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  intelHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  intelTitle: {
    color: '#cbd5e0',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  intelBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  intelLegendStripe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 0,
  },
  intelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  intelLabel: {
    color: '#718096',
    fontSize: 8,
    fontWeight: '700',
    marginBottom: 2,
  },
  intelText: {
    color: '#718096',
    fontSize: 8,
    fontFamily: 'monospace',
    marginBottom: 2,
  },

  // SELECTION CARD
  selectionOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 16,
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
  nukeBtnMap: {
    backgroundColor: 'rgba(180,30,30,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    marginTop: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  nukeTextMap: {
    color: '#e74c3c',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 6,
    letterSpacing: 1,
  },

  // BOTTOM NAV — transparent container, GameFrame draws trapezoid tabs on top
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 10,
  },
  // Invisible touch targets — same trapezoid size as GameFrame draws
  navItem: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: 100, // matching TAB_W
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4, // slight adjustment to push text to the bottom wide part
  },
  navItemActive: {},
  navText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  navTextActive: {
    color: '#ffffff',
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
