import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import useGameStore from '../store/useGameStore';

const VIDEO = require('../../assets/video/flash_screen.mp4');

const SplashScreen = () => {
    const setUiMode = useGameStore(s => s.setUiMode);

    const player = useVideoPlayer(VIDEO, p => {
        p.loop             = false;
        p.muted            = false;
        p.allowsExternalPlayback = false;
        // bufferOptions: fill buffer before playing to avoid stutters
        p.bufferOptions = {
            preferredForwardBufferDuration: 10, // buffer full 9s video
            waitsToMinimizeStalling: true,
        };
    });

    useEffect(() => {
        const fallback = setTimeout(() => setUiMode('INTRO'), 12000);

        // Wait until buffered enough, then play
        const statusSub = player.addListener('statusChange', ({ status }) => {
            if (status === 'readyToPlay') {
                player.play();
            }
        });

        const endSub = player.addListener('playToEnd', () => {
            clearTimeout(fallback);
            setUiMode('INTRO');
        });

        return () => {
            clearTimeout(fallback);
            statusSub.remove();
            endSub.remove();
        };
    }, [player]);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    video:     { flex: 1, width: '100%', height: '100%' },
});

export default SplashScreen;
