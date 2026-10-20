const { withEntitlementsPlist } = require("expo/config-plugins");

// expo-notifications always adds the Push Notifications entitlement, but
// MediBand only schedules local alarm notifications, which don't need it.
// Free (Personal Team) Apple accounts can't sign apps with that entitlement,
// so remove it. Delete this plugin if the app ever adds remote push.
module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults["aps-environment"];
    return config;
  });
};
