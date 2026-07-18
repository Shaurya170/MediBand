import { useAuth } from "@/components/AuthProvider"; // ← Add this
import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, usePathname } from "expo-router";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";

function getTitleFromPath(pathname: string) {
  if (pathname === "/") return "Welcome";
  if (pathname.includes("index")) return "Home";
  if (pathname.includes("addMedications")) return "Add Medication";
  if (pathname.includes("medications")) return "Medications";
  if (pathname.includes("editProfile")) return "Edit Profile";
  if (pathname.includes("about")) return "About";

  return "App";
}

export default function AppHeader() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);
  const { session } = useAuth(); // ← Add this

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert("Logout Failed", error.message);
        return;
      }

      // Clear session and redirect to login
      router.replace("/");
    } catch (err: any) {
      Alert.alert("Logout Failed", err?.message ?? "Something went wrong");
    }
  }

  return (
    <View style={styles.container}>
      {/* LEFT SIDE (LOGO) */}
      <View style={styles.leftContainer}>
        <Image
          source={require("../assets/images/MediBand_logo.png")}
          style={styles.logo}
        />
      </View>

      {/* RIGHT SIDE (TITLE + LOGOUT) */}
      <View style={styles.rightContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {session && ( // ← Only show logout when logged in
          <TouchableHighlight
            onPress={handleLogout}
            underlayColor={colors.accent}
            style={styles.logoutButton}
          >
            <MaterialIcons name="logout" size={26} color={colors.text} />
          </TouchableHighlight>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 120,
    backgroundColor: colors.card,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 20,
  },

  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  rightContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },

  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "600",
    fontFamily: "Gill Sans",
    letterSpacing: 0.5,
    flexShrink: 1,
  },

  logo: {
    width: 90,
    height: 90,
  },

  logoutButton: {
    backgroundColor: colors.button,
    borderRadius: 8,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
