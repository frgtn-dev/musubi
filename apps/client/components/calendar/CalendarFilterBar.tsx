import { memo } from "react";
import { colors, fonts } from "@/constants/theme";
import { View } from "react-native";
import { Pressable, ScrollView, Text } from "react-native";

type Calendar = { id: string; name: string; color: string };

type Props = {
  calendars: Calendar[];
  activeCals: Set<string>;
  onToggle: (id: string) => void;
};

export const CalendarFilterBar = memo(function CalendarFilterBar({ calendars, activeCals, onToggle }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexShrink: 0, flexDirection: "row", backgroundColor: colors.bg1, borderBottomWidth: 1, borderBottomColor: colors.line, maxHeight: 52 }}
      contentContainerStyle={{ padding: 10, gap: 6, alignItems: "center" }}
    >
      {calendars.map((cal) => (
        <Pressable
          key={cal.id}
          onPress={() => onToggle(cal.id)}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
            borderWidth: 1,
            borderColor: activeCals.has(cal.id) ? colors.line3 : colors.line,
            backgroundColor: activeCals.has(cal.id) ? colors.bg2 : colors.line,
          }}
        >
          <View style={{
            width: 7, height: 7, borderRadius: 4,
            backgroundColor: cal.color,
            opacity: activeCals.has(cal.id) ? 1 : 0.5,
          }} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: activeCals.has(cal.id) ? colors.fg : colors.fg3 }}>
            {cal.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
});
