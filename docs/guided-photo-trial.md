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

## Saved framing (follow-up)

Capture and library import now open a framing editor before saving. Existing photos can be framed using Frame photo / Frame reference. Pinch and drag, precision buttons, reset and Match reference work on a draft; Cancel leaves the stored photo unchanged. Saving stores normalized zoom and position for a fixed 3:4 portrait frame alongside the original local file. No pixels are rewritten or uploaded.

The same frame renderer is used for the reel, picker, Side by side, Flip and Slider. Older pixel-based adjustments remain intact until edited. A selected reference's saved framing supplies the starting frame for new imports/captures. The camera preview and its ghost reference use that same framing, while capture retains the complete original. Matching copies framing settings; it does not detect anatomy or automatically align differently posed subjects.

The camera shutter is outside the scrolling options in a safe-area footer. Review/framing actions are also fixed at the bottom. Real-device pinch gestures and saved camera-preview matching still need an iPhone trial.

## Inline comparison adjustment

Adjust now opens resize and directional controls immediately below the existing comparison canvas. Slider's divider stays active, with a 50% center shortcut; fine increments support lining up individual body landmarks manually. Reference and Photo can be adjusted independently in one draft. Done saves changed framing for the bound dataset, Cancel discards it, and failed saves preserve the draft for retry. The canvas retains its size and image transform when finishing.

The normal page groups comparison modes, canvas/divider, Adjust / Photo options, then the photo reel. Adjustment and Photo options temporarily hide the reel to reduce crowding. Selecting Reference or Photo returns to the reel. Date explicitly chooses the photo date. Full cropping, imports, original export, deletion and marking photos reviewed remain under Photo options; the camera stays available in the header.

## Camera overlay and modal insets

The reference overlay uses a continuous 0–100% slider instead of presets, starting at 25%. Tap or drag the track; VoiceOver supports 5% increments. It is disabled during capture. Camera and framing editor use full-screen presentation with their own SafeAreaProvider, so the native modal measures its status-bar/notch and home-indicator insets. The photo picker also has a modal-local provider. Header and shutter remain outside the scrolling options.

Verified slider tap/drag at 390×844 Default and 320×568 Arcade Pop, boundary clamping, accessibility adjustments, fixed shutter, capture/review and save retry checks. Native inset measurement still needs confirmation on a real iPhone.
