import { Vibration } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

// A looping, loud alert that keeps ringing until the staff taps "Ko'rdim".
// A single notification chime is easy to miss in a busy kitchen, so we loop
// both the sound and the vibration until explicitly stopped.

let player = null;
let playing = false;

export async function initAudio() {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,      // ring even if the phone is on silent (iOS)
      interruptionMode: 'doNotMix', // grab audio focus so it's heard
      shouldPlayInBackground: false,
    });
  } catch (e) {}
  // Pre-create the player so the first alert starts instantly.
  try {
    if (!player) {
      player = createAudioPlayer(require('../assets/alarm.mp3'));
      player.loop = true;
      player.volume = 1.0;
    }
  } catch (e) {}
}

export function startAlarm() {
  if (playing) return;
  playing = true;
  try {
    if (!player) {
      player = createAudioPlayer(require('../assets/alarm.mp3'));
      player.loop = true;
      player.volume = 1.0;
    }
    player.loop = true;
    player.volume = 1.0;
    try { player.seekTo(0); } catch (e) {}
    player.play();
  } catch (e) {}
  // Continuous vibration (second arg = repeat forever).
  try {
    Vibration.vibrate([0, 600, 300, 600, 300, 600], true);
  } catch (e) {}
}

export function stopAlarm() {
  playing = false;
  try { if (player) player.pause(); } catch (e) {}
  try { Vibration.cancel(); } catch (e) {}
}

export function isAlarming() {
  return playing;
}
