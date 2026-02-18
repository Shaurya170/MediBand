import colors from '@/styles/colors';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableHighlight, View, ViewStyle } from 'react-native';
// defining the props the use of this component
// is allowed to pass in , this lets the compent 
// be reusable and customizable
// this data thpe is defined befero the const line

type propsType = {
  title: string; // notice the s is lower case. it is semicolon here. style is comma
  color?: string;
  textColor?: string;
  onPress: () => void;
  viewStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>
  
};

const MyButton: React.FC<propsType> = ({
  title,
  onPress,
  color = 'gray',
  textColor = 'black',
  viewStyle,
  textStyle,
  
  
}) => {


return (
  <View>
    <TouchableHighlight
      onPress={onPress}
      underlayColor={colors.accent}
      style={[viewStyle, {backgroundColor: colors.button}]}
    >
    <Text style={[textStyle, {color: colors.text}]}>{title}</Text>
    </TouchableHighlight>
  </View>
  )
}

export default MyButton

const styles = StyleSheet.create({
    button:{
        backgroundColor: colors.background,
        height: 70,
        width: 200,
        borderWidth: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,

    },
    buttonText: {
      fontSize: 41,
      color: colors.accent,
  },
})