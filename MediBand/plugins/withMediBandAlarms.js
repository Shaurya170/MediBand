const fs = require("fs");
const path = require("path");
const { IOSConfig, withInfoPlist, withXcodeProject } = require("expo/config-plugins");

// Adds MediBand's AlarmKit code (native/ios) to the iOS app target. It lives in
// the app target, not an Expo module, so iOS can find the Snooze App Intent.
const SOURCE_FILES = [
  "MediBandAlarms.swift",
  "MediBandAlarmsModule.swift",
  "MediBandAlarmsModule.m",
];

function withAlarmSources(config) {
  return withXcodeProject(config, (config) => {
    const { projectRoot, platformProjectRoot } = config.modRequest;
    const projectName = IOSConfig.XcodeUtils.getProjectName(projectRoot);
    const project = config.modResults;

    for (const file of SOURCE_FILES) {
      fs.copyFileSync(
        path.join(projectRoot, "native", "ios", file),
        path.join(platformProjectRoot, projectName, file)
      );
      const filepath = `${projectName}/${file}`;
      if (!project.hasFile(filepath)) {
        IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
          filepath,
          groupName: projectName,
          project,
        });
      }
    }
    return config;
  });
}

function withAlarmPermission(config) {
  return withInfoPlist(config, (config) => {
    // Shown in the system prompt asking to allow MediBand to set alarms.
    config.modResults.NSAlarmKitUsageDescription =
      "MediBand rings an alarm when it's time to take your medication.";
    return config;
  });
}

module.exports = function withMediBandAlarms(config) {
  return withAlarmPermission(withAlarmSources(config));
};
