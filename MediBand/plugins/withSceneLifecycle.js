const { withAppDelegate, withInfoPlist } = require("expo/config-plugins");

// iOS 27 refuses to launch apps built with the iOS 27 SDK unless they adopt the
// scene-based life cycle. Expo SDK 57 ships `ExpoAppSceneDelegate` but its
// template still uses the old window-based AppDelegate, so the app crashes on
// launch. This applies the same changes as the Expo SDK 58 template.
// Delete this plugin after upgrading to Expo SDK 58 or later.

// The ObjC name of Expo's `ExpoAppSceneDelegate`, so no extra Swift file is needed.
const SCENE_DELEGATE_CLASS = "EXExpoAppSceneDelegate";

function withSceneManifest(config) {
  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: SCENE_DELEGATE_CLASS,
          },
        ],
      },
    };
    return config;
  });
}

function replaceOrThrow(contents, search, replacement, description) {
  if (contents.includes(replacement)) return contents;
  if (!contents.includes(search)) {
    throw new Error(
      `withSceneLifecycle: couldn't find ${description} in AppDelegate.swift. ` +
        "Expo's template may have changed; update plugins/withSceneLifecycle.js."
    );
  }
  return contents.replace(search, replacement);
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== "swift") {
      throw new Error("withSceneLifecycle: expected a Swift AppDelegate.");
    }
    let contents = config.modResults.contents;

    // The scene delegate reads the React Native factory from the app delegate.
    contents = replaceOrThrow(
      contents,
      "class AppDelegate: ExpoAppDelegate {",
      "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {",
      "the AppDelegate class declaration"
    );

    // The scene delegate now creates the window and starts React Native.
    contents = replaceOrThrow(
      contents,
      `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
`,
      `    // The window is created and React Native is started by the scene delegate
    // under the scene-based life cycle (required by the iOS 27 SDK).
`,
      "the window setup block"
    );

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = function withSceneLifecycle(config) {
  return withSceneAppDelegate(withSceneManifest(config));
};
