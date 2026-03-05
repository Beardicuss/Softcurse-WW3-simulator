import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { ChevronLeft, Volume2, MonitorPlay, Globe } from 'lucide-react-native';
import useGameStore from '../store/useGameStore';
import { useTranslation } from '../i18n/i18n';

const SettingsView = () => {
    const { settings, updateSettings, setUiMode } = useGameStore();
    const t = useTranslation();

    const toggleVolume = (key) => {
        updateSettings({ [key]: settings[key] > 0 ? 0.0 : 1.0 });
    };

    const toggleBool = (key) => {
        updateSettings({ [key]: !settings[key] });
    };

    const setLanguage = (lang) => {
        updateSettings({ language: lang });
    };

    const currentLang = settings.language || 'en';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setUiMode('MENU')}>
                    <ChevronLeft color="#fff" size={24} />
                    <Text style={styles.backText}>{t('common.back')}</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{t('settings.title')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Language Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.language')}</Text>

                    <View style={styles.languageRow}>
                        <TouchableOpacity
                            style={[styles.langBtn, currentLang === 'en' && styles.langBtnActive]}
                            onPress={() => setLanguage('en')}
                        >
                            <Text style={styles.langFlag}>🇬🇧</Text>
                            <Text style={[styles.langLabel, currentLang === 'en' && styles.langLabelActive]}>
                                English
                            </Text>
                            {currentLang === 'en' && (
                                <View style={styles.langActiveDot} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.langBtn, currentLang === 'ru' && styles.langBtnActive]}
                            onPress={() => setLanguage('ru')}
                        >
                            <Text style={styles.langFlag}>🇷🇺</Text>
                            <Text style={[styles.langLabel, currentLang === 'ru' && styles.langLabelActive]}>
                                Русский
                            </Text>
                            {currentLang === 'ru' && (
                                <View style={styles.langActiveDot} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Audio Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.audio')}</Text>

                    <TouchableOpacity style={styles.settingRow} onPress={() => toggleVolume('musicVolume')}>
                        <View style={styles.settingLeft}>
                            <Volume2 color="#888" size={20} />
                            <Text style={styles.settingLabel}>{t('settings.music')}</Text>
                        </View>
                        <Text style={[styles.settingValue, settings.musicVolume > 0 ? styles.on : styles.off]}>
                            {settings.musicVolume > 0 ? t('common.on') : t('common.off')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingRow} onPress={() => toggleVolume('sfxVolume')}>
                        <View style={styles.settingLeft}>
                            <Volume2 color="#888" size={20} />
                            <Text style={styles.settingLabel}>{t('settings.sfx')}</Text>
                        </View>
                        <Text style={[styles.settingValue, settings.sfxVolume > 0 ? styles.on : styles.off]}>
                            {settings.sfxVolume > 0 ? t('common.on') : t('common.off')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Display Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('settings.interface')}</Text>

                    <TouchableOpacity style={styles.settingRow} onPress={() => toggleBool('animations')}>
                        <View style={styles.settingLeft}>
                            <MonitorPlay color="#888" size={20} />
                            <Text style={styles.settingLabel}>{t('settings.animations')}</Text>
                        </View>
                        <Text style={[styles.settingValue, settings.animations ? styles.on : styles.off]}>
                            {settings.animations ? t('common.enabled') : t('common.disabled')}
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
        marginBottom: 24,
        backgroundColor: '#0a1018',
        borderRadius: 4,
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
    // Language selector
    languageRow: {
        flexDirection: 'row',
        gap: 0,
    },
    langBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 16,
        borderRightWidth: 1,
        borderRightColor: '#1a2a3a',
        backgroundColor: 'transparent',
    },
    langBtnActive: {
        backgroundColor: 'rgba(58,158,255,0.08)',
    },
    langFlag: {
        fontSize: 20,
    },
    langLabel: {
        color: '#666',
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1,
        flex: 1,
    },
    langLabelActive: {
        color: '#fff',
    },
    langActiveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3a9eff',
    },
    // Standard setting row
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
    on:  { color: '#2ecc71' },
    off: { color: '#777' },
});

export default SettingsView;
