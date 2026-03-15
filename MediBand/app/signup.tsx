import MyButton from '@/components/MyButton';
import TextField from '@/components/TextField';
import colors from '@/styles/colors';
import { supabase } from '@/utils/supabase';
import { Checkbox } from 'expo-checkbox';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, AppStateStatus, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const Signup: React.FC = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showText, setShowText] = useState(false);

  useEffect(() => {

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => subscription.remove();

  }, []);

  async function signUpWithEmail() {

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      Alert.alert(error.message);
    }
  }

  const handleAuthSignUp = () => {

    const hasNumber = /\d/.test(password);

    if (email.length >= 6 && password.length >= 6 && hasNumber) {
      signUpWithEmail();
      router.replace("/(tabs)");
    } else {
      Alert.alert("Invalid email or password");
    }
  };

  return (

    <SafeAreaView style={styles.container}>

      <TextField
        placeholder="email"
        value={email}
        onChangeText={setEmail}
      />

      <TextField
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showText}
      />

      <View style={styles.checkContainer}>
        <Text>Show Password</Text>

        <Checkbox
          value={showText}
          onValueChange={setShowText}
          color={showText ? "#1F9D00" : undefined}
        />
      </View>

      <MyButton
        title="Sign Up"
        onPress={handleAuthSignUp}
        color={colors.button}
        textColor={colors.text}
        viewStyle={styles.buttonStyle}
      />

    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({

  container: {
    backgroundColor: colors.background,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  checkContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 5
  },

  buttonStyle: {
    height: 40,
    width: 150,
    borderWidth: 3,
    borderColor: "black",
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  }

});