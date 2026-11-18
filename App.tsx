/**
 * Reproduction: the native tab bar animates wrongly when it is hidden in the same
 * update that selects its tab from JS.
 *
 * - Home: "Hide / Show tab bar" toggles the bar with no tab switch involved
 *   (control case: the built-in animation plays correctly).
 * - Home: "Open Chat" selects the Chat tab from JS (`navigation.navigate`). The Chat
 *   screen (in a native stack) hides the tab bar while it is focused, with the
 *   documented `getParent()?.setOptions({ tabBarStyle })` pattern.
 * - Selecting the Chat tab by tapping it in the bar is fine: the native bar selects
 *   the tab before JS hides the bar.
 *
 * 1. Launch the app (or reload it) on an iOS 18 simulator.
 * 2. Tap "Hide / Show tab bar" a few times: the bar slides out and in correctly.
 * 3. Tap "Open Chat": the bar jumps up, then slides out.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStaticNavigation,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

const HIDDEN_TAB_BAR = { tabBarStyle: { display: 'none' } } as const;
const VISIBLE_TAB_BAR = { tabBarStyle: undefined };

function HomeScreen() {
  const navigation = useNavigation();
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);

  const toggleTabBar = () => {
    const nextIsHidden = !isTabBarHidden;
    navigation.setOptions(nextIsHidden ? HIDDEN_TAB_BAR : VISIBLE_TAB_BAR);
    setIsTabBarHidden(nextIsHidden);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={styles.actions}>
        <Button
          onPress={toggleTabBar}
          title={isTabBarHidden ? 'Show tab bar' : 'Hide tab bar'}
        />
        <Button
          onPress={() => navigation.navigate('ChatTab', { screen: 'Chat' })}
          title="Open Chat"
        />
      </View>
      {Array.from({ length: 30 }, (_, index) => (
        <Text key={index} style={styles.row}>
          Row {index + 1}
        </Text>
      ))}
    </ScrollView>
  );
}

function ChatScreen() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const tabNavigation = navigation.getParent();
      tabNavigation?.setOptions(HIDDEN_TAB_BAR);
      return () => tabNavigation?.setOptions(VISIBLE_TAB_BAR);
    }, [navigation]),
  );

  return (
    <View style={styles.chat}>
      <Text style={styles.title}>The tab bar is hidden on this screen</Text>
      <Button
        onPress={() => navigation.getParent()?.navigate('Home')}
        title="Back to Home"
      />
    </View>
  );
}

const ChatStack = createNativeStackNavigator({
  screens: {
    Chat: ChatScreen,
  },
});

const Tabs = createBottomTabNavigator({
  screens: {
    Home: {
      options: {
        tabBarIcon: { name: 'house', type: 'sfSymbol' },
      },
      screen: HomeScreen,
    },
    ChatTab: {
      options: {
        headerShown: false,
        tabBarIcon: { name: 'bubble.left', type: 'sfSymbol' },
        title: 'Chat',
      },
      screen: ChatStack,
    },
  },
});

type TabsType = typeof Tabs;

declare module '@react-navigation/core' {
  interface RootNavigator extends TabsType {}
}

const Navigation = createStaticNavigation(Tabs);

export default function App() {
  return <Navigation />;
}

const styles = StyleSheet.create({
  actions: {
    gap: 8,
    padding: 16,
  },
  chat: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  row: {
    fontSize: 17,
    padding: 16,
  },
  title: {
    fontSize: 17,
  },
});
