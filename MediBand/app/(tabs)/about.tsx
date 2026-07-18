import MediBandLogo from "@/components/MediBandLogo";
import MyButton from "@/components/MyButton";
import colors from "@/styles/colors";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function About() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <MediBandLogo size={110} />
        </View>

        <Text style={styles.title}>MediBand</Text>
        <Text style={styles.subtitle}>Your Personal Medication Manager</Text>

        <Text style={styles.description}>
          MediBand helps you keep track of your medications, dosages, and
          schedules — all in one simple, beautiful place.
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>👤</Text>
            <Text style={styles.infoText}>Made for personal use</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>🔒</Text>
            <Text style={styles.infoText}>Your data stays private</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>⚡</Text>
            <Text style={styles.infoText}>Real-time sync with Supabase</Text>
          </View>
        </View>
      </View>

      <View style={styles.versionCard}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.versionSubtext}>
          Built with ❤️ using React Native + Supabase
        </Text>
      </View>

      <MyButton
        title="Logout"
        onPress={() => {}}
        color="#ff5c5c"
        viewStyle={styles.logoutButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: colors.card,
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 20,

    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  logoContainer: {
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    color: colors.accent,
    marginBottom: 20,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },

  infoContainer: {
    width: "100%",
    gap: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  infoEmoji: {
    fontSize: 22,
  },

  infoText: {
    fontSize: 15,
    color: colors.secondaryText,
  },

  versionCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
  },

  versionText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },

  versionSubtext: {
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: "center",
  },

  logoutButton: {
    height: 50,
    borderRadius: 14,
  },
});
