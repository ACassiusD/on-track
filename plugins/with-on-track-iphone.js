const fs = require('node:fs');
const path = require('node:path');
const { withInfoPlist, withEntitlementsPlist, withXcodeProject, IOSConfig } = require('expo/config-plugins');

function groupIdentifier(config, options = {}) {
  const identifier = options.groupIdentifier || (config.ios?.bundleIdentifier && `group.${config.ios.bundleIdentifier}`);
  if (!identifier || !/^group\.[A-Za-z0-9.-]+$/.test(identifier)) throw new Error('ON TRACK requires ios.bundleIdentifier or a valid groupIdentifier.');
  return identifier;
}
function withOnTrackIPhone(config, options = {}) {
  const group = groupIdentifier(config, options);
  config = withInfoPlist(config, cfg => {
    cfg.modResults.NSHealthShareUsageDescription = 'Read weight, workouts, and calorie summaries you choose to review and import into ON TRACK.';
    cfg.modResults.OnTrackAppGroup = group;
    cfg.modResults.NSAlarmKitUsageDescription = 'Schedule a real food-review alarm only when you explicitly choose one.';
    return cfg;
  });
  config = withEntitlementsPlist(config, cfg => {
    cfg.modResults['com.apple.developer.healthkit'] = true;
    cfg.modResults['com.apple.security.application-groups'] = [...new Set([...(cfg.modResults['com.apple.security.application-groups'] || []), group])];
    return cfg;
  });
  // Intent metadata extraction must see this source in the application target,
  // rather than hoping CocoaPods' framework metadata is indexed by Shortcuts.
  return withXcodeProject(config, cfg => {
    const projectName = cfg.modRequest.projectName;
    if (!projectName) throw new Error('Could not find the iOS application target name.');
    const filename = 'OnTrackIntents.swift';
    const directory = path.join(cfg.modRequest.platformProjectRoot, projectName);
    fs.mkdirSync(directory, { recursive: true });
    fs.copyFileSync(path.join(__dirname, filename), path.join(directory, filename));
    IOSConfig.XcodeUtils.addBuildSourceFileToGroup({ filepath: `${projectName}/${filename}`, groupName: projectName, project: cfg.modResults });
    return cfg;
  });
}
module.exports = withOnTrackIPhone;
module.exports.groupIdentifier = groupIdentifier;
