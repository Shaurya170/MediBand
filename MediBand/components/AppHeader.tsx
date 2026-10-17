import { useAuth } from "@/components/AuthProvider";
import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AppHeader() {
  const { session } = useAuth();

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Logout Failed", error.message);
        return;
      }
      router.replace("/");
    } catch (err: any) {
      Alert.alert("Logout Failed", err?.message ?? "Something went wrong");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left spacer balances the logout button so the title stays centered */}
        {session && <View style={styles.sideSpacer} />}

        <View style={styles.centerContainer}>
          <Text style={styles.appName}>MediBand</Text>
        </View>

        {/* Logout Button */}
        {session && (
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={26} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 48 : 20,
    paddingBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  sideSpacer: {
    width: 46,
  },

  appName: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.text,
  },

  logoutButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.button,
    alignItems: "center",
    justifyContent: "center",
  },
});
