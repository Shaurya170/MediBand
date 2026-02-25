//import AppHeader from "@/components/AppHeader";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
//import Auth from "../components/Auth";
import MyButton from "@/components/MyButton";
import colors from "@/styles/colors";
import { useAuth } from "../components/AuthProvider";

/*
  This screen is the app's gatekeeper.

  Logic:
  - If auth is loading → show spinner
  - If logged in → redirect to tabs
  - If not logged in → show Auth UI
*/
export default function Index() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (session?.user) {
      // Replace prevents going "back" to login screen
      router.replace("/(tabs)/about");
      console.log("in home page now")
    }
  }, [router, session]);

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (session?.user) {
    // Redirecting — nothing to render
    console.log("null returned")
    return null;
    
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>MediBand</Text>
      <View style={styles.buttonContainer}>
        <MyButton 
        title="Sign Up"
        onPress={() => router.push("/signup")}
        viewStyle={styles.buttonStyle}
        textStyle={styles.buttonText}
        />
        <MyButton 
        title="Login"
        onPress={() => router.push("/login")}
        viewStyle={styles.buttonStyle}
        textStyle={styles.buttonText}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: "212922",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

  },
  header:{
    fontSize: 70,
    fontFamily: "Jua",
    color: "F7F4EB"
  },
  buttonContainer:{
    margin: 10,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonStyle:{
    backgroundColor: colors.button
  },
  buttonText:{
    color: "F7F4EB",
    fontFamily: "Jua",
    fontSize: 30,
  }
});


