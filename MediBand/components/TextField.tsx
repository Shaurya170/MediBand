import colors from '@/styles/colors';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

type InputProps = {
  placeholder: string;
  onChangeText: (text: string) => void;
  value: string;
  secureTextEntry?: boolean;
};

const TextField = ({placeholder, onChangeText, value, secureTextEntry}: InputProps) => {
    
  return (
    <View style={styles.textInputContainer}>
      <TextInput 
        style={[styles.textInput, {height: 52}, {width: 200}]}
        placeholder ={placeholder}
        placeholderTextColor={colors.text}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  )
}
export default TextField

const styles = StyleSheet.create({
    textInputContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    textInput: {
        backgroundColor: colors.textField,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        borderColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    }
    
})