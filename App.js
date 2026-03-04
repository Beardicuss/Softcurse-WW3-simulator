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
  HardHat,
  Monitor,
  Crosshair,
  Wifi,
  Users,
  Compass
} from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Store & Data
import useGameStore from './src/store/useGameStore';
import { FD } from './src/data/mapData';

// Components
import GameMap from './src/components/GameMap';
import IntroScreen from './src/components/IntroScreen';
import SplashScreen from './src/components/SplashScreen';
import MainMenuView from './src/components/MainMenuView';
import FactionSelectView from './src/components/FactionSelectView';
import EconomyPanel from './src/components/EconomyPanel';
import DiplomacyPanel from './src/components/DiplomacyPanel';
import SettingsView from './src/components/SettingsView';

const { width, height } = Dimensions.get('window');

const App = () => {
  const {
    uiMode,
    playerFaction,
    factions,
    regions,
    turn,
    date,
    gameLog,
    selectedRegionId,
    startGame,
    checkHasSave
  } = useGameStore();

  const [showEconomy, setShowEconomy] = React.useState(false);
  const [showDiplomacy, setShowDiplomacy] = React.useState(false);

  // Initialize persistence on mount
  React.useEffect(() => {
    checkHasSave();
  }, [checkHasSave]);

  // 1. SPLASH SCREEN
  if (uiMode === 'SPLASH') {
    return <SplashScreen />;
  }

  // 2. NARRATIVE INTRO
  if (uiMode === 'INTRO') {
    return <IntroScreen />;
  }

  // 3. MAIN MENU
  if (uiMode === 'MENU') {
    return <MainMenuView />;
  }

  // 4. FACTION SELECTION
  if (uiMode === 'FACTION') {
    return <FactionSelectView onStart={startGame} />;
  }

  // 5. SETTINGS MENU
  if (uiMode === 'SETTINGS') {
    return <SettingsView />;
  }

  // 6. TACTICAL GAMEPLAY
  const currentFD = FD[playerFaction];
  const currentFS = factions[playerFaction] || { funds: 0, oil: 0, supplies: 0, stability: 100, nukes: 0 };
  const selectedRegion = selectedRegionId ? regions[selectedRegionId] : null;
  const gameDate = new Date(date).toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Top Metallic Resource Bar */}
        <View style={styles.topResourceBar}>
          <View style={styles.topBarTitleContainer}>
            <Text style={styles.topBarTitle}>WORLD CONQUEST OVERVIEW</Text>
          </View>

          <View style={styles.resourcesContainer}>
            <View style={styles.resourceItem}>
              <Activity size={14} color="#ffd700" />
              <Text style={styles.resourceText}>{currentFS.oil} OIL</Text>
            </View>
            <View style={styles.resourceItem}>
              <HardHat size={14} color="#bdc3c7" />
              <Text style={styles.resourceText}>{currentFS.supplies} STEEL</Text>
            </View>
            <View style={styles.resourceItem}>
              <Zap size={14} color="#2ecc71" />
              <Text style={styles.resourceText}>${currentFS.funds} MONEY</Text>
            </View>
            <View style={styles.resourceItem}>
              <Wifi size={14} color="#3498db" />
              <Text style={styles.resourceText}>{currentFS?.stability || 0}% ENERGY</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.menuIcon} onPress={() => useGameStore.setState({ uiMode: 'MENU' })}>
            <Menu color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        {/* Map UI Outer Frame */}
        <View style={styles.mapOuterFrame}>

          {/* Center Canvas - Now Full Screen within Frame */}
          <View style={styles.canvasContainer}>
            <GameMap />

            {/* Top Right: Tactical Briefing Floating Panel */}
            <View style={styles.briefingPanel}>
              <View style={styles.briefingHeader}>
                <Text style={styles.briefingTitle}>TACTICAL BRIEFING</Text>
              </View>
              <View style={styles.briefingList}>
                {(gameLog || []).slice(0, 4).map((log, i) => (
                  <View key={i} style={styles.logEntry}>
                    <Text style={styles.logEntryTitle}>MISSION REPORT:</Text>
                    <Text style={[styles.logText, i === 0 && { color: '#fff', fontWeight: 'bold' }]}>
                      {log}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bottom Left: Terrain & Depth Intel Floating Panel */}
            <View style={styles.intelPanel}>
              <View style={styles.intelHeader}>
                <Text style={styles.intelTitle}>TERRAIN & DEPTH INTEL</Text>
              </View>
              <View style={styles.intelLegendStripe} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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

            {/* Contextual Selection Overlay (Bottom Right area) */}
            <View style={styles.selectionOverlay}>
              {selectedRegionId && (
                <View style={styles.selectionCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[styles.selectionName, { marginBottom: 0 }]}>{selectedRegionId.toUpperCase()}</Text>
                    {selectedRegion?.isolated ? <Text style={{ color: '#e74c3c', fontSize: 10, marginLeft: 4, fontWeight: 'bold' }}> [ISO]</Text> : null}
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

                  {/* Nuke Button contextually inside selection */}
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
                          return {
                            regions: newRegions,
                            gameLog: [`NUCLEAR STRIKE on ${selectedRegionId.toUpperCase()} !`, ...s.gameLog].slice(0, 10)
                          };
                        });
                      }}
                    >
                      <Skull size={14} color="#fff" />
                      <Text style={styles.nukeTextMap}>LAUNCH STRIKE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.bottomNavContainer} pointerEvents="box-none">
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => { setShowEconomy(false); setShowDiplomacy(false); }}>
              <Text style={[styles.navText, (!showEconomy && !showDiplomacy) && { color: currentFD?.color || '#3a9eff' }]}>MAP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => { setShowEconomy(!showEconomy); setShowDiplomacy(false); }}>
              <Text style={[styles.navText, showEconomy && { color: currentFD?.color || '#3a9eff' }]}>DEPLOY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => { setShowDiplomacy(!showDiplomacy); setShowEconomy(false); }}>
              <Text style={[styles.navText, showDiplomacy && { color: currentFD?.color || '#3a9eff' }]}>ALLIANCE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endTurnBtn} onPress={() => useGameStore.getState().endTurn()}>
              <Text style={styles.endTurnText}>END TURN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Overlays */}
        {showEconomy && <EconomyPanel onClose={() => setShowEconomy(false)} />}
        {showDiplomacy && <DiplomacyPanel onClose={() => setShowDiplomacy(false)} />}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a12',
  },
  topResourceBar: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#11151c',
    borderBottomWidth: 2,
    borderBottomColor: '#28364a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  topBarTitleContainer: {
    position: 'absolute',
    top: -5,
    backgroundColor: '#1f2937',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderWidth: 2,
    borderColor: '#3a9eff',
    borderTopWidth: 0,
    zIndex: 11,
  },
  topBarTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
  },
  resourcesContainer: {
    flexDirection: 'row',
    gap: 30,
    alignItems: 'center',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0a0d14',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  resourceText: {
    color: '#e5e7eb',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  menuIcon: {
    position: 'absolute',
    right: 20,
  },
  mapOuterFrame: {
    flex: 1,
    backgroundColor: '#050a12',
    borderWidth: 8,
    borderColor: '#1f2937',
    borderTopWidth: 0, // Top bar acts as top frame
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  briefingPanel: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 250,
    backgroundColor: 'rgba(10, 18, 30, 0.85)',
    borderWidth: 1,
    borderColor: '#3a9eff',
    borderRadius: 4,
    padding: 10,
    pointerEvents: 'box-none',
  },
  briefingHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#3a9eff',
    paddingBottom: 6,
    marginBottom: 8,
  },
  briefingTitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  briefingList: {
    gap: 6,
  },
  logEntry: {
    backgroundColor: 'rgba(40, 60, 90, 0.3)',
    padding: 6,
    borderRadius: 2,
    borderLeftWidth: 2,
    borderLeftColor: '#3498db',
  },
  logEntryTitle: {
    color: '#3498db',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  logText: {
    color: '#ccc',
    fontSize: 9,
    lineHeight: 12,
  },
  intelPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 200,
    backgroundColor: 'rgba(10, 18, 30, 0.85)',
    borderWidth: 1,
    borderColor: '#3a9eff',
    borderRadius: 4,
    padding: 10,
    pointerEvents: 'none',
  },
  intelHeader: {
    marginBottom: 6,
  },
  intelTitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  intelLegendStripe: {
    height: 4,
    backgroundColor: '#3a9eff', // Placeholder for gradient
    marginBottom: 6,
  },
  intelLabel: {
    color: '#888',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  intelText: {
    color: '#aaa',
    fontSize: 9,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  selectionOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    pointerEvents: 'box-none',
  },
  nukeBtnMap: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginTop: 8,
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
  bottomNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#11151c',
    borderWidth: 2,
    borderColor: '#3a9eff',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: 15,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  navItem: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#28364a',
  },
  navText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  endTurnBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 10,
  },
  endTurnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  factionSelectionContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#11151c', // Better contrast
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  factionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 24,
    marginRight: 8,
  },
  factionNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  dateDisplay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  turnLabel: {
    color: '#3498db',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  hudOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    pointerEvents: 'none',
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  hudTitle: {
    color: '#333',
    fontSize: 12,
    letterSpacing: 4,
  },
  selectionCard: {
    backgroundColor: 'rgba(10,10,10,0.9)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 120,
  },
  selectionName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionFaction: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectionUnitBox: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionTroops: {
    color: '#aaa',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  recentLog: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  logText: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  nukeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 10,
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  factionGrid: {
    gap: 15,
  },
  factionButton: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  factionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  factionFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  factionName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  factionDesc: {
    color: '#888',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 15,
  },
  factionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  factionStatText: {
    color: '#555',
    fontSize: 10,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#3a9eff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});

export default App;
