import { useRef, useState, useEffect, useCallback } from "react";

export function useSpeechRecognition() {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.maxAlternatives = 5;
    rec.onresult = (e) => {
      const alternatives = [];
      for (let i = 0; i < e.results[0].length; i++) {
        alternatives.push(e.results[0][i].transcript.toLowerCase().trim());
      }
      setResult(alternatives.join("|"));
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, []);

  const startListening = useCallback(() => {
    setResult("");
    if (recRef.current) {
      try {
        recRef.current.start();
        setListening(true);
      } catch {}
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {}
    }
    setListening(false);
  }, []);

  return { listening, result, startListening, stopListening, supported };
}
