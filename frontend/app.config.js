/**
 * Dynamic Expo config. Keeps app.json as the static base and enables the real Apple Screen Time
 * stack (react-native-device-activity) using this project's Apple Team ID + App Group (below).
 * Env vars override them for a different signing account:
 *   EXPO_APPLE_TEAM_ID=XXXXXXXXXX  EXPO_APP_GROUP=group.com.yourorg.earnlock
 *
 * At `expo prebuild` this generates the Family Controls entitlement + the shield/monitor
 * extensions and sets extra.screenTimeEnabled = true. Note: the plugin only affects native
 * (prebuild/device) builds — `expo start` / Expo Go still runs, and Screen Time reports itself
 * unavailable there because the native module isn't present. See docs/screen-time.md.
 */
const base = require('./app.json').expo;

// Project defaults (this repo's Apple account). Override via env for another team/group.
const APPLE_TEAM_ID = process.env.EXPO_APPLE_TEAM_ID || 'ZMJTV28224';
const APP_GROUP = process.env.EXPO_APP_GROUP || 'group.com.filipangelov.earnlock';
const screenTimeEnabled = Boolean(APPLE_TEAM_ID && APP_GROUP);

module.exports = () => {
  const plugins = [...(base.plugins ?? [])];

  if (screenTimeEnabled) {
    // Family Controls needs iOS 15.1+, but SDK 57's toolchain enforces a 16.4 floor.
    plugins.push(['expo-build-properties', { ios: { deploymentTarget: '16.4' } }]);
    plugins.push([
      'react-native-device-activity',
      { appleTeamId: APPLE_TEAM_ID, appGroup: APP_GROUP },
    ]);
  }

  return {
    ...base,
    plugins,
    ios: {
      ...(base.ios ?? {}),
      // Required by the device-activity / apple-targets tooling to sign the extensions.
      ...(screenTimeEnabled ? { appleTeamId: APPLE_TEAM_ID } : {}),
    },
    extra: {
      ...(base.extra ?? {}),
      screenTimeEnabled,
    },
  };
};
