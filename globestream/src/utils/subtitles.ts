import { SubtitleTrack, SubtitleCue } from '../types';

/**
 * GlobeStream Subtitle Engine
 *
 * Every video in the library always has English subtitles available.
 * For non-English content the subs are pre-translated; for English
 * content they are provided as closed-captions.
 *
 * In a production app these would be fetched from a CDN (VTT / SRT
 * files) or generated on-the-fly via a speech-to-text → translate
 * pipeline (e.g. Whisper + DeepL / LibreTranslate).
 *
 * This module provides:
 *  1.  A deterministic subtitle generator so every media item has
 *      realistic English subtitles keyed to its metadata.
 *  2.  A helper that returns the active cue for any given timestamp.
 */

// ─── Script banks keyed by genre / vibe ──────────────────────────────
const dialogueBanks: Record<string, string[]> = {
  Romance: [
    "I never thought I'd feel this way again.",
    "Do you remember the first time we met?",
    "Stay. Please, just stay.",
    "I came back for you. I always come back for you.",
    "You make me want to be someone better.",
    "I don't care about the distance. I'll find my way to you.",
    "Every love story has its rainy days.",
    "I was scared to fall, but you caught me.",
    "Promise me you won't disappear this time.",
    "My heart knew before my mind did.",
    "It was always you. Even when I tried to forget.",
    "I wrote you a hundred letters I never sent.",
  ],
  Drama: [
    "The truth always comes out eventually.",
    "We can't keep living like this.",
    "I trusted you with everything.",
    "There's something I've been meaning to tell you.",
    "This isn't what we agreed on.",
    "You think you know me, but you don't.",
    "I had no choice. Believe me.",
    "Silence is louder than any words right now.",
    "We all carry secrets we're not proud of.",
    "That was the moment everything changed.",
    "I can't protect you from this anymore.",
    "He looked at me and I knew he understood.",
  ],
  Thriller: [
    "Something doesn't feel right.",
    "We need to get out of here. Now.",
    "Who else knows about this?",
    "The files were deleted — all of them.",
    "I've been watching you for weeks.",
    "Don't turn around. Just keep walking.",
    "The signal went dead at exactly midnight.",
    "If I don't come back, take this to the press.",
    "That's not a coincidence. That's a pattern.",
    "Check the surveillance footage again.",
    "Nobody leaves until we figure this out.",
    "There's a traitor among us.",
  ],
  Crime: [
    "The money was supposed to be here.",
    "No witnesses. That's the rule.",
    "They're onto us. We move tonight.",
    "I didn't sign up for this kind of trouble.",
    "The deal just changed. Double or nothing.",
    "Everyone in this room has blood on their hands.",
    "The heist was flawless — until it wasn't.",
    "Follow the money. It always leads somewhere.",
    "This city runs on two things: fear and cash.",
    "Last chance. Walk away or go all in.",
    "I know what you did. And I have proof.",
    "Trust no one. That's lesson number one.",
  ],
  Comedy: [
    "Wait, that's not how you do it!",
    "I can't believe you just said that.",
    "This is fine. Everything is fine.",
    "Did you seriously just eat all of it?",
    "My plan was perfect. Execution? Not so much.",
    "I'm not lost. I'm exploring… aggressively.",
    "If anyone asks, we were never here.",
    "That was the worst idea — and I loved it.",
    "You call this a disguise?",
    "Okay, new rule: nobody touches anything.",
    "I regret nothing. Well, maybe that one thing.",
    "Why does this always happen to us?",
  ],
  Action: [
    "Get down! Now!",
    "We have less than two minutes.",
    "Reinforcements are on the way.",
    "I've trained my whole life for this.",
    "Cover me while I move to the east side.",
    "That explosion wasn't part of the plan.",
    "They outnumber us ten to one.",
    "I'm not leaving anyone behind.",
    "Weapons hot. Let's finish this.",
    "The bridge won't hold much longer!",
    "One shot. Make it count.",
    "We fight — or we die trying.",
  ],
  'Sci-Fi': [
    "The readings are off the charts.",
    "This timeline shouldn't exist.",
    "The wormhole is destabilising.",
    "Are we sure this is still Earth?",
    "I've seen this exact moment before. Exactly.",
    "The signal originated from outside our galaxy.",
    "Quantum entanglement doesn't work like that.",
    "Every decision splits the universe in two.",
    "The AI has stopped responding to commands.",
    "If we alter the past, the future unravels.",
    "There's something alive in the dark matter.",
    "I think we were never meant to come back.",
  ],
  Mystery: [
    "The last person to enter this room is the key.",
    "Every clue points to someone we already know.",
    "What if the victim is the one who planned it all?",
    "The missing piece has been here all along.",
    "Look at the timestamp. It doesn't add up.",
    "Everyone has an alibi, yet someone is lying.",
    "There's a second set of fingerprints.",
    "I found something hidden in the floorboards.",
    "Why did she change her name three years ago?",
    "The diary entries stop the day before it happened.",
    "The map leads to a place that shouldn't exist.",
    "He knew he was being followed.",
  ],
  Fantasy: [
    "The ancient prophecy speaks of a child born in starlight.",
    "This blade hasn't been drawn in a thousand years.",
    "The barrier between worlds is growing thin.",
    "Magic always comes with a price.",
    "I was chosen, but I never asked for this.",
    "The dragon hasn't been seen since the last age.",
    "If we lose this stone, the kingdom falls.",
    "Legends don't die. They wait.",
    "The forest has eyes. And they're watching.",
    "You carry the bloodline of kings.",
    "The spell can only be broken by true sacrifice.",
    "Beyond the mountains lies a truth no one is ready for.",
  ],
  Animation: [
    "I believe in you, even when you don't.",
    "Adventure is out there — we just have to find it.",
    "Friends don't let friends give up.",
    "Even the smallest light shines in the dark.",
    "Whoa, did you see that?!",
    "Together we're unstoppable!",
    "I may be small, but I have a big heart.",
    "Race you to the finish line!",
    "Let's make today the best day ever!",
    "Don't be afraid of change. Embrace it.",
    "We're not so different, you and I.",
    "The real treasure was the friendship we made.",
  ],
  History: [
    "History is written by the victors.",
    "The empire will not fall today.",
    "Our ancestors fought for this land.",
    "The treaty was signed at dawn.",
    "Revolution doesn't ask for permission.",
    "This throne was built on sacrifice.",
    "The people will not be silenced.",
    "A new era begins with this decree.",
    "War changes everyone it touches.",
    "We stand at the crossroads of civilisation.",
    "Freedom has never come without a cost.",
    "Let the record show: we resisted.",
  ],
  Historical: [
    "History is written by the victors.",
    "The empire will not fall today.",
    "Our ancestors fought for this land.",
    "The treaty was signed at dawn.",
    "Revolution doesn't ask for permission.",
    "This throne was built on sacrifice.",
    "The people will not be silenced.",
    "A new era begins with this decree.",
    "War changes everyone it touches.",
    "We stand at the crossroads of civilisation.",
    "Freedom has never come without a cost.",
    "Let the record show: we resisted.",
  ],
};

