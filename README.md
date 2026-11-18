# react-native-screens: tab bar hide animation glitches when a tab is selected from JS

Minimal reproduction for an iOS issue with the native bottom tabs: when a tab is selected
**from JS** and the screen shown in it hides the tab bar as it gets focused, the first time
that tab is shown the bar jumps up by about its own height, then slides down out of the
screen.

The app has two tabs:

- **Home**
  - "Hide tab bar" / "Show tab bar" toggles the bar with no tab switch (control case).
  - "Open Chat" selects the Chat tab from JS (`navigation.navigate`).
- **Chat**: a native stack whose screen hides the tab bar while it is focused, with the
  documented `navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })`
  pattern, and shows it again when it loses focus.

## Steps

On an iOS 18 simulator:

1. Tap "Hide tab bar" / "Show tab bar" a few times: the bar slides out and in correctly.
2. Reload the app (Cmd+R), then tap "Open Chat": **the bar jumps up, then slides out.**
3. Tap "Back to Home", then "Open Chat" again: the bar slides out correctly.
4. Reload the app, then select Chat by tapping it in the tab bar: the bar slides out
   correctly, even the first time.

## Versions

| Package | Version |
| --- | --- |
| react-native | 0.88.1 |
| react-native-screens | 5.0.0-beta.1 (also reproduced with 4.30.1) |
| @react-navigation/native | 8.0.0-alpha.51 |
| @react-navigation/bottom-tabs | 8.0.0-alpha.57 |
| @react-navigation/native-stack | 8.0.0-alpha.59 |
| react-native-safe-area-context | 5.9.1 |

New Architecture (Fabric), Hermes, debug build. Reproduced on an iPhone 16 Pro simulator
(iOS 18.6).

## Running

```sh
npm install --legacy-peer-deps   # react-native-screens 5 is a prerelease, outside the
                                 # navigators' `>= 4.30.0` peer range for npm
cd ios && bundle install && bundle exec pod install && cd ..
npm start
npm run ios
```
