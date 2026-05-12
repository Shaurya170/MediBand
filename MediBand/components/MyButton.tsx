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
};

const MyButton: React.FC<PropsType> = ({
  title,
  onPress,
  color = colors.button,
  textColor = colors.text,
  icon,
  viewStyle,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.button, { backgroundColor: color }, viewStyle]}
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
    height: 50,
    width: 180,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
