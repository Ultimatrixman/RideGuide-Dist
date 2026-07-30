# RideGuide

**Your AI crew chief for sim racing.**

Live telemetry, professional-grade analysis, and a coach that actually watches
you drive — talking to you on the radio like a real race engineer. Buy once,
own it: no subscription, no account, no cloud requirement, and your telemetry
never leaves your PC.

> **[⬇ Download the latest release](../../releases)** · Windows 10/11 (64-bit)

---

## An AI coach, not a spreadsheet

Every telemetry tool shows you charts. RideGuide is built around the thing the
charts are *for* — getting faster — and puts a coach in your ear while you
drive:

- **Live radio coaching** — braking too early into turn 4, missing apexes,
  overheating your fronts: the coach spots it as it happens and tells you what
  to change, not just what went wrong. It knows when to shut up, too — lines
  are few, specific, and never mid-corner.
- **A full crew** — a spotter for close racing, a race engineer for flags,
  fuel, tires, weather and damage, brake-point cues on request, and post-lap
  corner analysis that ranks where your time is actually going.
- **Session debriefs** — after you park it, get a written debrief of the
  drive: what improved, what kept happening, and what to work on next, grounded
  in your actual laps — never generic advice.
- **Track guides and practice drills** — ask for a guide to a circuit or run
  structured drills with live feedback.
- **Ask it anything** — a chat panel with full access to your telemetry,
  laps, tunes, parts, and history. "Why am I slower in sector 2 than
  yesterday?" gets a real answer with real numbers.
- **Coaching personalities** — supportive mentor to blunt race engineer to
  rally co-driver. Pick the voice you want in your ear, literally: full
  text-to-speech with team-radio effects, an optional high-quality neural
  voice, and push-to-talk so you can talk back.
- **Wheel or gamepad** — pad-native technique metrics and wheel FFB advice.
  The coach adapts to how you actually drive.

## Bring your own AI — or none at all

RideGuide's AI layer is yours to choose:

- **Works fully offline** with a bundled local model — coaching, debriefs and
  chat with zero internet and zero accounts.
- **Or connect what you already have**: Claude, Gemini, OpenAI-compatible
  endpoints, or a local Ollama server. RideGuide routes each job to the model
  best suited for it, and you can see exactly what every feature costs.
- **No middleman markup, ever.** RideGuide never resells AI access — there is
  no subscription because there is nothing to subscribe to.

## Telemetry, visualization, and analysis

- **24 dockable panels** — live gauges (19 skin styles), charts, track map
  with your travelled-road history, g-g diagram, opponent timing, and more,
  in fully customizable layouts.
- **In-game HUD overlay suite** — 14 overlays (delta, inputs, tires, fuel,
  radar, springs, session info…) with per-game profiles and a drag-and-drop
  layout editor.
- **Pro-grade lap analysis** — distance-aligned lap comparison, virtual
  sectors, theoretical best, live delta to your reference laps, corner
  detection with per-corner time-loss ranking, math channels with a safe
  expression engine, per-lap statistical reports.
- **Everything is recorded** — sessions land in a local database
  automatically. Compare today against last month, per car, per track.
- **Export and interop** — CSV, Parquet, MoTeC *.ld*, HTML session reports,
  shareable lap files, iRacing *.ibt* import, and opt-in Discord sharing.
- **Second-screen dashboards** — an optional LAN web server turns a phone or
  tablet into a DDU, timing screen, or pit wall, and feeds OBS overlays for
  streamers. Off by default, token-protected when on.

## Tuning and setup

- **A garage that reads the game** — RideGuide captures your tuning sheets
  and upgrade catalogs straight off the screen, per car, per game. No manual
  data entry.
- **A setup engineer that closes the loop** — describe the symptom
  ("understeer on corner exit"), get ranked setup changes grounded in your
  car's real slider ranges, apply a challenger variant, and let lap-attributed
  A/B validation tell you whether it was actually faster.
- **Parts-aware build advice** — the coach reasons from your full upgrade
  catalog (installed and not), with driveline safety warnings on power builds.
- **Native sim setups** — read, diff and install setup files for supported
  sims, plus community tune interop.

## Progress that persists

- **Skill scoring** across braking, cornering, throttle and consistency after
  every session, with milestones and a career view.
- **Per-car driving memory** — RideGuide learns how you drive each car and
  carries that understanding into every conversation and debrief.

## Supported games

Seven titles are **live-verified** — tested end-to-end against the real game,
not a spec sheet:

| Game | Telemetry |
|---|---|
| Forza Motorsport & Forza Horizon | UDP ("data out") |
| Assetto Corsa | UDP |
| Assetto Corsa Competizione | Shared memory + broadcasting |
| BeamNG.drive | Dedicated mod (deep integration, two-way tuning) |
| DiRT Rally | UDP |
| DiRT 4 | UDP |
| EA SPORTS WRC | UDP |

