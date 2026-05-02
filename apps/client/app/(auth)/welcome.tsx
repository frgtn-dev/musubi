import { colors, fonts, styles } from "@/constants/theme";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={{ alignItems: "center", justifyContent: "space-between", flex: 1, paddingTop: 60, paddingBottom: 60 }}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.fg, fontSize: 72, fontFamily: fonts.serif }}>
            お結び
          </Text>
          <Text style={{ color: colors.fg3 }}>
            MUSUBI
          </Text>
        </View>
        <View style={{ alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Text style={{ color: colors.fg, fontSize: 28, fontFamily: fonts.serif, textAlign: "center", lineHeight: 32, paddingBottom: 8 }}>
            To tie a knot{"\n"}with your closest...
          </Text>
          <Text style={{ color: colors.fg3, fontSize: 16, fontFamily: fonts.serif, textAlign: "center" }}>
            A quiet, shared space for time — {"\n"}
            for two, or for a small circle of trust.
          </Text>
        </View>
        <View style={styles.modalButtonsColumn}>
          <Pressable
            style={styles.btnPrimary}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text style={styles.btnPrimaryText}>
              Create account
            </Text>
          </Pressable>
          <Pressable
            style={styles.btnSecondary}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={styles.btnSecondaryText}>
              Login
            </Text>
          </Pressable>
          <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.fg4, textAlign: "center" }}>
            By continuing you accept the terms and
            our quiet privacy promise.
          </Text>
        </View>
      </View >
    </SafeAreaView >
  );
}
