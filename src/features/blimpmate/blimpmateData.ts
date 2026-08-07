export type Scene = 'lift' | 'listen' | 'glow'
export type PerformanceVisual = 'wave' | 'steps' | 'scan' | 'presence'
export type ScenarioId = 'cooking' | 'assembly' | 'lab' | 'nutrition' | 'reminder' | 'safety' | 'telepresence'
export type SystemView = 'hardware' | 'projection' | 'control' | 'network'
export type HotspotId = 'envelope' | 'screen' | 'projector' | 'motion' | 'sensing' | 'compute'
export type PresentationStateId = 'avatar' | 'notification' | 'media' | 'task' | 'communication'

export const researchAsset = (file: string) => `/assets/blimpmate/research/${file}`

export const paperMetadata = {
  title: 'BlimpMate: A Quiet, Long-Endurance Flying Display for Hands-Free Intelligent Interaction',
  authors: 'Henghao Li, Shan Lin, Yang Xu, Yixiao Wei, Hongjie Li, Suwen Mei, Xindi Lyu, Xing-Dong Yang, and Yuhua Jin',
  venue: 'UIST ’26, Detroit, MI, USA',
  pages: '13',
  doi: '10.1145/3830398.3830527',
} as const

export const acousticMetrics = [
  { label: 'Ambient background', mean: '46.0', trialMaximum: '48.1' },
  { label: 'Routine hovering', mean: '47.1', trialMaximum: '51.9' },
  { label: 'Active vertical repositioning', mean: '50.5', trialMaximum: '56.1' },
  { label: 'Active yaw rotation', mean: '48.3', trialMaximum: '54.6' },
  { label: 'Active horizontal repositioning', mean: '49.7', trialMaximum: '56.2' },
] as const

export const sceneRotations: Record<Scene, { x: number; y: number; z: number }> = {
  lift: { x: -18, y: -32, z: 3 },
  listen: { x: -12, y: 34, z: -2 },
  glow: { x: 17, y: -42, z: 4 },
}

export const highlightSlides = [
  {
    id: 'interaction',
    kind: 'image' as const,
    eyebrow: 'Hands-free interaction',
    title: 'Ask the room. See the answer nearby.',
    body: 'The display remains in the surrounding space instead of asking the user to hold or approach another screen.',
    image: researchAsset('hero-conversation.webp'),
    alt: 'A user speaking to BlimpMate while it displays an expressive face.',
  },
  {
    id: 'display',
    kind: 'metric' as const,
    theme: 'orange' as const,
    eyebrow: 'Large-area display',
    metric: '84 cm',
    title: 'A projected image without a rigid panel.',
    body: 'Approximate usable diagonal, about 33 inches, formed on the envelope itself.',
  },
  {
    id: 'quiet',
    kind: 'metric' as const,
    theme: 'dark' as const,
    eyebrow: 'Routine hover',
    metric: '47.1 dB(A)',
    title: 'Close to the measured room background.',
    body: 'The same room measured 46.0 dB(A) of ambient background noise under the reported test conditions.',
  },
  {
    id: 'network',
    kind: 'image' as const,
    eyebrow: 'Networked intelligence',
    title: 'Light onboard. Connected by design.',
    body: 'Cloud, backend, onboard, and mobile layers divide sensing, reasoning, rendering, and control.',
    image: researchAsset('networked-architecture.webp'),
    alt: 'Diagram of BlimpMate’s distributed interaction architecture.',
  },
  {
    id: 'endurance',
    kind: 'metric' as const,
    theme: 'blue' as const,
    eyebrow: 'Continuous flight',
    metric: '133 min',
    title: 'Long-running mobility with the display off.',
    body: 'Near-neutral buoyancy reduces the continuous thrust needed to remain airborne.',
  },
  {
    id: 'presence',
    kind: 'image' as const,
    eyebrow: 'Situated output',
    title: 'Information appears where the activity is.',
    body: 'The current prototype can present nearby updates, guidance, reminders, and communication views.',
    image: researchAsset('hero-update.webp'),
    alt: 'BlimpMate presenting a live visual update beside a seated user.',
  },
]

