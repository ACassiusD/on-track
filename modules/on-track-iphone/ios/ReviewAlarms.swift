import Foundation
import SwiftUI
#if canImport(AlarmKit)
import AlarmKit

@available(iOS 26.0, *)
private struct ReviewAlarmMetadata: AlarmMetadata {}

@available(iOS 26.0, *)
enum ReviewAlarms {
  static func status() -> [String: Any] {
    ["supported": true, "authorization": String(describing: AlarmManager.shared.authorizationState)]
  }
  static func authorize() async throws -> [String: Any] {
    let state = try await AlarmManager.shared.requestAuthorization()
    return ["supported": true, "authorization": String(describing: state)]
  }
  static func schedule(_ fireAt: Date) async throws -> String {
    guard fireAt > Date() && fireAt.timeIntervalSinceNow <= 48 * 3600 else { throw NSError(domain: "ON_TRACK", code: 7, userInfo: [NSLocalizedDescriptionKey: "Choose a future alarm within the next 48 hours."]) }
    guard AlarmManager.shared.authorizationState == .authorized else { throw NSError(domain: "ON_TRACK", code: 8, userInfo: [NSLocalizedDescriptionKey: "Allow alarms before scheduling a review."]) }
    let id = UUID()
    // Alert-only: a countdown would need a matching AlarmKit widget extension.
    let alert = AlarmPresentation.Alert(title: "Review all food in ON TRACK", stopButton: AlarmButton(text: "Stop", textColor: .white, systemImageName: "stop.circle"))
    let attributes = AlarmAttributes(presentation: AlarmPresentation(alert: alert), metadata: ReviewAlarmMetadata(), tintColor: Color(red: 0.4, green: 0.96, blue: 0.8))
    let configuration = AlarmManager.AlarmConfiguration<ReviewAlarmMetadata>.alarm(schedule: .fixed(fireAt), attributes: attributes)
    _ = try await AlarmManager.shared.schedule(id: id, configuration: configuration)
    return id.uuidString
  }
  static func cancel(_ id: String) throws {
    guard let uuid = UUID(uuidString: id) else { throw NSError(domain: "ON_TRACK", code: 9) }
    // Cancellation is idempotent after a user stops an alarm outside the app.
    if try AlarmManager.shared.alarms.contains(where: { $0.id == uuid }) { try AlarmManager.shared.cancel(id: uuid) }
  }
}
#endif
