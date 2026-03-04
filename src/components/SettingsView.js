import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { ChevronLeft, Volume2, MonitorPlay } from 'lucide-react-native';
import useGameStore from '../store/useGameStore';

const SettingsView = () => {
    const { settings, updateSettings, setUiMode } = useGameStore();

    const toggleBool = (key) => {
        updateSettings({ [key]: !settings[key] });
    };

    const toggleVolume = (key) => {
        // Simple toggle 1.0 -> 0.0 -> 1.0 for now since we don't have a slider component easily built-in
        const val = settings[key] > 0 ? 0.0 : 1.0;
        updateSettings({ [key]: val });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setUiMode('MENU')}>
                    <ChevronLeft color="#fff" size={24} />
                    <Text style={styles.backText}>BACK</Text>
                </TouchableOpacity>
                <Text style={styles.title}>SYSTEM CONFIGURATION</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Audio Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AUDIO PROTOCOLS</Text>

                    <TouchableOpacity style={styles.settingRow} onPress={() => toggleVolume('musicVolume')}>
                        <View style={styles.settingLeft}>
                            <Volume2 color="#888" size={20} />
                            <Text style={styles.settingLabel}>Atmospheric Music</Text>
                        </View>
                        <Text style={[styles.settingValue, settings.musicVolume > 0 ? styles.on : styles.off]}>
                            {settings.musicVolume > 0 ? 'ONLINE' : 'OFFLINE'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingRow} onPress={() => toggleVolume('sfxVolume')}>
                        <View style={styles.settingLeft}>
                            <Volume2 color="#888" size={20} />
                            <Text style={styles.settingLabel}>Tactical SFX</Text>
                        </View>
                        <Text style={[styles.settingValue, settings.sfxVolume > 0 ? styles.on : styles.off]}>
                            {settings.sfxVolume > 0 ? 'ONLINE' : 'OFFLINE'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Display Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>INTERFACE PROTOCOLS</Text>

                    <TouchableOpacity style={styles.settingRow} onPress={() => toggleBool('animations')}>
                        <View style={styles.settingLeft}>
                            <MonitorPlay color="#888" size={20} />
                            <Text style={styles.settingLabel}>Combat Animations</Text>
                        </View>
                        <Text style={[styles.settingValue, settings.animations ? styles.on : styles.off]}>
                            {settings.animations ? 'ENABLED' : 'DISABLED'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030508',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#0a1018',
        borderBottomWidth: 1,
        borderBottomColor: '#1a2a3a',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    backText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    title: {
        fontSize: 16,
        color: '#e0eeff',
        fontWeight: '900',
        letterSpacing: 3,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
        backgroundColor: '#0a1018',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1a2a3a',
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 10,
        color: '#3a9eff',
        fontWeight: 'bold',
        letterSpacing: 2,
        padding: 15,
        backgroundColor: 'rgba(58, 158, 255, 0.05)',
        borderBottomWidth: 1,
        borderBottomColor: '#1a2a3a',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#111820',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    settingLabel: {
        color: '#ccc',
        fontSize: 14,
        letterSpacing: 1,
    },
    settingValue: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    on: {
        color: '#2ecc71',
    },
    onAlert: {
        color: '#e74c3c',
    },
    off: {
        color: '#777',
    },
    warningText: {
        fontSize: 10,
        color: '#e74c3c',
        padding: 15,
        paddingTop: 0,
        opacity: 0.8,
    }
});

export default SettingsView;
