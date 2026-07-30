<!-- Published from the RideGuide application docs. -->

# System requirements

RideGuide's floor is deliberately low: the telemetry cockpit, session
recording, rule-based coach, and offline voice run on almost any 64-bit
Windows PC, and every AI feature has a cloud or CPU path that needs no
dedicated hardware. The ceiling is high because the *optional* local stack —
local LLM, R.I.D.E. GPU voice, GPU speech-to-text — is real inference
running beside a game. This document defines what each tier buys, what each
feature costs (all numbers measured, not guessed), and how to lay the stack
out on one machine, one machine with two GPUs, or two machines.

All tiers require **Windows 10 or 11, 64-bit**. RideGuide is Windows-only:
game detection, OCR, and the offline voice engine use Windows APIs.

## Tiers at a glance

| | Minimum | Recommended — one GPU | Recommended — multi-GPU | Two-machine |
|---|---|---|---|---|
| CPU | 4 cores | 8 cores / 16 threads | 8 cores / 16 threads | Gaming PC: whatever the game needs. Helper: 6+ cores |
| RAM | 8 GB | 32 GB | 32 GB | Gaming PC: 16 GB. Helper: 16 GB |
| GPU | None (beyond what your game needs) | One 12–16 GB card (24 GB unlocks mid-game GPU AI) | Game card + a second 12–16 GB card | Gaming PC: game only. Helper: 8–12 GB card |
| Disk | 2 GB free, SSD | 20 GB free, NVMe | 20 GB free, NVMe | Gaming PC: 2 GB. Helper: 15 GB |
| Network | — | — | — | Wired LAN preferred; solid Wi-Fi works |
| Experience | Full app, cloud/CPU AI, offline voice | Everything local and smooth; GPU AI yields to the game | Everything local on the second card, zero contention with the game | Gaming PC stays untouched; helper carries voice + LLM |

The installer is ~383 MB; the installed app is ~0.7 GB. Everything beyond
that is optional downloads you pick per feature (itemized below).

## What runs at Minimum

The Minimum tier is the **complete app**, not a demo:

- Live telemetry cockpit, HUD overlays, track map, DuckDB session recording,
  lap/sector analysis, strategy engine, tuning garage — all deterministic,
  no GPU, no AI hardware.
- The rule-based coach (all live detectors, spotter, race engineer,
  deterministic debrief) with **offline voice** via Windows SAPI, or
  edge-tts when online.
- **Cloud AI on your own accounts**: Claude (your Claude Code sign-in),
  Gemini (free AI Studio key), Codex (your ChatGPT account). These cost
  RideGuide's machine nothing but an HTTP call — a laptop handles every
  route.
- Tune scanning via the free Windows OCR engine; push-to-talk voice input
  via the Windows speech engine or CPU Whisper.
- The web second screen (phone DDU / timing / pit wall / OBS overlay) —
  the phone does the rendering.

**Console players** (Forza "Data Out" pointed at the PC's IP): the
RideGuide PC never runs the game, so the Minimum tier *is* the whole
requirement — any 8 GB office PC or laptop works.

## What each optional feature costs (measured)

| Feature | Download | On disk | RAM | VRAM (if on GPU) | Notes |
|---|---|---|---|---|---|
| Local LLM — Gemma 4 E2B | 3.1 GB (+1.0 GB vision) | ~4.1 GB | 8 GB machine min | — (CPU default) | Auto-selected below 16 GB RAM or 8 logical cores |
| Local LLM — Gemma 4 E4B | 5.0 GB (+1.0 GB vision) | ~6.0 GB | 16 GB machine min | 6.8 GB measured full footprint | ~21 s load on NVMe; recommended model |
| R.I.D.E. voice — model + phrase pack | 1.9 GB + 0.2 GB | ~2.1 GB | — | 3–4 GB resident | Phrase pack speaks fixed lines with zero synthesis |
| R.I.D.E. voice — inference runtime | 0.3 GB (CPU) / 2.5 GB (CUDA) | ~1–5 GB | — | — | Downloaded on demand, never bundled |
| GPU Whisper STT — CUDA runtime | 1.4 GB | 2.1 GB | — | 0.6 GB (base) → 4.5 GB (large-v3), +2 GB headroom | Measured: 2.06 s per utterance on GPU vs ~13 s CPU |

Plan **~20 GB free NVMe** for the full local stack. Nothing above is
required: every feature falls back — local LLM to cloud routes, R.I.D.E.
voice to SAPI/edge-tts, GPU Whisper to CPU Whisper to Windows speech.

## Single machine, one GPU

This is the tier most players land on, and RideGuide is engineered around
one rule: **the game owns the GPU**. Every local-inference component is
built to yield:

- The local LLM runs on the **CPU by default** (zero VRAM). GPU mode is
  opt-in, only engages with the model plus 1.5 GB free, reserves a
  configurable game headroom (default 4 GB), drops back to the CPU floor
  under VRAM pressure, and never takes the GPU during a VR session.
- R.I.D.E. voice on "auto" loads on **CPU whenever a game is running** —
  a GPU load taken in a menu would still be resident (3–4 GB) when you're
  back on track. The phrase pack keeps fixed lines instant either way.
- GPU Whisper is a transient burst, not a resident load — it's the one
  piece that comfortably shares the game's card (it gates itself on 2 GB
  of free VRAM).

