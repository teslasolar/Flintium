// Screen recorder (display-media). Saves an .mp4/.webm of the page session.

import { $ } from "./dom.js";
import { state } from "./state.js";

function pickMime() {
  return MediaRecorder.isTypeSupported("video/mp4;codecs=avc1,opus")
    ? "video/mp4;codecs=avc1,opus"
    : "video/webm";
}

function downloadBlob(chunks, mime) {
  const blob = new Blob(chunks, { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "TagDB_v2" + (mime.includes("mp4") ? ".mp4" : ".webm");
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function toggleRec() {
  const btn = $("btnRec");
  if (state.recorder?.state === "recording") {
    state.recorder.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: "browser", frameRate: 30 },
      audio: true,
      preferCurrentTab: true,
      selfBrowserSurface: "include",
      systemAudio: "include",
    });
    const mime = pickMime();
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8e6 });
    state.recorder = rec;
    state.recChunks = [];
    rec.ondataavailable = (e) => { if (e.data.size) state.recChunks.push(e.data); };
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      downloadBlob(state.recChunks, mime);
      btn.textContent = "● REC";
      btn.classList.remove("on");
    };
    stream.getVideoTracks()[0].onended = () => {
      if (rec.state === "recording") rec.stop();
    };
    rec.start(1000);
    btn.textContent = "■ STOP";
    btn.classList.add("on");
  } catch (e) {}
}
