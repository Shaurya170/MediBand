import MyButton from "@/components/MyButton";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import { cancelAlarmNotifications } from "@/utils/notifications";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

export default function EditProfile() {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    if (data) {
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
    }
  }

  async function updateProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "Not logged in");
      setLoading(false);
      return;
    }

    // Update profile in your profiles table
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    });

    // Update email if it was changed
    if (email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) Alert.alert("Email Error", emailError.message);
    }

    if (profileError) {
      Alert.alert("Error", profileError.message);
    } else {
      Alert.alert("Success", "Profile updated successfully!");
    }

    setLoading(false);
  }

  function confirmDeleteAccount() {
    Alert.alert(
      "Delete Account?",
      "This permanently deletes your account, medications, and alarms. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Account", style: "destructive", onPress: deleteAccount },
      ]
    );
  }

  // Required by the App Store: people must be able to delete their account in the app.
  async function deleteAccount() {
    setDeleting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "Not logged in");
      setDeleting(false);
      return;
    }

    // Look up the alarms first so they can be removed from this phone afterwards.
    const { data: alarms } = await supabase
      .from("alarms")
      .select("id")
      .eq("user_id", user.id);

    // Deletes the user's alarms, medications, profile, and login on the server.
    // See supabase/migrations/20261020000000_delete_own_account.sql.
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      Alert.alert("Couldn't delete account", error.message);
      setDeleting(false);
      return;
    }

    await Promise.all((alarms || []).map((a) => cancelAlarmNotifications(a.id)));

    // The account no longer exists on the server, so only clear the local session.
    await supabase.auth.signOut({ scope: "local" });
    setDeleting(false);
    Alert.alert("Account Deleted", "Your account and data have been deleted.");
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.title}>Edit Profile</Text>

        <TextField
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextField
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextField
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <MyButton
          title={loading ? "Saving..." : "Save Changes"}
          onPress={updateProfile}
          fullWidth
          height={56}
          viewStyle={{ marginTop: 20 }}
        />

        <MyButton
          title={deleting ? "Deleting..." : "Delete Account"}
          onPress={confirmDeleteAccount}
          disabled={deleting}
          color={colors.danger}
          fullWidth
          height={56}
          viewStyle={{ marginTop: 12 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 24,

    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 24,
    textAlign: "center",
  },
});
