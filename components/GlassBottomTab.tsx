import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_WIDTH = 200;

export default function GlassBottomTab({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <BlurView
        intensity={isDark ? 60 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark 
              ? 'rgba(0, 0, 0, 0.4)' 
              : 'rgba(255, 255, 255, 0.4)',
            borderColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
          }
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Get icon from options
          const iconName = options.tabBarIcon 
            ? (options.tabBarIcon as any)({ 
                focused: isFocused, 
                color: isFocused 
                  ? Colors[colorScheme ?? 'light'].tint 
                  : Colors[colorScheme ?? 'light'].tabIconDefault,
                size: 24 
              })
            : null;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <View style={[
                styles.iconContainer,
                isFocused && {
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(0, 0, 0, 0.08)',
                }
              ]}>
                {iconName}
              </View>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: (SCREEN_WIDTH - TAB_BAR_WIDTH) / 2,
    width: TAB_BAR_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    gap: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap:10
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
