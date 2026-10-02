# Guided progress photos: optional trial

## Research (October 2, 2026)

Existing products already use a previous-photo ghost overlay:
- ProgressCam: https://progresscam.app/support/
- Then & Now: https://mahalomochi.com/thenandnow
- Progressly's developer listing: https://apps.apple.com/ca/app/progressly-body-progress/id6789591055

The supported on-device pose options include Apple's Vision 2D/3D body-pose APIs and Google's MediaPipe Pose Landmarker (33 landmarks, visibility/presence confidence, relative body coordinates):
- https://developer.apple.com/documentation/vision/detecting-human-body-poses-in-3d-with-vision
- https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/ios

An overlay is the first trial because it gives users immediate visual feedback with no model download, inference latency, remote processing, or confidence errors. Mirror shots, occlusion from a phone, partial-body photos and different lighting need real-device testing before recommending pose scores. Body-relative 3D coordinates do not by themselves establish camera-to-person or camera-to-mirror distance.

## Shipped trial

Photos → Take photo. Guides are off initially and can be toggled in the camera; the preference is stored locally. The current Photos reference is shown faintly when guides are on, with three opacity choices and center/head/foot framing guides. Timer cycles off/3/10 seconds. Camera zoom stays at 1×, with front/back selection and matching front-camera mirroring. Review, retake and explicit save follow capture.

Guides are preview layers only. Saved pixels come directly from the camera, without overlay compositing, anatomy warping, comparison alignment edits or AI enhancement. Save creates an app-owned copy for the chosen date and personal/demo dataset. Cloud backups continue to exclude all photo files. No microphone access, voice capture, or pose inference is added.

The camera is mounted only while the Photos camera modal is focused and foregrounded. Backgrounding, closing, and canceling stop countdowns; synchronous locks prevent duplicate capture/save taps. Failed storage writes remove the new copy and leave the original intact. Camera cache copies are removed on retake/close.

## Trial limitations and next experiments

The guides suggest framing, not measured distance or an exact pose match. Repeat camera height, standing spot, lens, lighting and clothing; line up shoulders and feet rather than attempting to match a changing waist outline. Existing imported images may have a different aspect ratio.

Test front and rear cameras on a real iPhone, including mirror photos, permission denial, foreground/background transitions, and matching saved framing. If the trial helps, consider a level indicator and separate front/side/back reference presets next. Only then trial on-device pose landmarks for shoulder/hip orientation and visibility; expose uncertainty and avoid misleading exact-distance claims.

New native module: expo-camera. A new signed iPhone build is required; fingerprint-based updates keep incompatible old builds from loading it.
