//import AppHeader from "@/components/AppHeader";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
//import Auth from "../components/Auth";
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
    <View style={{ flex: 1 }}>
      
    </View>
  );
}
const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: "212922",
    flexDirection: "column",
  },
  text:{
    fontSize: 70,
    fontFamily: "Jua",
    color: "F7F4EB"
  }
});


