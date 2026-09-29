import { useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, Square } from "lucide-react";

const getSpeechChunks = (text, maxLength = 220) => {
  const chunks = [];
  let current = "";
  const sentences = text.match(/[^.!?]+[.!?]*\s*|[^.!?]+$/g) || [text];

  sentences.forEach((sentence) => {
    let remaining = sentence.trim();
    if (remaining.length > maxLength && current) {
      chunks.push(current);
      current = "";
    }
    while (remaining.length > maxLength) {
      let splitAt = remaining.lastIndexOf(" ", maxLength);
      if (splitAt < 1) splitAt = maxLength;
      const piece = remaining.slice(0, splitAt).trim();
      if (piece) chunks.push(piece);
      remaining = remaining.slice(splitAt).trim();
    }
    if (!remaining) return;
    if (current && `${current} ${remaining}`.length > maxLength) {
      chunks.push(current);
      current = remaining;
    } else {
      current = current ? `${current} ${remaining}` : remaining;
    }
  });

  if (current) chunks.push(current);
  return chunks;
};

export default function ArticleListen({ title, description, content }) {
  const [status, setStatus] = useState("idle");
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState([]);
  const [voiceGender, setVoiceGender] = useState("female");
  const [error, setError] = useState("");
  const chunksRef = useRef([]);
  const playbackIdRef = useRef(0);
  const activeRef = useRef(false);
  const settingsRef = useRef({ speed, voiceGender, voices });
  const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  settingsRef.current = { speed, voiceGender, voices };

  useEffect(() => {
    if (!supported) return undefined;
    const synthesis = window.speechSynthesis;
    const updateVoices = () => setVoices(synthesis.getVoices());
    updateVoices();
    synthesis.addEventListener?.("voiceschanged", updateVoices);
    return () => {
      activeRef.current = false;
      playbackIdRef.current += 1;
      synthesis.removeEventListener?.("voiceschanged", updateVoices);
      synthesis.cancel();
    };
  }, [supported]);

  function speakChunk(index, playbackId) {
    if (playbackId !== playbackIdRef.current || !activeRef.current) return;
    const chunk = chunksRef.current[index];
    if (!chunk) {
      activeRef.current = false;
      setStatus("idle");
      return;
    }

    const { speed: currentSpeed, voiceGender: currentGender, voices: currentVoices } = settingsRef.current;
    const genderPattern = currentGender === "male"
      ? /\b(male|man|boy|david|daniel|alex|george|james|guy|ryan|mark|ravi|arjun)\b/i
      : /\b(female|woman|girl|samantha|karen|victoria|susan|zira|jenny|aria|ava|emma|hazel|sonia|neerja)\b/i;
    const voice = currentVoices.find((candidate) => genderPattern.test(`${candidate.name} ${candidate.voiceURI}`))
      || currentVoices.find((candidate) => candidate.default)
      || null;
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.rate = currentSpeed;
    utterance.pitch = currentGender === "male" ? 0.82 : 1.18;
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.onstart = () => {
      if (playbackId === playbackIdRef.current) setStatus("playing");
    };
    utterance.onend = () => {
      if (playbackId !== playbackIdRef.current || !activeRef.current) return;
      speakChunk(index + 1, playbackId);
    };
    utterance.onerror = (event) => {
      if (playbackId !== playbackIdRef.current || !activeRef.current) return;
      if (event.error === "canceled" || event.error === "interrupted") return;
      activeRef.current = false;
      setStatus("idle");
      setError("Audio playback stopped unexpectedly. Please try again.");
    };

    window.speechSynthesis.speak(utterance);
  }

  function readArticle() {
    if (!supported) return;
    if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
      return;
    }
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }

    const parsedContent = new DOMParser().parseFromString(content || "", "text/html");
    parsedContent.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
    const bodyText = parsedContent.body.innerText || parsedContent.body.textContent || "";
    const spokenText = [title, description, bodyText].filter(Boolean).join(". ").replace(/\s+/g, " ").trim();
    const chunks = getSpeechChunks(spokenText);
    if (!chunks.length) {
      setError("There is no article text available to read.");
      return;
    }

    setError("");
    chunksRef.current = chunks;
    activeRef.current = true;
    playbackIdRef.current += 1;
    const playbackId = playbackIdRef.current;
    window.speechSynthesis.cancel();
    setStatus("playing");
    speakChunk(0, playbackId);
  }

  function stopReading() {
    if (!supported) return;
    activeRef.current = false;
    playbackIdRef.current += 1;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
        <span>Speed</span>
        <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} aria-label="Article playback speed"
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={1.75}>1.75x</option>
          <option value={2}>2x</option>
        </select>
      </label>
      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
        <span>Voice</span>
        <select value={voiceGender} onChange={(event) => setVoiceGender(event.target.value)} aria-label="Article playback voice" disabled={!supported}
          className="max-w-44 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60">
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </label>
      {status !== "idle" && <>
        <span className="text-sm text-slate-500" aria-live="polite">{status === "playing" ? "Now playing" : "Paused"}</span>
        <button type="button" onClick={stopReading} aria-label="Stop article audio" title="Stop" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          <Square size={15} aria-hidden="true" />
        </button>
      </>}
      <button type="button" onClick={readArticle} disabled={!supported} aria-label={status === "playing" ? "Pause article audio" : status === "paused" ? "Resume article audio" : "Listen to article"} title={!supported ? "Audio playback is not supported in this browser" : status === "playing" ? "Pause" : status === "paused" ? "Resume" : "Listen to article"}
        className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50">
        <Headphones size={17} aria-hidden="true" />
        {status === "playing" ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        {status === "playing" ? "Pause" : status === "paused" ? "Resume" : "Listen to article"}
      </button>
      {error && <p role="alert" className="w-full text-right text-sm text-rose-600">{error}</p>}
      {!supported && <p role="status" className="w-full text-right text-sm text-slate-500">Audio playback is not supported in this browser.</p>}
    </div>
  );
}
