function speak(word, lang = "en") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const pickVoice = (voices) => {
    if (lang === "es") {
      const preferred = [
        "Google español",
        "Google Español",
        "Microsoft Sabina Desktop",
        "Paulina",
        "Monica",
        "Juan",
      ];
      return (
        voices.find((v) => preferred.includes(v.name)) ||
        voices.find((v) => /female/i.test(v.name) && /es[-_]MX/i.test(v.lang)) ||
        voices.find((v) => /female/i.test(v.name) && /es/i.test(v.lang)) ||
        voices.find((v) => /es[-_]/i.test(v.lang))
      );
    }
    // English (default)
    const preferred = [
      "Google UK English Female",
      "Samantha",
      "Karen",
      "Moira",
      "Tessa",
      "Microsoft Zira Desktop",
      "Google US English",
    ];
    return (
      voices.find((v) => preferred.includes(v.name)) ||
      voices.find((v) => /female/i.test(v.name) && /en[-_]GB/i.test(v.lang)) ||
      voices.find((v) => /female/i.test(v.name) && /en/i.test(v.lang)) ||
      voices.find((v) => /en[-_]US/i.test(v.lang)) ||
      voices.find((v) => /en/i.test(v.lang))
    );
  };

  const buildUtterance = (voice) => {
    const utt = new SpeechSynthesisUtterance(word);
    utt.lang = lang === "es" ? "es-MX" : "en-US";
    utt.rate = 0.9;
    utt.pitch = 1.0;
    utt.volume = 1.0;
    if (voice) utt.voice = voice;
    window.speechSynthesis.speak(utt);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    buildUtterance(pickVoice(voices));
  } else {
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        buildUtterance(pickVoice(window.speechSynthesis.getVoices()));
      },
      { once: true },
    );
  }
}

export { speak };
