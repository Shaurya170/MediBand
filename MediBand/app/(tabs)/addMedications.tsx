import MyButton from "@/components/MyButton";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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
          viewStyle={styles.button}
          textStyle={styles.buttonText}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: 20,
    paddingBottom: 40, // prevents button being hidden
  },

  title: {
    fontSize: 50,
    color: colors.text,
    marginBottom: 30,
  },

  button: {
    width: 200,
    height: 60,
    borderRadius: 15,
  },

  buttonText: {
    fontSize: 22,
  },
});
