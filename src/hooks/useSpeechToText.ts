'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechToTextOptions {
  /** Language for recognition (default: en-US) */
  lang?: string;
  /** Whether to use continuous recognition */
  continuous?: boolean;
  /** Whether to include interim (partial) results */
  interimResults?: boolean;
  /** Called when a final transcript is available */
  onResult?: (transcript: string) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
}

interface UseSpeechToTextReturn {
  /** Current transcript text (may include interim) */
  transcript: string;
  /** Whether the mic is actively listening */
  isListening: boolean;
  /** Whether the browser supports speech recognition */
  isSupported: boolean;
  /** Start listening */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Reset the transcript */
  resetTranscript: () => void;
}

export function useSpeechToText(
  options: UseSpeechToTextOptions = {}
): UseSpeechToTextReturn {
  const {
    lang = 'en-US',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Keep callback refs fresh
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onErrorRef.current?.('Speech recognition is not supported in this browser.');
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        onResultRef.current?.(finalTranscript);
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' and 'aborted' are not real errors
      if (event.error === 'no-speech' || event.error === 'aborted') return;

      setIsListening(false);

      if (event.error === 'not-allowed') {
        onErrorRef.current?.('Microphone access denied. Please allow microphone access.');
      } else {
        onErrorRef.current?.(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if continuous mode and not manually stopped
      if (continuous && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          // ignore — already started or page navigated
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      onErrorRef.current?.('Failed to start speech recognition.');
    }
  }, [lang, continuous, interimResults]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null; // prevent auto-restart
      ref.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
