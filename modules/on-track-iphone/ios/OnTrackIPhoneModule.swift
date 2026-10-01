import ExpoModulesCore
import Foundation
import HealthKit

// Each intent writes a new immutable file. No read/modify/write shared JSON array:
// app acknowledgements can never erase an intent arriving concurrently.
public enum OnTrackActionInbox {
  private static func directory() throws -> URL {
    guard let group = Bundle.main.object(forInfoDictionaryKey: "OnTrackAppGroup") as? String,
          let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: group) else {
      throw NSError(domain: "ON_TRACK", code: 1, userInfo: [NSLocalizedDescriptionKey: "App Group is unavailable. Rebuild with the configured entitlement."])
    }
    let directory = container.appendingPathComponent("OnTrackActions-v1", isDirectory: true)
    try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
    return directory
  }
  static func publishContext(date: String, mode: String) throws {
    let context: [String: Any] = ["date": date, "mode": mode, "savedAt": ISO8601DateFormatter().string(from: Date())]
    try JSONSerialization.data(withJSONObject: context).write(to: try directory().appendingPathComponent("context.state"), options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
  }
  @discardableResult public static func append(kind: String, now: Date = Date()) throws -> String {
    guard ["creatine", "workout"].contains(kind) else { throw NSError(domain: "ON_TRACK", code: 2) }
    let id = UUID().uuidString
    let formatter = DateFormatter(); formatter.locale = Locale(identifier: "en_US_POSIX"); formatter.calendar = Calendar(identifier: .gregorian); formatter.dateFormat = "yyyy-MM-dd"; formatter.timeZone = .current
    let contextURL = try directory().appendingPathComponent("context.state")
    guard let context = try? JSONSerialization.jsonObject(with: Data(contentsOf: contextURL)) as? [String: Any], context["mode"] as? String == "real", context["date"] as? String == formatter.string(from: now) else {
      throw NSError(domain: "ON_TRACK", code: 6, userInfo: [NSLocalizedDescriptionKey: "Open ON TRACK in personal mode for today before using this shortcut."])
    }
    let item: [String: Any] = ["id": id, "date": formatter.string(from: now), "kind": kind, "value": true, "at": ISO8601DateFormatter().string(from: now), "timezone": TimeZone.current.identifier]
    let file = try directory().appendingPathComponent(id).appendingPathExtension("json")
    try JSONSerialization.data(withJSONObject: item).write(to: file, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    return id
  }
  static func read() throws -> [[String: Any]] {
    let files = try FileManager.default.contentsOfDirectory(at: directory(), includingPropertiesForKeys: nil).filter { $0.pathExtension == "json" }
    return try files.map { file in
      guard let item = try JSONSerialization.jsonObject(with: Data(contentsOf: file)) as? [String: Any] else { throw NSError(domain: "ON_TRACK", code: 3) }
      return item
    }.sorted { ($0["at"] as? String ?? "") < ($1["at"] as? String ?? "") }
  }
  static func acknowledge(_ ids: [String]) throws {
    for id in ids {
      guard UUID(uuidString: id) != nil else { throw NSError(domain: "ON_TRACK", code: 4) }
      let file = try directory().appendingPathComponent(id).appendingPathExtension("json")
      if FileManager.default.fileExists(atPath: file.path) { try FileManager.default.removeItem(at: file) }
    }
  }
}

public class OnTrackIPhoneModule: Module {
  private let health = HKHealthStore()
  private var readTypes: Set<HKObjectType> {
    [HKObjectType.quantityType(forIdentifier: .bodyMass)!, HKObjectType.quantityType(forIdentifier: .dietaryEnergyConsumed)!, HKObjectType.workoutType()]
  }
  public func definition() -> ModuleDefinition {
    Name("OnTrackIPhone")
    Function("status") { ["available": true, "healthAvailable": HKHealthStore.isHealthDataAvailable()] }
    AsyncFunction("requestHealthAccess") { (promise: Promise) in
      guard HKHealthStore.isHealthDataAvailable() else { promise.reject("UNAVAILABLE", "Health data is unavailable on this device."); return }
      // Success means the authorization sheet completed, not that reads were granted.
      self.health.requestAuthorization(toShare: [], read: self.readTypes) { _, error in
        if let error { promise.reject("HEALTH_AUTH", error.localizedDescription) }
        else { promise.resolve(["requested": true]) }
      }
    }.runOnQueue(.main)
    AsyncFunction("readHealth") { (startISO: String, endISO: String, promise: Promise) in
      let iso = ISO8601DateFormatter(); iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
      let plain = ISO8601DateFormatter()
      guard let start = iso.date(from: startISO) ?? plain.date(from: startISO), let end = iso.date(from: endISO) ?? plain.date(from: endISO), end > start, end.timeIntervalSince(start) <= 93 * 86400 else { promise.reject("INVALID_RANGE", "Choose a date range of at most 93 days."); return }
      guard HKHealthStore.isHealthDataAvailable() else { promise.reject("UNAVAILABLE", "Health data is unavailable."); return }
      Task {
        do {
          let weights = try await self.samples(type: HKObjectType.quantityType(forIdentifier: .bodyMass)!, start: start, end: end)
          let workouts = try await self.samples(type: HKObjectType.workoutType(), start: start, end: end)
          let energy = try await self.samples(type: HKObjectType.quantityType(forIdentifier: .dietaryEnergyConsumed)!, start: start, end: end)
          promise.resolve(["start": startISO, "end": endISO, "weights": weights, "workouts": workouts, "energy": energy, "emptyReadMayBeDenied": true])
        } catch { promise.reject("HEALTH_READ", error.localizedDescription) }
      }
    }
    Function("alarmStatus") { () -> [String: Any] in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) { return ReviewAlarms.status() }
      #endif
      return ["supported": false, "authorization": "unavailable"]
    }
    AsyncFunction("requestAlarmAccess") { (promise: Promise) in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        Task { do { promise.resolve(try await ReviewAlarms.authorize()) } catch { promise.reject("ALARM_AUTH", error.localizedDescription) } }
        return
      }
      #endif
      promise.reject("UNAVAILABLE", "Real alarms require iOS 26 or later.")
    }.runOnQueue(.main)
    AsyncFunction("scheduleReviewAlarm") { (fireAtISO: String, promise: Promise) in
      let iso = ISO8601DateFormatter(); iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
      guard let fireAt = iso.date(from: fireAtISO) else { promise.reject("INVALID_DATE", "Invalid alarm date."); return }
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        Task { do { promise.resolve(try await ReviewAlarms.schedule(fireAt)) } catch { promise.reject("ALARM_SCHEDULE", error.localizedDescription) } }
        return
      }
      #endif
      promise.reject("UNAVAILABLE", "Real alarms require iOS 26 or later.")
    }
    AsyncFunction("cancelReviewAlarm") { (id: String) in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) { try ReviewAlarms.cancel(id) }
      #endif
    }
    AsyncFunction("publishNativeContext") { (date: String, mode: String) in try OnTrackActionInbox.publishContext(date: date, mode: mode) }
    AsyncFunction("readNativeActions") { try OnTrackActionInbox.read() }
    AsyncFunction("acknowledgeNativeActions") { (ids: [String]) in try OnTrackActionInbox.acknowledge(ids) }
  }
  private func samples(type: HKSampleType, start: Date, end: Date) async throws -> [[String: Any]] {
    try await withCheckedThrowingContinuation { continuation in
      let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
      let query = HKSampleQuery(sampleType: type, predicate: predicate, limit: 10001, sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]) { _, samples, error in
        if let error { continuation.resume(throwing: error); return }
        let samples = samples ?? []
        guard samples.count <= 10000 else { continuation.resume(throwing: NSError(domain: "ON_TRACK", code: 5, userInfo: [NSLocalizedDescriptionKey: "Too many samples. Choose a shorter date range."])); return }
        let formatter = ISO8601DateFormatter()
        let output = samples.map { sample -> [String: Any] in
          var row: [String: Any] = ["id": sample.uuid.uuidString, "start": formatter.string(from: sample.startDate), "end": formatter.string(from: sample.endDate), "sourceBundleId": sample.sourceRevision.source.bundleIdentifier, "sourceName": sample.sourceRevision.source.name]
          if let quantity = sample as? HKQuantitySample {
            if type.identifier == HKQuantityTypeIdentifier.bodyMass.rawValue { row["pounds"] = quantity.quantity.doubleValue(for: .pound()) }
            else { row["kcal"] = quantity.quantity.doubleValue(for: .kilocalorie()) }
          }
          if let workout = sample as? HKWorkout { row["durationSeconds"] = workout.duration; row["activityType"] = Int(workout.workoutActivityType.rawValue) }
          return row
        }
        continuation.resume(returning: output)
      }
      self.health.execute(query)
    }
  }
}
