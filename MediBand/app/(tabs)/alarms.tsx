import MyButton from "@/components/MyButton";
import colors from "@/styles/colors";
import { supabase } from "@/utils/supabase";
import {
  cancelAlarmNotifications,
  scheduleAlarmNotifications,
} from "@/utils/notifications";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Alarm = {
  id: string;
  medication_id: string;
  medication_name?: string; // we'll join this
  time: string;
  days: string[];
  enabled: boolean;
};

export default function Alarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editAlarm, setEditAlarm] = useState<Alarm | null>(null);

  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAlarms();
    }, [])
  );

  async function fetchAlarms() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("alarms")
      .select(
        `
        *,
        medications!inner(medication)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      const withNames = (data || []).map((a: any) => ({
        ...a,
        medication_name: a.medications?.medication,
      }));
      setAlarms(withNames);
      withNames.forEach((a) => scheduleAlarmNotifications(a));
    }
  }

  async function toggleEnabled(alarmId: string, current: boolean) {
    const { error } = await supabase
      .from("alarms")
      .update({ enabled: !current })
      .eq("id", alarmId);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    const alarm = alarms.find((a) => a.id === alarmId);
    if (alarm) {
      await scheduleAlarmNotifications({ ...alarm, enabled: !current });
    }
    fetchAlarms();
  }

  function openEditAlarm(alarm: Alarm) {
    setEditAlarm(alarm);
    setAlarmTime(new Date(`1970-01-01T${alarm.time}`));
    setSelectedDays(alarm.days || []);
    setModalVisible(true);
  }

  async function saveAlarmEdit() {
    if (!editAlarm) return;

    const timeString = alarmTime.toTimeString().slice(0, 5);

    setSaving(true);
    const { error } = await supabase
      .from("alarms")
      .update({
        time: timeString,
        days: selectedDays,
      })
      .eq("id", editAlarm.id);
    setSaving(false);

    if (error) Alert.alert("Error", error.message);
    else {
      await scheduleAlarmNotifications({
        ...editAlarm,
        time: timeString,
        days: selectedDays,
      });
      Alert.alert("Success", "Alarm updated");
      setModalVisible(false);
      fetchAlarms();
    }
  }

  async function deleteAlarm(id: string) {
    Alert.alert("Delete Alarm", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("alarms").delete().eq("id", id);
          if (error) Alert.alert("Error", error.message);
          else {
            await cancelAlarmNotifications(id);
            fetchAlarms();
          }
        },
      },
    ]);
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  function renderAlarm({ item }: { item: Alarm }) {
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.medText}>
            {item.medication_name || "Unknown Medication"}
          </Text>
          <Text style={styles.subText}>
            {item.time} • {item.days.join(", ")}
          </Text>
          <View style={styles.statusRow}>
            <Text
              style={[
                styles.status,
                item.enabled ? styles.active : styles.inactive,
              ]}
            >
              {item.enabled ? "Active" : "Disabled"}
            </Text>
            <Switch
              value={item.enabled}
              onValueChange={() => toggleEnabled(item.id, item.enabled)}
              trackColor={{ false: "#ccc", true: colors.accent }}
            />
          </View>
        </View>

        <View style={styles.actionButtons}>
          <MyButton
            icon={<Feather name="edit-2" size={20} color={colors.accent} />}
            onPress={() => openEditAlarm(item)}
            color="white"
            viewStyle={styles.iconButton}
          />

          <MyButton
            icon={<Feather name="trash-2" size={20} color="white" />}
            onPress={() => deleteAlarm(item.id)}
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
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={renderAlarm}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="bell-off" size={40} color={colors.secondaryText} />
            <Text style={styles.emptyTitle}>No alarms yet</Text>
            <Text style={styles.emptySubtitle}>
              Add a reminder from the Medications tab to see it here.
            </Text>
          </View>
        }
      />

      {/* Edit Alarm Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Reminder</Text>

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
                title={saving ? "Saving..." : "Save Changes"}
                onPress={saveAlarmEdit}
                viewStyle={styles.smallButton}
                disabled={saving}
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
    paddingTop: 60,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 40,
    width: "100%",
  },
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
  medText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  subText: {
    fontSize: 15,
    color: colors.secondaryText,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  status: {
    fontSize: 13,
    fontWeight: "600",
  },
  active: { color: "#4CAF50" },
  inactive: { color: "#FF9800" },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
  },

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
  timeText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
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
  dayChipActive: {
    backgroundColor: colors.accent,
  },
  dayText: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  dayTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  smallButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
  },
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
