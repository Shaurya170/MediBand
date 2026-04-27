import Auth from "@/components/Auth";
import colors from "@/styles/colors";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (session?.user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>MediBand</Text>

        <Image
          source={require("../assets/images/MediBand_logo.png")}
          style={styles.logo}
        />

        <View style={styles.card}>
          <Auth />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  header: {
    fontSize: 42,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },

  card: {
    width: "100%",
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
  },
});
