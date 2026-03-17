import Auth from "@/components/Auth";
import colors from "@/styles/colors";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../components/AuthProvider";

export default function Index() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (session?.user) {
      router.replace("/(tabs)");
    }
  }, [router, session]);

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (session?.user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>MediBand</Text>
      <Auth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212922",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    fontSize: 70,
    fontFamily: "Jua",
    color: colors.text,
  },

  buttonContainer: {
    margin: 10,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonStyle: {
    backgroundColor: colors.button,
  },

  buttonText: {
    color: colors.text,
    fontFamily: "Jua",
    fontSize: 30,
  },
});
