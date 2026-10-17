import MyButton from "@/components/MyButton";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AddMedication() {
  const [medication, setMedication] = useState("");
  const [dosageAmount, setDosageAmount] = useState("");
  const [dosageUnit, setDosageUnit] = useState("");

  const addMedication = async () => {
    if (!medication || !dosageAmount || !dosageUnit) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const { error } = await supabase.from("medications").insert({
      medication,
      dosage_amount: Number(dosageAmount),
      dosage_unit: dosageUnit,
      user_id: user.id,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Medication added");

      setMedication("");
      setDosageAmount("");
      setDosageUnit("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Add New Medication</Text>

          <TextField
            placeholder="Medication Name"
            value={medication}
            onChangeText={setMedication}
          />

          <TextField
            placeholder="Dosage Amount"
            value={dosageAmount}
            onChangeText={setDosageAmount}
          />

          <TextField
            placeholder="Dosage Unit (mg, ml, pills)"
            value={dosageUnit}
            onChangeText={setDosageUnit}
          />

          <MyButton
            title="Add Medication"
            onPress={addMedication}
            fullWidth
            height={56}
            viewStyle={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
