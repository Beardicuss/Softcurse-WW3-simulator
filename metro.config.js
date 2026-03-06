const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-av is provided natively by Expo Go — exclude it from the JS bundle
// so Metro doesn't try to call requireNativeModule at bundle time
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'expo-av') {
        return {
            type: 'empty',
        };
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
