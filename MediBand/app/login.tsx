import MyButton from '@/components/MyButton';
import TextField from '@/components/TextField';
import colors from '@/styles/colors';
import { supabase } from '@/utils/supabase';
import { Checkbox } from 'expo-checkbox';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, AppStateStatus, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
const login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showText, setShowText] = useState(false);

    /*
    Supabase uses background token refresh.
    We start/stop it based on app state.
  */
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
      handleAppStateChange,
    );

    if (AppState.currentState === "active") {
      supabase.auth.startAutoRefresh();
    }

    return () => {
      if (typeof subscription?.remove === "function") {
        subscription.remove();
      }
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

    if (error) {
      Alert.alert(error.message);
    }
  }

    const handleAuthSignIn = () => {
    const hasNumber = /\d/.test(password);  //used chatgpt --> https://chatgpt.com/s/t_697cb41288bc8191a18d989ad8570283

    if(email.length >= 6 && password.length >= 6 && hasNumber){
        signInWithEmail()
        console.log("signed in")
    }
    else{
        console.log("your email or password is not long enough")
    }
    }

    return(
    <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View >
            <TextField 
                placeholder='email'
                value={email}
                onChangeText={setEmail}
            />
            <TextField 
                placeholder='password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showText}
            />
          </View>
          <View style={styles.checkContainer}>
            <Text>Show Password</Text>
            <Checkbox
                value={showText}
                onValueChange={setShowText}
                color={showText ? "#1F9D00" : undefined}
            />
          </View>
            <MyButton
                title = "Login" 
                onPress={handleAuthSignIn}
                color = {colors.button}
                textColor = {colors.text}
                viewStyle={styles.buttonStyle}
            />
        </View>
    </SafeAreaView>
    
  )
}

export default login

const styles = StyleSheet.create({
container: {
    backgroundColor: colors.background,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: "column",
},
checkContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 5,
},
buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,

},
buttonStyle:{
    height: 40,
    width: 150,
    borderWidth: 3,
    //borderColor: "black",
    //borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: "center",
}
})