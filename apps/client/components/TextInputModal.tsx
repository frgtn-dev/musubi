import { colors, fonts, styles } from "@/constants/theme";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import Animated from "react-native-reanimated";
import { Modal, Pressable, TextInput, View, Text } from "react-native";
import { useState } from "react";


type Props = {
  visible: boolean,
  isDelete?: boolean,
  title: string,
  placeholder: string,
  onConfirm: (value: string) => void,
  onClose: () => void,
  onTest?: (value: string) => Promise<{ ok: boolean, error: string }>,
}


export default function InputModal({ visible, isDelete, title, placeholder, onConfirm, onClose, onTest }: Props) {
  const { fadeStyle, handleClose } = useModalAnimation(visible, onClose);
  const [inputValue, setInputValue] = useState("");
  const [valueError, setValueError] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);

  const handleConfirm = async (value: string) => {
    setIsWaiting(true);
    if (onTest) {
      const { ok, error } = await onTest(value);
      if (!ok) {
        setValueError(error ?? "Uknown error...");
        setIsWaiting(false);
        return;
      }
    }
    onConfirm(value);
    handleClose();
    setIsWaiting(false);
  };

  const handleCancel = async () => {
    handleClose();
    setInputValue("");
    setValueError("");
    setIsWaiting(false);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
      transparent={true}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.modalOverlay, fadeStyle]}>
        <Pressable style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View
        style={[{
          width: "80%",
          minHeight: "10%",
          position: "absolute",
          alignSelf: "center",
          justifyContent: "center",
          top: "35%",
        }, fadeStyle]}
      >
        <View
          style={{
            gap: 16,
            backgroundColor: colors.bg3,
            padding: 16,
            borderRadius: 15,
          }}
        >
          <Text style={{ color: colors.fg, fontFamily: fonts.serif, fontSize: 18 }}>{title}</Text>
          <TextInput
            style={{
              width: "100%",
              padding: 12,
              borderWidth: 1,
              borderColor: colors.line3,
              borderRadius: 10,
              backgroundColor: colors.bg2,
              color: colors.fg,
              fontFamily: fonts.sans,
              fontSize: 15,
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.fg4}
            onChangeText={(t) => setInputValue(t)}
          />
          {valueError ? <Text style={[styles.errorText, { alignSelf: "center" }]}>{valueError}</Text> : null}
          <View style={{
            flexDirection: "row",
            gap: 16,
          }}
          >
            <Pressable style={styles.btnSecondary} onPress={handleCancel}>
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={isWaiting ? styles.btnDisabled : (isDelete ? styles.btnRemove : styles.btnPrimary)}
              disabled={isWaiting}
              onPress={() => handleConfirm(inputValue)}
            >
              <Text style={styles.btnPrimaryText}>{isDelete ? "Delete" : "Confirm"}</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </Modal >
  );
}