export const performanceChapters = [
  {
    id: 'buoyancy',
    eyebrow: '01 / BUOYANT PLATFORM',
    title: 'Hover without constantly fighting gravity.',
    body: 'The integrated prototype weighs 323.7 g while the helium volume provides an estimated 360.0 g of equivalent lift, leaving a 36.3 g lift margin for trim and control.',
    status: '323.7 G MASS / 360.0 G ESTIMATED LIFT',
    visual: 'wave' as PerformanceVisual,
  },
  {
    id: 'display',
    eyebrow: '02 / LIGHTWEIGHT DISPLAY',
    title: 'Turn the envelope into the screen.',
    body: 'A 24.9 g MEMS laser-scanning projector rear-projects through a transparent window onto a matte screen region, producing an image up to roughly 84 cm diagonally.',
    status: '1280 × 720 / 60 HZ / 10-BIT RGB',
    visual: 'scan' as PerformanceVisual,
  },
  {
    id: 'control',
    eyebrow: '03 / DELIBERATE MOTION',
    title: 'Move calmly. Keep the display oriented.',
    body: 'VStab regulates vertical velocity while YawStab combines yaw-rate damping and heading hold. Measured yaw-rate tracking reached an approximate correlation of 0.97.',
    status: '0.25 M/S ASCENT / 0.97 YAW CORRELATION',
    visual: 'steps' as PerformanceVisual,
  },
  {
    id: 'endurance',
    eyebrow: '04 / PRACTICAL ENDURANCE',
    title: 'Stay present for more than a brief demo.',
    body: 'Hovering with lightweight visual content averaged 8.68 W and ran for 73 minutes. With multimedia playback, the same hover condition averaged 14.75 W and ran for 45 minutes.',
    status: '73 MIN HOVER + UI / 45 MIN HOVER + MEDIA',
    visual: 'presence' as PerformanceVisual,
  },
]

export const productHotspots: Array<{
  id: HotspotId
  index: string
  label: string
  title: string
  body: string
  metric: string
  detail: string
  rotation: number
}> = [
  {
    id: 'envelope',
    index: '01',
    label: 'Envelope',
    title: 'Buoyancy and optics share one body.',
    body: 'The custom airtight envelope combines black OPA/Al/PE barrier film, a matte PE projection region, and a transparent PE optical window.',
    metric: '64 × 64 × 64 cm',
    detail: 'Prototype external dimensions',
    rotation: -26,
  },
  {
    id: 'screen',
    index: '02',
    label: 'Projection screen',
    title: 'A large surface with almost no panel mass.',
    body: 'The matte PE region diffuses the scanned light, while the black aluminized body suppresses ambient penetration and unwanted light leakage.',
    metric: '≈ 33 in',
    detail: 'Usable projected diagonal',
    rotation: -8,
  },
  {
    id: 'projector',
    index: '03',
    label: 'Projector',
    title: 'A 24.9 g optical engine.',
    body: 'The Ultimems HD309 MEMS-based laser beam scanning module uses a custom 180° fisheye lens for wide-angle projection at short throw distance.',
    metric: '24.9 g',
    detail: 'Projector module mass',
    rotation: 12,
  },
  {
    id: 'motion',
    index: '04',
    label: 'Motion',
    title: 'Four motors, tuned for indoor control.',
    body: 'Two vertical motors regulate ascent and descent. Two horizontal motors coordinate forward motion and yaw rather than pursuing aggressive flight.',
    metric: '4 × 1404',
    detail: 'Brushless motor layout',
    rotation: 34,
  },
  {
    id: 'sensing',
    index: '05',
    label: 'Sensing',
    title: 'Near-field perception on a small payload.',
    body: 'An OV5647 camera and microphone support multimodal interaction, while a downward-facing optical-flow sensor estimates motion for hover stabilization.',
    metric: 'Cam + mic + flow',
    detail: 'Onboard sensing set',
    rotation: 56,
  },
  {
    id: 'compute',
    index: '06',
    label: 'Compute and power',
    title: 'Lightweight onboard. Higher-level reasoning offboard.',
    body: 'A Raspberry Pi Compute Module 5 manages local sensing, communication, audio, and rendering; external services provide higher-level perception and reasoning.',
    metric: '3.7 V / 3000 mAh',
    detail: 'Rechargeable battery',
    rotation: 78,
  },
]

