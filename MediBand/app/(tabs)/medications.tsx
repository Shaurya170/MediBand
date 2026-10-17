import MyButton from "@/components/MyButton";
import TextField from "@/components/TextField";
import colors from "@/styles/colors";
import {
  cancelAlarmNotifications,
  scheduleAlarmNotifications,
} from "@/utils/notifications";
import { supabase } from "@/utils/supabase";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Medication = {
  id: string;
  medication: string;
  dosage_amount: number;
  dosage_unit: string;
};

type Alarm = {
  id: string;
  medication_id: string;
  time: string;
  days: string[];
  enabled: boolean;
};

export default function Medications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // Edit Medication Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");

  // Alarm Modal
  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
  const [savingMed, setSavingMed] = useState(false);
  const [savingAlarm, setSavingAlarm] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [])
  );

  async function fetchAll() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch medications
    const { data: medsData } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id);

    setMedications(medsData || []);

    // Fetch alarms with medication name
    const { data: alarmsData } = await supabase
      .from("alarms")
      .select("*, medications(medication)")
      .eq("user_id", user.id);

    setAlarms(alarmsData || []);
  }

  function subscribeToChanges() {
    const channel = supabase
      .channel("realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "medications" },
        fetchAll
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alarms" },
        fetchAll
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  useEffect(() => {
    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe();
    };
  }, []);

  // ==================== MEDICATION EDIT ====================
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

    setSavingMed(true);
    const { error } = await supabase
      .from("medications")
      .update(updated)
      .eq("id", editId);
    setSavingMed(false);
    if (error) Alert.alert("Error", error.message);

    setModalVisible(false);
    setEditId(null);
    fetchAll();
  }

  // ==================== ALARM ====================
  function openAlarm(medId: string) {
    setSelectedMedId(medId);
    setEditingAlarmId(null);
    setAlarmTime(new Date());
    setSelectedDays([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
    setAlarmModalVisible(true);
  }

  function openEditAlarm(alarm: Alarm) {
    setSelectedMedId(alarm.medication_id);
    setEditingAlarmId(alarm.id);
    setAlarmTime(new Date(`1970-01-01T${alarm.time}`));
    setSelectedDays(alarm.days);
    setAlarmModalVisible(true);
  }

  async function saveAlarm() {
    if (!selectedMedId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const timeString = alarmTime.toTimeString().slice(0, 5);

    const payload = {
      user_id: user.id,
      medication_id: selectedMedId,
      time: timeString,
      days: selectedDays,
      enabled: true,
    };

    setSavingAlarm(true);
    let error;
    let alarmId = editingAlarmId;
    if (editingAlarmId) {
      ({ error } = await supabase
        .from("alarms")
        .update(payload)
        .eq("id", editingAlarmId));
    } else {
      const { data, error: insertError } = await supabase
        .from("alarms")
        .insert(payload)
        .select()
        .single();
      error = insertError;
      alarmId = data?.id ?? null;
    }
    setSavingAlarm(false);

    if (error) Alert.alert("Error", error.message);
    else {
      if (alarmId) {
        const medicationName = medications.find(
          (m) => m.id === selectedMedId
        )?.medication;
        await scheduleAlarmNotifications({
          id: alarmId,
          medication_name: medicationName,
          time: timeString,
          days: selectedDays,
          enabled: true,
        });
      }
      Alert.alert("Success", editingAlarmId ? "Alarm updated" : "Alarm added");
      setAlarmModalVisible(false);
      fetchAll();
    }
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  function confirmDeleteMedication(id: string) {
    Alert.alert("Delete Medication", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMedication(id),
      },
    ]);
  }

  async function deleteMedication(id: string) {
    const affectedAlarmIds = alarms
      .filter((a) => a.medication_id === id)
      .map((a) => a.id);

    const { error } = await supabase.from("medications").delete().eq("id", id);
    if (error) Alert.alert("Error", error.message);
    else {
      await Promise.all(affectedAlarmIds.map(cancelAlarmNotifications));
      fetchAll();
    }
  }

  function renderMedication({ item }: { item: Medication }) {
    const medAlarms = alarms.filter((a) => a.medication_id === item.id);

    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.medText}>{item.medication}</Text>
          <Text style={styles.subText}>
            {item.dosage_amount} {item.dosage_unit}
          </Text>

          {medAlarms.length > 0 && (
            <Text style={styles.alarmInfo}>
              {medAlarms.length} alarm{medAlarms.length > 1 ? "s" : ""}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <MyButton
            icon={<Feather name="clock" size={20} color={colors.accent} />}
            onPress={() => openAlarm(item.id)}
            color="white"
            viewStyle={styles.iconButton}
          />

          <MyButton
            icon={<Feather name="edit-2" size={20} color={colors.accent} />}
            onPress={() => openEdit(item)}
            color="white"
            viewStyle={styles.iconButton}
          />

          <MyButton
            icon={<Feather name="trash-2" size={20} color="white" />}
            onPress={() => confirmDeleteMedication(item.id)}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="package" size={40} color={colors.secondaryText} />
            <Text style={styles.emptyTitle}>No medications yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add your first medication.
            </Text>
          </View>
        }
      />

      {/* Edit Medication Modal */}
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
                title={savingMed ? "Saving..." : "Save"}
                onPress={saveEdit}
                viewStyle={styles.smallButton}
                disabled={savingMed}
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

      {/* Alarm Modal */}
      <Modal visible={alarmModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingAlarmId ? "Edit Reminder" : "New Reminder"}
            </Text>

            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={styles.timeButton}
            >
              <Text style={styles.timeText}>
                {alarmTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={alarmTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={(_, selected) => {
                  setShowTimePicker(false);
                  if (selected) setAlarmTime(selected);
                }}
              />
            )}

            <Text style={styles.label}>Repeat on</Text>
            <View style={styles.daysContainer}>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    selectedDays.includes(day) && styles.dayChipActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays.includes(day) && styles.dayTextActive,
                    ]}
                  >
                    {day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <MyButton
                title={savingAlarm ? "Saving..." : "Save Alarm"}
                onPress={saveAlarm}
                viewStyle={styles.alarmButton}
                disabled={savingAlarm}
              />
              <MyButton
                title="Cancel"
                onPress={() => setAlarmModalVisible(false)}
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
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  listContent: { paddingHorizontal: 10, paddingBottom: 40, width: "100%" },

  card: {
    width: "100%",
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },

  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  medText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  subText: { fontSize: 16, color: colors.secondaryText },
  alarmInfo: { fontSize: 13, color: colors.accent, marginTop: 4 },

  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalCard: {
    width: "88%",
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 24,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
    marginBottom: 6,
  },

  timeButton: {
    backgroundColor: colors.textField,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  timeText: { fontSize: 18, fontWeight: "600", color: colors.text },

  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.textField,
  },
  dayChipActive: { backgroundColor: colors.accent },
  dayText: { fontSize: 13, color: colors.secondaryText },
  dayTextActive: { color: "#fff", fontWeight: "600" },

  buttonRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  smallButton: { flex: 1, height: 50, borderRadius: 14 },
  alarmButton: { flex: 1, height: 50, borderRadius: 14, marginRight: 8 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
  },
});
