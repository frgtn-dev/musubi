import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { InterTight_400Regular, InterTight_500Medium } from '@expo-google-fonts/inter-tight';
import { NotoSerif_400Regular } from '@expo-google-fonts/noto-serif';
import { ShipporiMinchoB1_400Regular } from '@expo-google-fonts/shippori-mincho-b1';
import { authClient } from '@/services/auth-client';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    if ((loaded || error) && !isPending) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error, isPending]);

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
    < Stack screenOptions={{ headerShown: false }} />
  );
}
