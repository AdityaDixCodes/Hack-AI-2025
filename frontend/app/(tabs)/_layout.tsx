import React from "react";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View, StatusBar, Dimensions } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { colors } from "@/constants/colors";
import { Home, MessageSquare, Settings, PieChart, BookOpen } from "lucide-react-native";
import { router } from "expo-router";

const { width } = Dimensions.get('window');

export default function TabLayout() {
  return (
    <SafeAreaProvider style={styles.container}>
      {/* Set status bar to transparent */}
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray[400],
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 55,
            overflow: 'visible',
            borderRadius: 40,
            marginBottom: 25,
            marginHorizontal: Math.max(20, (width - 320) / 2), // Responsive margins
            borderColor: 'rgba(238, 238, 238, 0.67)',
            shadowColor: '#9b4dca',
            shadowOffset: { 
              width: 10, 
              height: 20 
            },
            shadowOpacity: 0.95,
            shadowRadius: 40,
            zIndex: 1, // Ensure tab bar stays above content
          },
          headerShown: false,
          tabBarItemStyle: {
            height: 50,
            paddingVertical: 5,
          },
          tabBarLabelStyle: {
            marginBottom: Platform.OS === 'ios' ? 5 : 0,
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarBackground: () => (
            <View 
              style={[
                StyleSheet.absoluteFillObject,
                styles.tabBarBackground
              ]}
            >
              <View style={styles.blurContainer}>
                <BlurView
                  tint="dark"
                  intensity={40}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[
                  StyleSheet.absoluteFill,
                  styles.overlay
                ]} />
              </View>
            </View>
          ),
        }}
        sceneContainerStyle={styles.sceneContainer}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
            headerTitle: "PiFi",
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
            headerTitle: "Your Chats",
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <PieChart size={22} color={color} />,
            headerTitle: "Financial Insights",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
            headerTitle: "Settings",
          }}
        />
        <Tabs.Screen
          name="quiz"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
            headerTitle: "Financial Quiz",
            href: null,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sceneContainer: { 
    backgroundColor: 'transparent' 
  },
  tabBarBackground: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  }
});
