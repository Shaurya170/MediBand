import AlarmKit
import AppIntents
import CryptoKit
import Foundation
import SwiftUI

/// Posted after the Snooze button is tapped, so JavaScript can ask how long to snooze.
enum MediBandAlarmEvents {
  static let snoozeRequested = Notification.Name("MediBandSnoozeRequested")
}

@available(iOS 26.0, *)
struct MediBandAlarmMetadata: AlarmMetadata {}

/// Schedules MediBand's medication alarms with AlarmKit. Unlike notifications,
/// these keep ringing (and override silent mode and Focus) until the person
/// taps Stop or Snooze.
@available(iOS 26.0, *)
enum MediBandAlarms {
  /// Bundled into the app by the expo-notifications config plugin.
  static let soundName = "alarm.wav"

  /// MediBand's accent color (`colors.accent`).
  private static let tint = Color(red: 0x36 / 255, green: 0xD9 / 255, blue: 0xB0 / 255)

  private static let defaults = UserDefaults.standard
  private static let snoozesKey = "MediBandAlarms.snoozes"
  private static let signaturesKey = "MediBandAlarms.signatures"
  private static let pendingSnoozeKey = "MediBandAlarms.pendingSnooze"

  // MARK: Authorization

  static func requestAuthorization() async -> Bool {
    switch AlarmManager.shared.authorizationState {
    case .authorized:
      return true
    case .denied:
      return false
    default:
      return (try? await AlarmManager.shared.requestAuthorization()) == .authorized
    }
  }

  // MARK: Weekly alarms

  /// Schedules (or reschedules) the repeating alarm for one MediBand alarm row.
  /// `weekdays` uses 1 = Sunday ... 7 = Saturday.
  static func scheduleWeekly(
    key: String, title: String, hour: Int, minute: Int, weekdays: [Int]
  ) async throws {
    let id = alarmID(for: key)
    let days = weekdays.compactMap(weekday(from:))
    let signature = "\(title)|\(hour):\(minute)|\(weekdays.sorted())"

    // The app reschedules every alarm whenever the Alarms screen loads. Skip
    // unchanged alarms so a ringing alarm isn't cancelled by opening the app.
    if signatures[key] == signature, isScheduled(id) {
      return
    }

    try? AlarmManager.shared.cancel(id: id)
    let schedule = Alarm.Schedule.relative(
      .init(time: .init(hour: hour, minute: minute), repeats: .weekly(days))
    )
    _ = try await AlarmManager.shared.schedule(
      id: id,
      configuration: configuration(id: id, key: key, title: title, schedule: schedule)
    )
    var updated = signatures
    updated[key] = signature
    defaults.set(updated, forKey: signaturesKey)
  }

  /// Cancels the repeating alarm and any snoozes for one MediBand alarm row.
  static func cancelAll(key: String) {
    try? AlarmManager.shared.cancel(id: alarmID(for: key))
    var updatedSignatures = signatures
    updatedSignatures[key] = nil
    defaults.set(updatedSignatures, forKey: signaturesKey)

    var allSnoozes = snoozes
    for snoozeID in allSnoozes[key] ?? [] {
      if let uuid = UUID(uuidString: snoozeID) {
        try? AlarmManager.shared.cancel(id: uuid)
      }
    }
    allSnoozes[key] = nil
    defaults.set(allSnoozes, forKey: snoozesKey)
  }

  // MARK: Snoozing

  /// Schedules a one-time alarm `minutes` from now that rings the same way.
  @discardableResult
  static func scheduleSnooze(key: String, title: String, minutes: Int) async throws -> UUID {
    let id = UUID()
    let fireDate = Date().addingTimeInterval(TimeInterval(minutes * 60))
    _ = try await AlarmManager.shared.schedule(
      id: id,
      configuration: configuration(id: id, key: key, title: title, schedule: .fixed(fireDate))
    )
    var allSnoozes = snoozes
    allSnoozes[key, default: []].append(id.uuidString)
    defaults.set(allSnoozes, forKey: snoozesKey)
    return id
  }

  static func cancelSnooze(id: UUID, key: String) {
    try? AlarmManager.shared.cancel(id: id)
    var allSnoozes = snoozes
    allSnoozes[key]?.removeAll { $0 == id.uuidString }
    defaults.set(allSnoozes, forKey: snoozesKey)
  }

  /// The snooze waiting for the person to choose a length, saved by `SnoozeAlarmIntent`.
  static var pendingSnooze: [String: String]? {
    defaults.dictionary(forKey: pendingSnoozeKey) as? [String: String]
  }

