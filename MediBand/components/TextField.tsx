import colors from "@/styles/colors";
import { StyleSheet, TextInput, View } from "react-native";

type InputProps = {
  placeholder: string;
  onChangeText: (text: string) => void;
  value: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  numberOfLines?: number;
  style?: any; // for custom styling if needed
};

const TextField = ({
  placeholder,
  onChangeText,
  value,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
  numberOfLines,
  style,
}: InputProps) => {
  return (
    <View style={styles.textInputContainer}>
      <TextInput
        style={[styles.textInput, style]}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText} // Better contrast
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCorrect={false}
      />
    </View>
  );
};

export default TextField;

const styles = StyleSheet.create({
  textInputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: colors.textField,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: colors.text,
  },
});
