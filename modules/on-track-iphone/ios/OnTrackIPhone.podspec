Pod::Spec.new do |s|
  s.name = 'OnTrackIPhone'
  s.version = '1.0.0'
  s.summary = 'Read-only HealthKit and ON TRACK action inbox'
  s.description = s.summary
  s.license = 'MIT'
  s.author = 'ON TRACK'
  s.homepage = 'https://github.com/ACassiusD/on-track'
  s.platforms = { :ios => '16.4' }
  s.swift_version = '5.9'
  s.source = { :git => 'https://github.com/ACassiusD/on-track.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'HealthKit', 'SwiftUI'
  s.weak_frameworks = 'AlarmKit'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.swift'
end
