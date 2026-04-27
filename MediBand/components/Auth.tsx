import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../styles/colors";
import MyButton from "./MyButton";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        try {
          supabase.auth.stopAutoRefresh();
        } catch {}
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    if (AppState.currentState === "active") {
      supabase.auth.startAutoRefresh();
    }

    return () => {
      subscription.remove();
      try {
        supabase.auth.stopAutoRefresh();
      } catch {}
    };
  }, []);

  async function signInWithEmail() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
  }

  async function signUpWithEmail() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.subText}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        {/* PASSWORD WITH EYE ICON */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor={colors.subText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showText}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowText(!showText)}
          >
            <Ionicons
              name={showText ? "eye-off" : "eye"}
              size={22}
              color={colors.subText}
            />
          </TouchableOpacity>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <MyButton
            title="Sign Up"
            onPress={signUpWithEmail}
            color={colors.button}
            textColor={colors.text}
            viewStyle={styles.button}
          />

          <MyButton
            title="Login"
            onPress={signInWithEmail}
            color={colors.button}
            textColor={colors.text}
            viewStyle={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

export default Auth;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },

  form: {
    width: "100%",
    gap: 15,
  },

  input: {
    width: "100%",
    height: 50,
    backgroundColor: colors.textField,
    borderRadius: 12,
    paddingHorizontal: 15,
    color: colors.text,
  },

  passwordContainer: {
    width: "100%",
    justifyContent: "center",
  },

  eyeIcon: {
    position: "absolute",
    right: 15,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  button: {
    width: "48%",
    height: 45,
    borderRadius: 12,
  },
});
