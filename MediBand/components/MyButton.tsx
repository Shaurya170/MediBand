import colors from '@/styles/colors';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableHighlight,
  ViewStyle
} from 'react-native';

type PropsType = {
  title: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  viewStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const MyButton: React.FC<PropsType> = ({
  title,
  onPress,
  color = colors.button,
  textColor = colors.text,
  viewStyle,
  textStyle
}) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      underlayColor={colors.accent}
      style={[styles.button, { backgroundColor: color }, viewStyle]}
    >
      <Text style={[styles.buttonText, { color: textColor }, textStyle]}>
        {title}
      </Text>
    </TouchableHighlight>
  );
};

export default MyButton;

const styles = StyleSheet.create({
  button: {
    height: 70,
    width: 200,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15
  },

  buttonText: {
    fontSize: 28,
    fontWeight: '600'
  }
});