export const scenarioTabs = [
  {
    id: 'cooking' as ScenarioId,
    label: 'Cooking',
    eyebrow: 'HANDS-FREE TASK GUIDANCE',
    title: 'Keep both hands on the recipe.',
    body: 'Recipe steps, ingredient order, timing cues, and reminders stay visible as the user moves between the cutting area, stove, and sink.',
    source: 'Paper Figure 8a',
    image: researchAsset('scenario-guidance-1.webp'),
    alt: 'BlimpMate displaying cooking guidance near a cutting board.',
  },
  {
    id: 'assembly' as ScenarioId,
    label: 'Assembly',
    eyebrow: 'HANDS-FREE TASK GUIDANCE',
    title: 'Show the next part — and where it goes.',
    body: 'Step-by-step guidance can mark the relevant object, component, or assembly location so the user knows what to pick up and where to place it next.',
    source: 'Paper Figure 8b',
    image: researchAsset('scenario-guidance-2.webp'),
    alt: 'BlimpMate marking the next furniture assembly step beside a chair.',
  },
  {
    id: 'lab' as ScenarioId,
    label: 'Laboratory',
    eyebrow: 'HANDS-BUSY LAB WORK',
    title: 'Instructions that stay off the bench.',
    body: 'Procedural steps and safety reminders remain visible without requiring a touch screen while the user wears gloves or handles sensitive materials.',
    source: 'Paper Figure 8c',
    image: researchAsset('scenario-guidance-3.webp'),
    alt: 'BlimpMate presenting laboratory guidance while a user works with equipment.',
  },
  {
    id: 'nutrition' as ScenarioId,
    label: 'Nutrition',
    eyebrow: 'CONTEXT-AWARE ASSISTANCE',
    title: 'A little more context at the table.',
    body: 'Visible food items can be paired with lightweight nutritional feedback such as approximate calorie content or simple dietary suggestions.',
    source: 'Paper Figure 9a',
    image: researchAsset('scenario-context-1.webp'),
    alt: 'BlimpMate presenting approximate nutritional information near a meal.',
  },
  {
    id: 'reminder' as ScenarioId,
    label: 'Reminder',
    eyebrow: 'PROACTIVE REMINDER',
    title: 'A gentle check before you leave.',
    body: 'When keys, a phone, or an access card remain behind, the display can surface a nearby reminder before the user exits the space.',
    source: 'Paper Figure 9b',
    image: researchAsset('scenario-context-2.webp'),
    alt: 'BlimpMate displaying a left-behind reminder near a person leaving a room.',
  },
  {
    id: 'safety' as ScenarioId,
    label: 'Safety',
    eyebrow: 'SITUATED SAFETY',
    title: 'Make the warning visible where it matters.',
    body: 'Potentially unsafe situations can trigger safety-related reminders near the workspace rather than on a separate device.',
    source: 'Paper Figure 9c',
    image: researchAsset('scenario-context-3.webp'),
    alt: 'BlimpMate displaying a laboratory safety alert.',
  },
  {
    id: 'telepresence' as ScenarioId,
    label: 'Telepresence',
    eyebrow: 'MOBILE TELEPRESENCE',
    title: 'Give remote presence a place in the room.',
    body: 'A remote participant can access the robot’s audiovisual perspective and control movement while their face or avatar remains visible on the blimp surface.',
    source: 'Paper Figure 10',
    image: researchAsset('telepresence-strip.webp'),
    alt: 'Hands-free video calling and VR-mediated telepresence through BlimpMate.',
  },
]

