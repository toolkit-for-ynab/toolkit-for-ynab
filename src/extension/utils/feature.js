export function isFeatureEnabled(feature) {
  return (
    (typeof feature.settings.enabled === 'boolean' && feature.settings.enabled) ||
    (typeof feature.settings.enabled === 'string' && feature.settings.enabled !== '0') // assumes '0' means disabled
  );
}
