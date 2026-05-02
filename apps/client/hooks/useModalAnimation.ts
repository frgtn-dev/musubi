import { useEffect } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";


export function useModalAnimation(visible: boolean, onClose: () => void) {
  const offScreen = Dimensions.get("screen").height / 5;
  const slideAnim = useSharedValue(offScreen);
  const fadeAnim = useSharedValue(0);
  const gesture = Gesture.Pan()
    .onChange((ev) => {
      if (ev.translationY > 0) {
        slideAnim.value = ev.translationY;
      }
    })
    .onEnd((ev) => {
      if (ev.translationY > 100) {
        fadeAnim.value = withTiming(0, { duration: 180 }, () => scheduleOnRN(onClose));
        slideAnim.value = withTiming(offScreen, { duration: 280 });
      } else {
        slideAnim.value = withTiming(0, { duration: 280 });
      }
    });

  function handleClose() {
    slideAnim.value = withTiming(offScreen, { duration: 280 });
    fadeAnim.value = withTiming(0, { duration: 180 }, () => scheduleOnRN(onClose));
  }

  useEffect(() => {
    if (visible) {
      slideAnim.value = withTiming(0, { duration: 280 });
      fadeAnim.value = withTiming(1, { duration: 180 });
    }
  }, [visible]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }]
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  return { slideStyle, fadeStyle, gesture, handleClose }
}
