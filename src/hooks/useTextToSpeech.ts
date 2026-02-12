'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTextToSpeechOptions {
  /** Voice name preference (will find closest match) */
  voiceName?: string;
  /** Speech rate (0.1-10, default 1) */
  rate?: number;
  /** Speech pitch (0-2, default 1) */
  pitch?: number;
  /** Language (default: en-US) */
  lang?: string;
}

interface UseTextToSpeechReturn {
  /** Speak the given text */
  speak: (text: string) => void;
  /** Stop speaking */
  stop: () => void;
  /** Whether currently speaking */
  isSpeaking: boolean;
  /** Whether TTS is supported */
  isSupported: boolean;
  /** Whether TTS is enabled by the user */
  isEnabled: boolean;
  /** Toggle TTS on/off */
  setEnabled: (enabled: boolean) => void;
  /** Available voices */
  voices: SpeechSynthesisVoice[];
}

export function useTextToSpeech(
  options: UseTextToSpeechOptions = {}
): UseTextToSpeechReturn {
  const { voiceName, rate = 1, pitch = 1, lang = 'en-US' } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setEnabled] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check support & load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    setIsSupported(true);

    const loadVoices = () => {
      const available = speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const findVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    // Try exact name match
    if (voiceName) {
      const exact = voices.find((v) =>
        v.name.toLowerCase().includes(voiceName.toLowerCase())
      );
      if (exact) return exact;
    }

    // Prefer a natural-sounding English voice
    const english = voices.filter((v) => v.lang.startsWith('en'));
    const natural = english.find(
      (v) =>
        v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel')
    );
    if (natural) return natural;

    // Fallback to any English voice
    if (english.length > 0) return english[0];

    // Fallback to default
    return voices[0];
  }, [voices, voiceName]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !isEnabled || !text.trim()) return;

      // Cancel any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = lang;

      const voice = findVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [isSupported, isEnabled, rate, pitch, lang, findVoice]
  );

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    isEnabled,
    setEnabled,
    voices,
  };
}
