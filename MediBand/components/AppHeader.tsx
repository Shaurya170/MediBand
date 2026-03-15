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
  if (pathname.includes("addMedications")) return "Create Medication";
  if (pathname.includes("medications")) return "Medications";
  if (pathname.includes("editProfile")) return "Edit Profile";
  if (pathname.includes("about")) return "About";

  return "App";
}

export default function AppHeader() {

  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  async function handleLogout() {

    try {

      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert("Logout failed", error.message);
        return;
      }

      // Send user back to login screen
      router.replace("/");

    } catch (err: any) {
      Alert.alert("Logout failed", err?.message ?? "Unexpected error");
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

        <Text style={styles.title}>{title}</Text>

        <TouchableHighlight
          onPress={handleLogout}
          underlayColor={colors.accent}
          style={styles.logoutButton}
        >
          <MaterialIcons name="logout" size={26} color={colors.text} />
        </TouchableHighlight>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    width: "100%",
    height: 120,
    backgroundColor: colors.appHeader,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },

  logo: {
    width: 90,
    height: 90,
  },

  title: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "600",
    fontFamily: "Roboto",
    letterSpacing: 0.5,
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