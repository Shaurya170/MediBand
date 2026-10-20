import Foundation
import React

/// JavaScript bridge for `MediBandAlarms`. Used from `utils/alarmKit.ts`.
@objc(MediBandAlarmsModule)
final class MediBandAlarmsModule: RCTEventEmitter {
  private var hasListeners = false

  override init() {
    super.init()
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleSnoozeRequested),
      name: MediBandAlarmEvents.snoozeRequested,
      object: nil
    )
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  override static func requiresMainQueueSetup() -> Bool { false }

  override func supportedEvents() -> [String]! { ["snoozeRequested"] }

  override func startObserving() { hasListeners = true }

  override func stopObserving() { hasListeners = false }

  @objc private func handleSnoozeRequested() {
    if hasListeners {
      sendEvent(withName: "snoozeRequested", body: nil)
    }
  }

  @objc func isSupported(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if #available(iOS 26.0, *) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  @objc func requestAuthorization(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 26.0, *) else { return resolve(false) }
    Task { resolve(await MediBandAlarms.requestAuthorization()) }
  }

  @objc func scheduleWeekly(
    _ key: String,
    title: String,
    hour: Double,
    minute: Double,
    weekdays: [NSNumber],
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 26.0, *) else { return resolve(nil) }
    Task {
      do {
        try await MediBandAlarms.scheduleWeekly(
          key: key, title: title, hour: Int(hour), minute: Int(minute),
          weekdays: weekdays.map(\.intValue)
        )
        resolve(nil)
      } catch {
        reject("schedule_failed", error.localizedDescription, error)
      }
    }
  }

  @objc func cancelAlarm(
    _ key: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 26.0, *) else { return resolve(nil) }
    MediBandAlarms.cancelAll(key: key)
    resolve(nil)
  }

  @objc func getPendingSnooze(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 26.0, *) else { return resolve(nil) }
    resolve(MediBandAlarms.pendingSnooze)
  }

  /// Called when Snooze was tapped by mistake: cancels the backup snooze so the
  /// alarm stays off, as if Stop had been tapped.
  @objc func cancelPendingSnooze(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 26.0, *) else { return resolve(nil) }
    if let pending = MediBandAlarms.pendingSnooze, let key = pending["alarmKey"],
      let backup = pending["backupId"].flatMap(UUID.init(uuidString:))
    {
      MediBandAlarms.cancelSnooze(id: backup, key: key)
    }
    MediBandAlarms.clearPendingSnooze()
    resolve(nil)
  }

  /// Replaces the 5-minute backup snooze with one of the chosen length.
  @objc func snooze(
    _ minutes: Double,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 26.0, *) else { return resolve(nil) }
    guard let pending = MediBandAlarms.pendingSnooze,
      let key = pending["alarmKey"], let title = pending["title"]
    else { return resolve(nil) }

    Task {
      do {
        if let backup = pending["backupId"].flatMap(UUID.init(uuidString:)) {
          MediBandAlarms.cancelSnooze(id: backup, key: key)
        }
        try await MediBandAlarms.scheduleSnooze(key: key, title: title, minutes: Int(minutes))
        MediBandAlarms.clearPendingSnooze()
        resolve(nil)
      } catch {
        reject("snooze_failed", error.localizedDescription, error)
      }
    }
  }
}