export const systemViews: Record<SystemView, {
  label: string
  title: string
  body: string
  image: string
  alt: string
}> = {
  hardware: {
    label: '01 / SYSTEM VIEW',
    title: 'Hardware platform',
    body: 'A custom helium envelope, carbon-fiber frame, four motors, flight controller, Raspberry Pi Compute Module 5, camera, microphone, optical-flow sensor, projector, and battery.',
    image: researchAsset('hardware-platform.webp'),
    alt: 'Annotated BlimpMate hardware platform.',
  },
  projection: {
    label: '02 / SYSTEM VIEW',
    title: 'Projection display',
    body: 'A 24.9 g MEMS laser beam scanning projector rear-projects through a transparent optical window onto a matte PE screen region integrated into the envelope.',
    image: researchAsset('projection-subsystem.webp'),
    alt: 'Rear-projection subsystem and MEMS laser scanning principle.',
  },
  control: {
    label: '03 / SYSTEM VIEW',
    title: 'Low-level control',
    body: 'VStab regulates vertical velocity; YawStab combines yaw-rate damping, heading hold, and forward/yaw mixing for predictable indoor motion.',
    image: researchAsset('flight-control-architecture.webp'),
    alt: 'Vertical and yaw stabilization control architecture.',
  },
  network: {
    label: '04 / SYSTEM VIEW',
    title: 'Networked interaction',
    body: 'Cloud, backend, onboard, and mobile layers form a continuous loop for multimodal input, reasoning, rendering, communication, and high-level motion control.',
    image: researchAsset('networked-architecture.webp'),
    alt: 'Distributed BlimpMate networked interaction architecture.',
  },
}

export const enduranceModes = [
  { label: 'Hover stabilization · display off', runtime: '> 600 min', power: '< 1.0 W', bar: 100 },
  { label: 'Continuous flight · display off', runtime: '133 min', power: '5.0 W', bar: 22.2 },
  { label: 'Display only · lightweight visuals', runtime: '124 min', power: '5.36 W', bar: 20.7 },
  { label: 'Display only · multimedia', runtime: '58 min', power: '11.6 W', bar: 9.7 },
  { label: 'Hover + lightweight visuals', runtime: '73 min', power: '8.68 W', bar: 12.2 },
  { label: 'Hover + multimedia', runtime: '45 min', power: '14.75 W', bar: 7.5 },
]

export const specificationGroups = [
  {
    title: 'Body and buoyancy',
    rows: [
      ['Dimensions', 'Approximately 64 × 64 × 64 cm'],
      ['Integrated mass', '323.7 g'],
      ['Estimated equivalent lift', '360.0 g'],
      ['Remaining lift margin', '36.3 g'],
      ['Envelope materials', 'OPA/Al/PE barrier film; matte PE screen; transparent PE window'],
    ],
  },
  {
    title: 'Display',
    rows: [
      ['Projection module', 'Ultimems HD309 MEMS-based LBS'],
      ['Projector mass', '24.9 g'],
      ['Signal', '1280 × 720 at 60 Hz; 10-bit RGB laser output'],
      ['Usable display area', 'Up to approximately 84 cm diagonal'],
      ['Average measured luminance', '305.7 cd/m² across a 3 × 3 grid'],
      ['Smallest clearly resolved stripe', '1.5 mm (approximately 0.33 lp/mm)'],
    ],
  },
  {
    title: 'Motion, sensing, and compute',
    rows: [
      ['Propulsion', 'Four 1404 brushless motors'],
      ['Flight controller', 'Flywoo GN405'],
      ['Onboard compute', 'Raspberry Pi Compute Module 5'],
      ['Sensing', 'OV5647 camera, microphone, downward optical-flow sensor'],
      ['Battery', 'Rechargeable 3.7 V, 3000 mAh'],
      ['Active stabilization', 'Vertical velocity and yaw / heading'],
    ],
  },
]


