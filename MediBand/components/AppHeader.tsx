import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname } from "expo-router";
import { Alert, Image, StyleSheet, Text, TouchableHighlight, View } from "react-native";

function getTitleFromPath(pathname: string) {
  if (pathname === "/") return "Welcome";
  if (pathname.includes("index")) return "Home";
  if (pathname.includes("medications")) return "Medications";
  if (pathname.includes("editProfile")) return "Edit Profile";
  if (pathname.includes("about")) return "About";
  if (pathname.includes("medications")) return "Medications";
  if (pathname.includes("addMedications")) return "Create Medication";
  return "App";
}


export default function AppHeader() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  // Simplified sign out: intentionally NOT performing any navigation here.
  // Rationale: navigation attempts from inside nested navigators (tabs)
  // were unreliable and caused unmatched route or no-op behavior. The
  // app now uses a global AuthProvider and the tabs layout renders the
  // Auth screen in-place when the session becomes null.
  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        Alert.alert("Logout failed", error.message);
      }
    } catch (err: any) {
      Alert.alert("Logout failed", err?.message ?? String(err));
    }
  }
  
    return(
    <View style={styles.container}>
        <View style={styles.leftContainer}>
            <Image
            source={require("../assets/images/MediBand_logo.png")}
            style={{width: 90, height: 90, paddingBottom: 15 }}
        />
        </View>
        <View style={styles.rightContainer}>
          <Text style={styles.text}>{title}</Text>
          <TouchableHighlight
            onPress={handleLogout}
            underlayColor={colors.accent}
            style={[styles.button, {backgroundColor: colors.button}]}
          >
            <MaterialIcons name="logout" size={24} color={colors.text} />
          </TouchableHighlight>
        </View>
    </View>
  )
  
}
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 120,
        backgroundColor: colors.appHeader,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 17,
        
    },
    button:{
        backgroundColor: colors.button,
        borderRadius: 8,
        //borderWidth: 3,
        width: 50,
        height: '50%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text:{
        color: colors.text,
        fontSize: 40,
        fontWeight: 600,
        fontFamily: "Roboto",
        letterSpacing: 0.5,
        
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 13,
        paddingLeft: 10,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        paddingBottom: 10,
        paddingRight: 10,
    }
    
    
})