import MyButton from "@/components/MyButton";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, View } from "react-native";

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

    const unsubscribe = subscribeToChanges();

    return () => {
      unsubscribe();
    };
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
        {
          event: "*",
          schema: "public",
          table: "medications",
        },
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
      prev.map((m) => (m.id === editId ? { ...m, ...updated } : m))
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
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMedication(id),
        },
      ]
    );
  }

  async function deleteMedication(id: string) {
    setMedications((prev) => prev.filter((m) => m.id !== id));

    const { error } = await supabase.from("medications").delete().eq("id", id);

    if (error) {
      Alert.alert(error.message);
    }
  }

  function renderMedication({ item }: { item: Medication }) {
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.medText}>{item.medication}</Text>

          <Text style={styles.subText}>
            {item.dosage_amount} {item.dosage_unit}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <MyButton
            icon={<Feather name="edit-2" size={16} color={colors.accent} />}
            onPress={() => openEdit(item)}
            color="white"
            viewStyle={styles.iconButton}
          />

          <MyButton
            icon={<Feather name="trash-2" size={16} color="white" />}
            onPress={() => confirmDelete(item.id)}
            color="#ff5c5c"
            viewStyle={styles.iconButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={{ width: "100%" }}
        contentContainerStyle={styles.listContent}
        data={medications}
        keyExtractor={(item) => item.id}
        renderItem={renderMedication}
        showsVerticalScrollIndicator={false}
      />

      {/* MODAL */}
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
    alignItems: "center",
    paddingTop: 60,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 24,
  },

  listContent: {
    alignItems: "center",
    paddingBottom: 40,
    width: "100%",
  },

  card: {
    width: "90%",
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    minHeight: 150,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 25,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  medText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },

  subText: {
    fontSize: 16,
    color: colors.secondaryText,
    marginBottom: 16,
  },

  buttonRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallButton: {
    width: 120,
    height: 42,
    borderRadius: 14,
    borderWidth: 1.5,
  },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  modalCard: {
    width: "85%",
    backgroundColor: colors.card,
    padding: 22,
    borderRadius: 24,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 5,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 18,
    textAlign: "center",
  },
});
