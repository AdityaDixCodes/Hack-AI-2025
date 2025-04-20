import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, View, StyleSheet } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "@/store/user-store";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This component handles the initial routing based on onboarding status
function InitialLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { isOnboarded } = useUserStore();

  useEffect(() => {
    // Only run this effect once when the app loads
    const inAuthGroup = segments[0] === "(tabs)";
    
    if (!isOnboarded && inAuthGroup) {
      // If the user hasn't completed onboarding, redirect to onboarding
      router.replace("/onboarding");
    } else if (isOnboarded && segments[0] === "onboarding") {
      // If the user has completed onboarding but is on the onboarding screen, redirect to home
      router.replace("/");
    }
  }, [isOnboarded, segments]);

  return <RootLayoutNav />;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider style={styles.container}>
        <StatusBar style="dark" translucent />
        <InitialLayout />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{
      headerTransparent: true,
      headerStyle: { backgroundColor: 'transparent' },
      contentStyle: { backgroundColor: 'transparent' },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="chat/[id]"
        options={{
          headerTitle: "Financial Analysis",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen 
        name="onboarding"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});