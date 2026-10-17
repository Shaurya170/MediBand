import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import colors from "../styles/colors";

type PropsType = {
  title?: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  icon?: React.ReactNode;
  viewStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean; // New: make button full width
  height?: number; // New: custom height
  disabled?: boolean;
};

const MyButton: React.FC<PropsType> = ({
  title,
  onPress,
  color = colors.button,
  textColor = colors.text,
  icon,
  viewStyle,
  textStyle,
  fullWidth = false,
  height = 50,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor: color, height },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        viewStyle,
      ]}
    >
      <View style={styles.content}>
        {icon}
        {title && (
          <Text style={[styles.buttonText, { color: textColor }, textStyle]}>
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MyButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 16, // Modern rounded look
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  fullWidth: {
    width: "100%",
  },

  disabled: {
    opacity: 0.5,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