export const presentationStates: Array<{
  id: PresentationStateId
  label: string
  eyebrow: string
  title: string
  body: string
  assetKind: string
  ratio: string
  assetBrief: string
  note: string
}> = [
  {
    id: 'avatar',
    label: 'Avatar',
    eyebrow: 'EXPRESSIVE PRESENCE',
    title: 'A face that makes system state legible.',
    body: 'The projected surface can show an avatar or expression so people nearby can understand whether BlimpMate is listening, thinking, responding, or waiting.',
    assetKind: 'UI MOTION STUDY',
    ratio: '1:1',
    assetBrief: 'Create a clean motion sequence of neutral, listening, thinking, speaking, success, uncertainty, and error states on the real projection surface.',
    note: 'Use the actual projector and envelope; include state timing and audio synchronization.',
  },
  {
    id: 'notification',
    label: 'Notification',
    eyebrow: 'LIGHTWEIGHT UPDATE',
    title: 'A glanceable answer in the surrounding space.',
    body: 'Compact cards can surface time, weather, reminders, and status updates without turning the blimp into a dense desktop interface.',
    assetKind: 'UI SCREEN / VIDEO',
    ratio: '4:3',
    assetBrief: 'Show a restrained notification system with hierarchy for title, key value, supporting detail, urgency, and dismiss or snooze state.',
    note: 'Test at 0.5 m, 1 m, and 2 m under representative indoor lighting.',
  },
  {
    id: 'media',
    label: 'Media',
    eyebrow: 'MOVING IMAGE',
    title: 'Use the large projected surface when motion matters.',
    body: 'Animation, video, and audio are supported, but the paper shows that multimedia content has a materially higher power cost than lightweight visual content.',
    assetKind: 'VIDEO + AUDIO',
    ratio: '16:9',
    assetBrief: 'Record short-form media playback with exposure locked to the projected screen and include a power overlay for lightweight versus multimedia content.',
    note: 'Keep the clip short and readable; document average power and runtime context.',
  },
  {
    id: 'task',
    label: 'Task',
    eyebrow: 'POINT-OF-ACTION GUIDANCE',
    title: 'Instructions that stay close to the work.',
    body: 'Procedural steps, object cues, timers, and safety reminders can remain visible near a cooking surface, assembly task, or laboratory workspace.',
    assetKind: 'SCENARIO FILM',
    ratio: '21:9',
    assetBrief: 'Film one continuous task sequence that shows repositioning between task locations, stable hover, step transitions, and a clear completion state.',
    note: 'Avoid implying autonomous capabilities beyond the current predefined logic and remote-control scope.',
  },
  {
    id: 'communication',
    label: 'Communication',
    eyebrow: 'MOBILE TELEPRESENCE',
    title: 'Give a remote participant a visible place in the room.',
    body: 'A face or avatar can remain projected while the remote participant receives audiovisual perspective and high-level movement control through the networked system.',
    assetKind: 'SPLIT-SCREEN VIDEO',
    ratio: '16:9',
    assetBrief: 'Synchronize the local room view, robot camera feed, remote participant view, control input, and projected representation in a single edit.',
    note: 'Include connection, privacy, mute, and manual-control indicators.',
  },
]

export const researchContributions = [
  {
    index: '01',
    title: 'An integrated flying display platform.',
    body: 'Buoyant aerial mobility, a large-area projection display, multimodal sensing, low-level flight control, onboard computing, communication, and external AI-supported services are combined in one payload-constrained prototype.',
  },
  {
    index: '02',
    title: 'A distinct human-centered aerial design space.',
    body: 'The work emphasizes quiet operation, long endurance, calm motion, and a softer physical presence for sustained close-proximity indoor interaction rather than speed or spectacle.',
  },
  {
    index: '03',
    title: 'System-level evidence and application scenarios.',
    body: 'Payload, display performance, power, flight control, and acoustic output are characterized alongside hands-free guidance, situated assistance, and mobile communication scenarios.',
  },
]

