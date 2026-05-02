import { SettingRowOptions, SettingRowToggle } from "@/components/SettingRow";
import { colors, fonts, styles } from "@/constants/theme";
import { authClient } from "@/services/auth-client";
import { useSettingsStore } from "@/store/useSettingsStore";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Settings() {
  const {
    defaultCalendarView, setDefaultCalendarView,
    weekStartsOn, setWeekStartsOn,
    showKanji, setShowKanji,
  } = useSettingsStore();

  const userSession = authClient.useSession();

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 26, color: colors.fg }}>
          Settings
        </Text>
      </View>
      <ScrollView>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderTopWidth: 1,
            borderColor: colors.line,
            gap: 16
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: colors.fg2,
              textDecorationLine: "underline"
            }}
          >
            User Info
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, color: colors.fg2 }}>
              Name:
            </Text>
            <Text style={{ fontSize: 14, color: colors.fg2 }}>
              {userSession.data?.user.name}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, color: colors.fg2 }}>
              Email:
            </Text>
            <Text style={{ fontSize: 14, color: colors.fg2 }}>
              {userSession.data?.user.email}
            </Text>
          </View>
          <Pressable
            style={styles.btnRemove}
            onPress={() => authClient.signOut()}
          >
            <Text style={styles.btnPrimaryText}>
              Sign Out
            </Text>
          </Pressable>
        </View>
        <SettingRowToggle
          label="Show Kanji"
          toggle={showKanji}
          onToggle={() => setShowKanji(showKanji ? false : true)}
        />
        <SettingRowOptions
          label="Default Calendar View"
          value={defaultCalendarView}
          options={["month", "week", "day"]}
          onChange={v => setDefaultCalendarView(v)}
        />
        <SettingRowOptions
          label="Week Starts on"
          value={weekStartsOn}
          options={["sunday", "monday"]}
          onChange={v => setWeekStartsOn(v)}
        />
      </ScrollView>
    </SafeAreaView >
  );
}