  static func setPendingSnooze(key: String, title: String, backupID: UUID?) {
    var value = ["alarmKey": key, "title": title]
    value["backupId"] = backupID?.uuidString
    defaults.set(value, forKey: pendingSnoozeKey)
  }

  static func clearPendingSnooze() {
    defaults.removeObject(forKey: pendingSnoozeKey)
  }

  // MARK: Helpers

  private static var snoozes: [String: [String]] {
    defaults.dictionary(forKey: snoozesKey) as? [String: [String]] ?? [:]
  }

  private static var signatures: [String: String] {
    defaults.dictionary(forKey: signaturesKey) as? [String: String] ?? [:]
  }

  private static func isScheduled(_ id: UUID) -> Bool {
    ((try? AlarmManager.shared.alarms) ?? []).contains { $0.id == id }
  }

  private static func configuration(
    id: UUID, key: String, title: String, schedule: Alarm.Schedule
  ) -> AlarmManager.AlarmConfiguration<MediBandAlarmMetadata> {
    let alertTitle = LocalizedStringResource(stringLiteral: title)
    let snoozeButton = AlarmButton(text: "Snooze", textColor: .white, systemImageName: "zzz")
    // `.custom` runs `SnoozeAlarmIntent`, which opens the app to ask how long.
    let alert: AlarmPresentation.Alert
    if #available(iOS 26.1, *) {
      alert = AlarmPresentation.Alert(
        title: alertTitle, secondaryButton: snoozeButton, secondaryButtonBehavior: .custom
      )
    } else {
      alert = AlarmPresentation.Alert(
        title: alertTitle,
        stopButton: AlarmButton(text: "Stop", textColor: .white, systemImageName: "stop.circle"),
        secondaryButton: snoozeButton,
        secondaryButtonBehavior: .custom
      )
    }
    let attributes = AlarmAttributes(
      presentation: AlarmPresentation(alert: alert),
      metadata: MediBandAlarmMetadata(),
      tintColor: tint
    )
    return .alarm(
      schedule: schedule,
      attributes: attributes,
      secondaryIntent: SnoozeAlarmIntent(alarmID: id.uuidString, alarmKey: key, alarmTitle: title),
      sound: .named(soundName)
    )
  }

  /// AlarmKit needs UUIDs, but Supabase IDs can be any string, so derive a
  /// stable UUID from the alarm's ID.
  static func alarmID(for key: String) -> UUID {
    var bytes = Array(SHA256.hash(data: Data("mediband-alarm:\(key)".utf8)).prefix(16))
    bytes[6] = (bytes[6] & 0x0F) | 0x50  // UUID version 5 layout
    bytes[8] = (bytes[8] & 0x3F) | 0x80  // RFC 4122 variant
    return UUID(uuid: (
      bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7],
      bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15]
    ))
  }

  private static func weekday(from number: Int) -> Locale.Weekday? {
    switch number {
    case 1: .sunday
    case 2: .monday
    case 3: .tuesday
    case 4: .wednesday
    case 5: .thursday
    case 6: .friday
    case 7: .saturday
    default: nil
    }
  }
}

/// Runs when the alarm's Snooze button is tapped: silences the alarm, schedules
/// a 5-minute backup snooze (so the reminder comes back even if no length is
/// chosen), then opens the app so JavaScript can ask for 5, 10, or custom minutes.
@available(iOS 26.0, *)
struct SnoozeAlarmIntent: LiveActivityIntent {
  static let title: LocalizedStringResource = "Snooze Medication Alarm"
  static let isDiscoverable = false
  static let openAppWhenRun = true

  @Parameter(title: "Alarm ID")
  var alarmID: String

  @Parameter(title: "Alarm Key")
  var alarmKey: String

  @Parameter(title: "Alarm Title")
  var alarmTitle: String

  init() {}

  init(alarmID: String, alarmKey: String, alarmTitle: String) {
    self.alarmID = alarmID
    self.alarmKey = alarmKey
    self.alarmTitle = alarmTitle
  }

  func perform() async throws -> some IntentResult {
    if let id = UUID(uuidString: alarmID) {
      try? AlarmManager.shared.stop(id: id)
    }
    let backupID = try? await MediBandAlarms.scheduleSnooze(
      key: alarmKey, title: alarmTitle, minutes: 5
    )
    MediBandAlarms.setPendingSnooze(key: alarmKey, title: alarmTitle, backupID: backupID)
    NotificationCenter.default.post(name: MediBandAlarmEvents.snoozeRequested, object: nil)
    return .result()
  }
}