const genericLines: string[] = [
  "Let's go.",
  "Are you sure about this?",
  "I don't understand.",
  "Look over there.",
  "We should hurry.",
  "Tell me everything.",
  "This changes everything.",
  "I can't do this alone.",
  "It's now or never.",
  "Something is wrong.",
  "I'm right behind you.",
  "Hold on.",
  "There has to be another way.",
  "You were right all along.",
  "We need more time.",
  "Don't look back.",
  "Keep your voice down.",
  "Watch and learn.",
  "I'll handle it.",
  "That wasn't supposed to happen.",
  "We're running out of options.",
  "Everything will be okay.",
  "I've made my decision.",
  "Follow me.",
];

// ─── Deterministic seed from string ──────────────────────────────────
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Generate English subtitle track ─────────────────────────────────

/**
 * Generate a full English subtitle track for any media item.
 * The lines are picked deterministically from genre-appropriate
 * dialogue banks so the same item always produces the same subs.
 */
export function generateEnglishSubtitles(
  mediaId: string,
  genres: string[],
  durationStr: string,
): SubtitleTrack {
  const totalSeconds = parseDuration(durationStr);
  const rand = seededRandom(hashCode(mediaId));

  // Build a pool of lines weighted toward the item's genres
  const pool: string[] = [];
  for (const genre of genres) {
    const bank = dialogueBanks[genre];
    if (bank) pool.push(...bank);
  }
  // Always pad with generic lines so we never run out
  pool.push(...genericLines, ...genericLines);

  const cues: SubtitleCue[] = [];
  let t = 1; // first cue at 1 s

  while (t < totalSeconds - 5) {
    // Pick a line
    const idx = Math.floor(rand() * pool.length);
    const text = pool[idx];

    // Each cue lasts 2–5 s
    const cueDuration = 2 + Math.floor(rand() * 3.5);
    const end = Math.min(t + cueDuration, totalSeconds);

    cues.push({ start: t, end, text });

    // Gap between cues: 2–8 s (simulates pauses / non-dialogue)
    const gap = 2 + Math.floor(rand() * 6);
    t = end + gap;
  }

  return {
    language: 'English',
    languageCode: 'en',
    cues,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Parse "1h 10m", "55m", "3h 7m", etc. into total seconds */
export function parseDuration(dur: string): number {
  let total = 0;
  const hMatch = dur.match(/(\d+)\s*h/);
  const mMatch = dur.match(/(\d+)\s*m/);
  if (hMatch) total += parseInt(hMatch[1], 10) * 3600;
  if (mMatch) total += parseInt(mMatch[1], 10) * 60;
  return total || 3600; // fallback 1 h
}

/** Given the current playback time, return the active subtitle cue (or null). */
export function getActiveCue(
  track: SubtitleTrack,
  currentTime: number,
): SubtitleCue | null {
  // Binary-ish scan — cues are sorted by start time
  for (const cue of track.cues) {
    if (currentTime >= cue.start && currentTime <= cue.end) return cue;
    if (cue.start > currentTime) break; // past current time, stop
  }
  return null;
}

/** Format seconds into "HH:MM:SS.mmm" (for VTT export). */
export function formatVttTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(Math.floor(s)).padStart(2, '0')}.000`;
}

/** Export a subtitle track as a WebVTT string. */
export function exportToVTT(track: SubtitleTrack): string {
  let vtt = 'WEBVTT\n\n';
  track.cues.forEach((cue, i) => {
    vtt += `${i + 1}\n`;
    vtt += `${formatVttTimestamp(cue.start)} --> ${formatVttTimestamp(cue.end)}\n`;
    vtt += `${cue.text}\n\n`;
  });
  return vtt;
}
