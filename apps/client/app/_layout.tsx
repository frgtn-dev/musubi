import { ServerProvider, useServer } from '@/contexts/ServerContext';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { InterTight_400Regular, InterTight_500Medium } from '@expo-google-fonts/inter-tight';
import { NotoSerif_400Regular } from '@expo-google-fonts/noto-serif';
import { ShipporiMinchoB1_400Regular } from '@expo-google-fonts/shippori-mincho-b1';
import { colors, styles } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';


SplashScreen.preventAutoHideAsync();

function AppContent() {

  const { isLoading, authClient } = useServer();

  const [loaded, error] = useFonts({
    InterTight_400Regular,
    InterTight_500Medium,
    NotoSerif_400Regular,
    ShipporiMinchoB1_400Regular,
  });

  const router = useRouter();
  const segments = useSegments();
  const inAuthGroup = segments[0] === "(auth)";
  const inInviteGroup = segments[0] === "invite";

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if ((loaded || error) && !isPending && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isPending, isLoading]);

  useEffect(() => {
    if (isPending || !loaded) return;
    if (!session && !inAuthGroup && !inInviteGroup) {
      router.replace("/(auth)/welcome");
    }
    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, loaded, isPending, inAuthGroup]);

  if (!loaded && !error || isPending) return null;

  return (
    <Stack screenOptions={{ statusBarStyle: "auto", navigationBarHidden: true, headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
  );
}

function AppLoader() {
  const { apiUrl } = useServer();
  return (
    <SafeAreaView style={styles.screen} >
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <AppContent key={apiUrl ?? 'loading'} />
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <ServerProvider>
      <AppLoader />
    </ServerProvider>
  );
}