More titles are in verification and are added as they earn the badge — help
speed that up in [Contributing game data](#contributing-game-data) below.

## Try it free, then buy once

- **7-day trial** with every game and every feature unlocked — no account, no
  card, no strings.
- After the trial, a **licence key** unlocks the app with game slots you
  assign to the titles you play — and re-assign as your racing moves on.
  Keys are verified offline: no activation server, no phone-home, yours
  forever.

## Private by design

- Local-first: telemetry, laps, tunes and coaching history live on **your**
  disk, in open formats.
- No account, no analytics, no phone-home. The only network calls are ones
  you set up (your own AI providers) or explicitly click (update checks,
  downloads).
- Crash reports and game-data contributions are **opt-in**, scrubbed and
  anonymized on your machine, and shared only by your hand.

## System requirements

The floor is deliberately low and the ceiling is real: the complete app runs
on almost any 64-bit Windows PC, and every AI feature has a cloud or CPU path
that needs no special hardware. Beefier hardware buys *local* AI — privacy and
latency, not capability the cloud path lacks. All numbers below are measured,
not guessed.

| | Minimum | Recommended | Most capable |
|---|---|---|---|
| **CPU** | 4 cores | 8 cores / 16 threads | 8 cores / 16 threads |
| **RAM** | 8 GB | 32 GB | 32 GB |
| **GPU** | None beyond your game's | One 12–16 GB card | A second 12–16 GB card, or a helper PC on your LAN |
| **Disk** | 2 GB free (SSD) | 20 GB free (NVMe) | 20 GB free (NVMe) |
| **What you get** | The complete app — every panel, HUD, recording, analysis, the rule-based coach with voice, and cloud AI on your own accounts | Everything running locally — offline LLM coaching, neural voice, GPU speech input — engineered to yield to your game | The full local stack resident with zero game contention: the second card (or second machine) carries the AI, your game never shares |

- **Minimum is the whole app, not a demo.** Telemetry, HUD overlays, session
  recording, lap/corner analysis, strategy, tuning, the rule-based coach with
  spoken output, tune scanning, voice input, and the phone dashboards all run
  there — plus full AI coaching through cloud providers you already have.
  Console players (Forza Data Out → your PC): any 8 GB office PC or laptop is
  the entire requirement, since the PC never runs the game.
- **What the optional local-AI features cost** (each is a separate download,
  and each falls back gracefully if you skip it):

| Optional feature | Download | Needs |
|---|---|---|
| Local AI model (compact) | ~3–4 GB | Runs on CPU, 8 GB RAM machines |
| Local AI model (recommended) | ~5–6 GB | 16 GB RAM; ~7 GB VRAM if GPU-fitted |
| Neural coach voice (R.I.D.E.) | ~2–4 GB | 3–4 GB VRAM on GPU, or CPU |
| GPU speech-to-text | ~1.4 GB | ~1–5 GB VRAM in transient bursts (2 s vs ~13 s on CPU) |

- **On one card, the game owns the GPU** — that's an engineering rule, not a
  hope. The local model runs on CPU by default, the voice engine loads on CPU
  while a game is running, and everything GPU-side gates itself on free VRAM
  and steps aside under pressure.
- **Running costs floor at $0**: fully offline with the bundled model, or
  cloud AI routed across accounts you already own. RideGuide never requires
  its own API key and never charges a subscription; an in-app cost panel
  meters anything you do choose to spend.

Full details — per-feature measurements, multi-GPU layout, and the
two-machine setup — in **[SYSTEM_REQUIREMENTS.md](docs/SYSTEM_REQUIREMENTS.md)**.

---

## Downloads & updates

Installers and update payloads are published as **[Releases](../../releases)**.
RideGuide checks here for updates automatically (Settings ▸ Data & Sharing ▸
Updates), or grab the latest installer directly. Each release lists a SHA-256
checksum so you can verify your download.

> **Note on SmartScreen:** early builds are unsigned, so Windows SmartScreen
> may warn on first run ("More info" → "Run anyway"). This clears as the app
> builds download reputation.

## Feedback, bugs, and feature requests

Have an idea, hit a bug, or want to shape where RideGuide goes next? The app
has a built-in form — **Settings ▸ Data & Sharing ▸ Feedback & Suggestions** —
that opens a prefilled issue here in your browser. You can also
**[open an issue directly](../../issues/new/choose)**. Everything filed here
feeds the community-driven roadmap.

## Contributing game data

Each game adapter is marked *verified* only once it has been confirmed against
the real game. You can help verify the game you play — opt in from
**Settings ▸ Data & Sharing ▸ Contribute game data**. Contributions are
scrubbed and anonymized on your machine before you ever share them; nothing
leaves your PC without your explicit consent.

---

*RideGuide runs on Windows 10/11 (64-bit). The application source is developed
in a private repository; this is the public home for releases and community.*
