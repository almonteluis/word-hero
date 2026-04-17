function speak(word) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const pickVoice = (voices) => {
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

  const buildUtterances = (voice) => {
    const utt = new SpeechSynthesisUtterance(word);
    utt.rate = 0.85;
    utt.pitch = 1.3;
    utt.volume = 1.0;
    if (voice) utt.voice = voice;
    window.speechSynthesis.speak(utt);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    buildUtterances(pickVoice(voices));
  } else {
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        buildUtterances(pickVoice(window.speechSynthesis.getVoices()));
      },
      { once: true },
    );
  }
}

export { speak };
