import colors from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../components/AuthProvider";

export default function TabsLayout() {
    const { session } = useAuth();
    // If session becomes null while inside tabs, render Auth in-place (no navigation)
    // If session is null while inside the tabs navigator, render the Auth
    // form in-place instead of attempting to force a navigation back to `/`.
    // This keeps the app state intact and avoids brittle cross-navigator calls.
    if (session === null) {
        return (
        <View style={{ flex: 1 }}>
            <AppHeader />
        </View>
        );
  }
    return(
        <View style={{flex: 1}}>
        <AppHeader />
        <Tabs
        screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.appHeader,
        tabBarInactiveTintColor: colors.appHeader,
        headerStyle: {
          backgroundColor: colors.appHeader,
        },
        headerShadowVisible: false,
        headerTintColor: colors.appHeader,
        tabBarStyle: {
          backgroundColor: colors.appHeader,
        },
      }}
      >

        <Tabs.Screen
            name="index"
            options={{
            headerTitle: "About",
            tabBarLabel: "About", 
            tabBarIcon: ({focused, color}) => (
                <Ionicons 
                name={focused ? "information-circle" : "information-circle-outline"}
                size={24} 
                color={color}
                />
            ),
            
            }}
        />
        <Tabs.Screen
            name="medications"
            options={{
            headerTitle: "Medications",
            tabBarLabel: "Medications", 
            
            tabBarIcon: ({focused, color}) => (
                <Ionicons 
                name={focused ? "medkit" : "medkit-outline"}
                size={24} 
                color={color}
                />
            ),
            }}
        />
        <Tabs.Screen
            name="addMedications"
            options={{
            headerTitle: "Add Medications",
            tabBarLabel: "Add Medications", 
            tabBarIcon: ({focused, color}) => ( 
                <Ionicons
                    name={focused ? "medical-sharp" : "medical-outline"}
                    size={24}
                    color={color}
                />
            ),
            }}
        />
        <Tabs.Screen
            name="editProfile"
            options={{
            headerTitle: "Profile",
            tabBarLabel: "Profile", 
            tabBarIcon: ({focused, color}) => (
                <Ionicons 
                name={focused ? "person" : "person-outline"}
                size={24} 
                color={color} 
                />
            ),
            }}
        />
        <Tabs.Screen
            name="about"
            options={{
            headerTitle: "Home",
            tabBarLabel: "Home", 
            tabBarIcon: ({focused, color}) => (
                <Ionicons
                    name={focused ? "home" : "home-outline"}
                    size={24}
                    color={color}
                />
            ),
            }}
        />
        </Tabs>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: "center",
    }
});