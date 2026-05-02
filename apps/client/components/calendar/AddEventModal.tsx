import { colors, fonts, styles } from "@/constants/theme";
import { useEffect, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useModalAnimation } from "@/hooks/useModalAnimation";
import { Calendar, Event } from "@/constants/types";
import { appColors } from "@/constants/colors";
import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { authClient } from "@/services/auth-client";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (event: Event) => Promise<void>;
  onEdit: (event: Event) => Promise<void>;
  calendars: Calendar[];
  event?: Event;
};

export function AddEventModal({ visible, onClose, onSave, onEdit, calendars, event }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState(new Date());
  const [newEnd, setNewEnd] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedCals, setSelectedCals] = useState<Set<string>>(
    () => new Set(calendars.slice(0, 1).map(c => c.id))
  );
  const [newColor, setNewColor] = useState(appColors[0].color);
  const [isLoading, setIsLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [calendarsError, setCalendarsError] = useState("");
  const [startError, setStartError] = useState("");
  const [endError, setEndError] = useState("");

  const { data: session } = authClient.useSession();
  const userID = session?.user.id;

  const closeSequence = () => {
    onClose();

    setNewTitle('');
    setNameError("");
    setNewStart(new Date());
    setStartError("");
    setNewEnd(new Date());
    setEndError("");
    setSelectedCals(new Set(calendars.slice(0, 1).map(c => c.id)));
    setCalendarsError("");
  }

  const { slideStyle, fadeStyle, gesture, handleClose } = useModalAnimation(visible, closeSequence);

  useEffect(() => {
    if (visible) {
      setNewTitle(event?.title ?? "");
      setNewStart(event?.start ?? new Date());
      setNewEnd(event?.end ?? new Date());
      setSelectedCals(new Set(event?.calendars) ?? new Set<string>);
    }
  }, [event, visible]);

  const toggleCal = (id: string) => {
    setSelectedCals(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const showPicker = (mode: 'start' | 'end') => {
    const current = mode === 'start' ? newStart : newEnd;
    const setter = mode === 'start' ? setNewStart : setNewEnd;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        onChange: (e, date) => {
          if (e.type === 'set' && date) {
            DateTimePickerAndroid.open({
              value: date,
              mode: 'time',
              onChange: (e2, finalDate) => {
                if (e2.type === 'set' && finalDate) setter(finalDate);
              },
            });
          }
        },
      });
    } else {
      mode === 'start' ? setShowStartPicker(true) : setShowEndPicker(true);
    }
  };



  const handleSave = async () => {

    const eventConstruct: Event = {
      id: event?.id ?? "create",
      creatorID: userID!,
      calendars: [...selectedCals],
      title: newTitle,
      color: newColor,
      start: newStart,
      end: newEnd,
    }

    let passed: boolean = true;

    if (newTitle.length === 0) {
      setNameError("I mean... At least one letter please...");
      passed = false;
    } else {
      setNameError("");
    }
    if ([...selectedCals].length === 0) {
      setCalendarsError("Event needs some cozy place... Give it atleast one...");
      passed = false;
    } else {
      setCalendarsError("");
    }
    if (newStart.getTime() > newEnd.getTime()) {
      setStartError("I don't think so...");
      setEndError("I should probably be the one in front...");
      passed = false;
    } else {
      setStartError("");
      setEndError("");
    }

    if (!passed) {
      return;
    }

    setIsLoading(true);

    try {
      if (event) {
        onEdit(eventConstruct);
      } else {
        onSave(eventConstruct);
      }
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert("Failed to save", e?.message ?? "An unexpected error occured.");
    }
    setIsLoading(false);
    handleClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        onRequestClose={handleClose}
        animationType="none"
        transparent={true}
        statusBarTranslucent={true}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Animated.View style={[styles.modalOverlay, fadeStyle]}>
            <Pressable style={{ flex: 1 }} onPress={handleClose} />
          </Animated.View>
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.modalSheet, fadeStyle, slideStyle]}>
              <View style={styles.modalHandle} />

              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>{event ? "Edit Event" : "New Event"}</Text>
              </View>

              <ScrollView>
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.sans }]}>Title</Text>
                  <TextInput
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder="Stalking girls at night..."
                    placeholderTextColor={colors.fg4}
                    style={[styles.fieldValueBig, { fontFamily: fonts.sans }]}
                  />
                  {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.sans }]}>Calendars</Text>
                  <ScrollView
                    horizontal
                  >
                    <View style={styles.horizontalPillView}>
                      {calendars.map((cal) => {
                        const active = selectedCals.has(cal.id);
                        return (
                          <Pressable
                            key={cal.id}
                            onPress={() => toggleCal(cal.id)}
                            style={active ? styles.pillActive : styles.pill}
                          >
                            <View style={[styles.colorDot, { backgroundColor: cal.color, opacity: active ? 1 : 0.4 }]} />
                            <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: active ? colors.fg : colors.fg3 }}>
                              {cal.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                  {calendarsError ? <Text style={styles.errorText}>{calendarsError}</Text> : null}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.sans }]}>Colors</Text>
                  <ScrollView
                    horizontal
                  >
                    <View style={styles.horizontalPillView}>
                      {appColors.map((c) => (
                        <Pressable
                          key={c.name}
                          style={{
                            overflow: "hidden",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: 18,
                          }}
                          onPress={() => setNewColor(c.color)}
                        >
                          <View style={[styles.calendarCircle, {
                            borderWidth: c.color === newColor ? 2 : 1,
                            borderColor: c.color === newColor ? colors.fg3 : colors.line3,
                          }]}>
                            <View style={[styles.calendarCircleInner, { backgroundColor: c.color }]} />
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>


                <Pressable style={styles.fieldContainer} onPress={() => showPicker("start")}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.sans }]}>Start</Text>
                  <Text style={[styles.fieldValueText, { fontFamily: fonts.sans }]}>
                    {newStart.toLocaleString('en-UK', { dateStyle: 'medium', timeStyle: 'short' })}
                  </Text>
                  {startError ? <Text style={styles.errorText}>{startError}</Text> : null}
                </Pressable>

                {Platform.OS === 'ios' && showStartPicker && (
                  <DateTimePicker value={newStart} mode="datetime"
                    onChange={(e, date) => { setShowStartPicker(false); if (e.type === 'set' && date) setNewStart(date); }}
                  />
                )}

                <Pressable style={styles.fieldContainer} onPress={() => showPicker("end")}>
                  <Text style={[styles.fieldLabel, { fontFamily: fonts.sans }]}>End</Text>
                  <Text style={[styles.fieldValueText, { fontFamily: fonts.sans }]}>
                    {newEnd.toLocaleString('en-UK', { dateStyle: 'medium', timeStyle: 'short' })}
                  </Text>
                  {endError ? <Text style={styles.errorText}>{endError}</Text> : null}
                </Pressable>

                {Platform.OS === 'ios' && showEndPicker && (
                  <DateTimePicker value={newEnd} mode="datetime"
                    onChange={(e, date) => { setShowEndPicker(false); if (e.type === 'set' && date) setNewEnd(date); }}
                  />
                )}
              </ScrollView>
              <View style={styles.modalButtons}>
                <Pressable style={styles.btnSecondary} onPress={handleClose}>
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={isLoading ? [styles.btnPrimary, { backgroundColor: colors.line }] : styles.btnPrimary}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Text style={styles.btnPrimaryText}>{event ? "Save" : "Create"}</Text>
                </Pressable>
              </View>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal >
    </>
  );
}
