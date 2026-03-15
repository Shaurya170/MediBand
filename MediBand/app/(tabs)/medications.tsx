import MyButton from "@/components/MyButton";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Medication = {
  id: string;
  medication: string;
  dosage_amount: number;
  dosage_unit: string;
};

export default function Medications() {

  const [medications, setMedications] = useState<Medication[]>([]);

  const [modalVisible, setModalVisible] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");

  useEffect(() => {
    fetchMedications();
    subscribeToChanges();
  }, []);

  async function fetchMedications() {

    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .order("created_at");

    if (error) {
      Alert.alert(error.message);
      return;
    }

    setMedications(data || []);
  }

  function subscribeToChanges() {

    const channel = supabase
      .channel("medication-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "medications" },
        (payload) => {

          if (payload.eventType === "INSERT") {
            setMedications((prev) => [...prev, payload.new as Medication]);
          }

          if (payload.eventType === "DELETE") {
            setMedications((prev) =>
              prev.filter((m) => m.id !== payload.old.id)
            );
          }

          if (payload.eventType === "UPDATE") {
            setMedications((prev) =>
              prev.map((m) =>
                m.id === payload.new.id ? (payload.new as Medication) : m
              )
            );
          }

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  function openEdit(med: Medication) {
    setEditId(med.id);
    setName(med.medication);
    setAmount(med.dosage_amount.toString());
    setUnit(med.dosage_unit);
    setModalVisible(true);
  }

  async function saveEdit() {

    if (!editId) return;

    const updated = {
      medication: name,
      dosage_amount: Number(amount),
      dosage_unit: unit,
    };

    setMedications((prev) =>
      prev.map((m) =>
        m.id === editId ? { ...m, ...updated } : m
      )
    );

    const { error } = await supabase
      .from("medications")
      .update(updated)
      .eq("id", editId);

    if (error) {
      Alert.alert(error.message);
    }

    setModalVisible(false);
  }

  function confirmDelete(id: string) {

    Alert.alert(
      "Delete Medication",
      "Are you sure you want to delete this medication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMedication(id),
        },
      ]
    );
  }

  async function deleteMedication(id: string) {

    setMedications((prev) =>
      prev.filter((m) => m.id !== id)
    );

    const { error } = await supabase
      .from("medications")
      .delete()
      .eq("id", id);

    if (error) {
      Alert.alert(error.message);
    }
  }

  function renderMedication({ item }: { item: Medication }) {

    return (
      <View style={styles.card}>

        <Text style={styles.medText}>
          {item.medication} — {item.dosage_amount} {item.dosage_unit}
        </Text>

        <View style={styles.buttonRow}>

          <MyButton
            title="Edit"
            onPress={() => openEdit(item)}
            viewStyle={styles.smallButton}
          />

          <MyButton
            title="Delete"
            onPress={() => confirmDelete(item.id)}
            viewStyle={styles.smallButton}
            color="#b00020"
            textColor="white"
          />

        </View>

      </View>
    );
  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Your Medications</Text>

      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={renderMedication}
      />

      {/* EDIT MODAL */}

      <Modal visible={modalVisible} transparent animationType="fade">

        <View style={styles.modalBackground}>

          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>Edit Medication</Text>

            <TextField
              placeholder="Medication"
              value={name}
              onChangeText={setName}
            />

            <TextField
              placeholder="Dosage Amount"
              value={amount}
              onChangeText={setAmount}
            />

            <TextField
              placeholder="Dosage Unit"
              value={unit}
              onChangeText={setUnit}
            />

            <View style={styles.buttonRow}>

              <MyButton
                title="Save"
                onPress={saveEdit}
                viewStyle={styles.smallButton}
              />

              <MyButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                viewStyle={styles.smallButton}
              />

            </View>

          </View>

        </View>

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  title: {
    fontSize: 32,
    marginBottom: 20,
    color: colors.text,
  },

  card: {
    backgroundColor: colors.textField,
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
  },

  medText: {
    fontSize: 20,
    marginBottom: 10,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  smallButton: {
    width: 100,
    height: 40,
    borderWidth: 2,
  },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalCard: {
    width: 300,
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 22,
    marginBottom: 15,
    color: colors.text,
  },

});