// Stub for expo-av — prevents ExponentAV native module crash
export const Audio = {
    Sound: {
        createAsync: async () => ({ sound: { playAsync: () => {}, unloadAsync: () => {}, setVolumeAsync: () => {} } }),
    },
    setAudioModeAsync: async () => {},
    requestPermissionsAsync: async () => ({ granted: false }),
};
export const Video = {};
export const ResizeMode = {};
