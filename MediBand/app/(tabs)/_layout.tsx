import colors from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../components/AuthProvider";

export default function TabsLayout() {
  const { session } = useAuth();

  if (session === null) {
    return (
      <View style={{ flex: 1 }}>
        <AppHeader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />

      <Tabs
        screenOptions={{
          headerShown: false,

          // ✅ Clean color system
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.subText,

          // ✅ Modern tab bar styling
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 65,
            paddingBottom: 8,
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        <Tabs.Screen
          name="about"
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="medications"
          options={{
            tabBarLabel: "Meds",
            tabBarIcon: ({ focused, color }) => (
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
            tabBarLabel: "Add",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "create" : "create-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="editProfile"
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