export const futureDirections = [
  {
    index: '01',
    title: 'Smaller, more integrated hardware',
    body: 'Miniaturize control electronics, tighten mechanical integration, and reduce envelope and frame mass so the platform can move more naturally through everyday indoor spaces.',
    kind: 'EXPLODED RENDER',
    ratio: '1:1',
    brief: 'Compare the current prototype with a proposed integrated revision; label volume, mass, and serviceability changes.',
  },
  {
    index: '02',
    title: 'Long-term power and charging',
    body: 'Explore higher energy density, wireless charging, and other deployment strategies without treating extra battery mass as a free improvement.',
    kind: 'SYSTEM CONCEPT',
    ratio: '16:9',
    brief: 'Show a realistic docking or wireless-charging workflow, including approach, alignment, charging state, and safe departure.',
  },
  {
    index: '03',
    title: 'Brighter, clearer, more legible display',
    body: 'Improve screen materials, projection optics, brightness, viewing angle, glare control, and text readability across distance, motion, and ambient light.',
    kind: 'TEST VIDEO',
    ratio: '16:9',
    brief: 'Record a controlled matrix of text sizes, icon sizes, viewing angles, distances, ambient lighting, and in-flight motion.',
  },
  {
    index: '04',
    title: 'Multi-user behavior, privacy, and autonomy',
    body: 'Study orientation toward multiple viewers, competing requests, shared versus private information, camera and microphone expectations, and safe user-relative repositioning.',
    kind: 'USER STUDY',
    ratio: '16:9',
    brief: 'Document a moderated multi-user study with visible consent, recording-state indicators, privacy controls, and emergency-stop behavior.',
  },
]

export const productionNeeds = [
  {
    kind: 'VIDEO', ratio: '16:9 · 4K', title: 'Hero flight film',
    body: 'A calm, continuous sequence showing approach, stable hover, spoken request, display response, user-relative repositioning, and departure.',
    note: '12–18 seconds · locked exposure · quiet indoor room',
  },
  {
    kind: '3D / VIDEO', ratio: '1:1', title: 'Exploded product turntable',
    body: 'A clean 360° turntable with optional hotspots for the envelope, projector, motors, camera and microphone, optical flow, battery, compute, and controller.',
    note: 'Neutral background · 6 labeled stops · transparent export preferred',
  },
  {
    kind: 'VIDEO', ratio: '16:9', title: 'In-flight display legibility',
    body: 'Show text, icons, and media at representative viewing distances and angles while hovering under several indoor lighting conditions.',
    note: 'Front / 45° / 75° views · 0.5–2 m distance · exposure chart',
  },
  {
    kind: 'VIDEO + AUDIO', ratio: '16:9', title: 'Acoustic comparison',
    body: 'Match a 1 m recording geometry and show ambient room, routine hover, vertical motion, yaw, horizontal repositioning, and a reference multirotor.',
    note: 'Calibrated level overlay · identical microphone position',
  },
  {
    kind: 'SCREEN RECORDING', ratio: '9:16', title: 'Mobile controller interface',
    body: 'Show camera feed, connection state, high-level motion commands, emergency stop, and the boundary between automatic stabilization and manual control.',
    note: 'Real device capture · visible latency and safety states',
  },
  {
    kind: 'VIDEO', ratio: '16:9', title: 'Telepresence split view',
    body: 'Synchronize local room footage, remote participant view, movement control, and the projected face or avatar with clear media provenance.',
    note: 'Local / remote / robot POV · synchronized audio',
  },
]
