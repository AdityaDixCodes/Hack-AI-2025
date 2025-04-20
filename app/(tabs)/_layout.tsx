import React from "react";
import { Tabs } from "expo-router";
import { colors } from "@/constants/colors";
import { Home, MessageSquare, Settings, PieChart } from "lucide-react-native";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

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
            position: 'absolute', // Position tab bar absolutely
            backgroundColor: 'transparent', // Fully transparent background
            borderTopWidth: 0, // Remove top border
            elevation: 0, // Remove Android shadow
            shadowOpacity: 0, // Remove iOS shadow
            height: 55, // Keep height for better touch targets
            overflow: 'visible', // Ensure the background blur stays within bounds
            borderRadius: 40, // Rounded corners
            marginBottom: 25, // Add space from bottom edge
            marginHorizontal: 80, // Add space from side edges
            borderColor: 'rgba(238, 238, 238, 0.67)', // Semi-transparent white border
            // Modified shadow properties for a subtle effect without the purple space
            shadowColor: '#9b4dca',
            shadowOffset: { width: 10, height: 20 },
            shadowOpacity: 0.95,
            shadowRadius: 40,
          },
          headerShown: false, // Hide the header completely
          tabBarItemStyle: {
            height: 50,
            paddingVertical: 5,
          },
          tabBarLabelStyle: {
            marginBottom: Platform.OS === 'ios' ? 5 : 0,
            fontSize: 12,
          },
          // Custom tab bar background component using blur effect
          tabBarBackground: () => (
            <View style={{
              ...StyleSheet.absoluteFillObject,
              overflow: 'hidden', // Changed to 'hidden' to prevent overflow
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <View style={{
                width: '100%',
                height: '100%',
                borderRadius: 35, // Match the container's borderRadius
                overflow: 'hidden',
              }}>
                <BlurView
                  tint="dark"
                  intensity={40}
                  style={StyleSheet.absoluteFill}
                />
                <View style={{
                  ...StyleSheet.absoluteFill,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }} />
              </View>
            </View>
          )
          
        }}
        // Remove any potential background color from the tabs container
        sceneContainerStyle={{ backgroundColor: 'transparent' }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <PieChart size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
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
  }
});