So on one card, "smooth with everything on" is bought mostly with **CPU
and RAM**, not VRAM: 8 cores / 16 threads and 32 GB RAM keep the CPU-floor
LLM, voice synthesis, the game, and the app comfortable together.
12–16 GB of VRAM covers the game plus GPU Whisper. The mid-game GPU
upgrade for the E4B LLM demands roughly 13 GB of *free* VRAM (game
headroom + measured footprint + slack) — in practice that fires beside a
running game only on a 24 GB card. With the game closed, GPU LLM and GPU
voice fit fine on 12 GB.

## Single machine, multi-GPU

A second card removes the contention problem entirely. Every GPU consumer
accepts an explicit device index (`cuda:1`) — the local LLM
(`local_llm_gpu_index`), R.I.D.E. voice (`voice_ride_compute_device`), and
Whisper STT — and Settings shows per-GPU pickers on multi-GPU rigs. An
explicit index deliberately **skips the game-yield gates**: pinning the AI
stack to card 1 means it never defers, because it never touches card 0.

Budget for the second card, everything resident at once:

| Component | VRAM |
|---|---|
| Gemma 4 E4B (GPU-fitted) | 6.8 GB |
| R.I.D.E. voice | 3–4 GB |
| Whisper base + headroom gate | ~2.6 GB |
| **Total** | **~13 GB** |

A **16 GB second card** carries the full stack comfortably. **12 GB**
works if you drop one piece — E2B instead of E4B, or keep Whisper on CPU.
The second card does not need to be fast by gaming standards; an older
12–16 GB card is ideal for this.

## Two machines

The strongest smooth-experience setup: the gaming PC stays at Minimum
spec and a helper box on the LAN carries the inference. Two offload
channels are built in:

- **Voice server**: run `RideGuide --voice-server` (headless) on the
  helper; it serves token-gated TTS over HTTP. Point the gaming PC's
  `voice_ride_remote_url` at it (QR/token pairing in Settings). The gaming
  PC then **never loads the inference runtime at all** — no torch, no
  VRAM, no RAM spike; it just plays back WAV bytes.
- **LLM server**: point the local-LLM base URL at any OpenAI-compatible
  server on the helper — llama-server, LM Studio, vLLM, or Ollama — and
  route whichever tasks you like to it. Same fallback chain as the bundled
  model.

Helper box spec: **6+ cores, 16 GB RAM, an 8–12 GB GPU, ~15 GB disk**.
An 8 GB card covers GPU voice plus the E2B model; 12 GB covers voice plus
E4B. A retired gaming PC is exactly right for this job.

Network: telemetry, TTS audio, and LLM traffic are all small — wired
100 Mbit+ is more than enough, and solid Wi-Fi works. Keep both machines
on the same LAN; the voice server and web dashboards are token-gated but
designed for a trusted home network — never port-forward them to the
internet.

The web second screen extends this further at zero cost: any phone or
tablet on the same Wi-Fi renders the DDU, timing, and pit-wall pages
itself.

## Running costs

Hardware is only half the question; the other half is API spend, and the
floor is **$0**:

- **Fully offline, $0**: bundled local model (CPU) + SAPI or R.I.D.E.
  voice + Windows/CPU speech input. No account, no network.
- **Cloud on accounts you already own, ~$0 marginal**: the per-task
  routing table spreads work across your existing Claude Code sign-in,
  a free-tier Gemini AI Studio key, and/or your ChatGPT account (Codex) —
  RideGuide requires no API key of its own and no subscription.
- **Paid API keys are optional** accelerants, never a requirement; the
  AI Costs panel meters whatever you do spend, per route.

Spending on hardware (a second card, a helper box) buys latency and
privacy, not capability the cloud tiers lack — pick the axis you care
about.
