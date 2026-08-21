"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/user-store";
import {
  getVolunteerEventsAction,
  getEventRegisteredStudentsAction,
  submitBatchAttendanceAction,
} from "@/actions/attendance";
import type { RegisteredStudent } from "@/types";

type ActiveTab = "SCANNER" | "MANUAL";
type ScannedEntry = RegisteredStudent & { method: "SCANNED" | "MANUAL" };

// ── Audio feedback using Web Audio API ──────────────────────────────────────
function playBeep(type: "success" | "duplicate" | "error") {
  try {
    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "duplicate") {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // AudioContext can fail if not yet interacted with
  }
}

export default function AttendanceScannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get("eventId");

  const {
    scannerStudents,
    scannedIds,
    setScannerStudents,
    markScanned,
    clearScanner,
  } = useStore();

  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(
    preselectedEventId || "",
  );
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [scannedList, setScannedList] = useState<ScannedEntry[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [lastScan, setLastScan] = useState<{
    name: string;
    success: boolean;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("SCANNER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [manualSearch, setManualSearch] = useState("");
  const [scannerReady, setScannerReady] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const nativeVideoRef = useRef<HTMLVideoElement | null>(null);
  const nativeStreamRef = useRef<MediaStream | null>(null);
  const nativeAnimFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef(false);
  const lastScannedCodeRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);
  const scannedIdsRef = useRef<Set<string>>(scannedIds);
  const scannerStudentsRef = useRef<RegisteredStudent[]>(scannerStudents);

  useEffect(() => {
    scannedIdsRef.current = scannedIds;
  }, [scannedIds]);

  useEffect(() => {
    scannerStudentsRef.current = scannerStudents;
  }, [scannerStudents]);

  useEffect(() => {
    getVolunteerEventsAction().then(setEvents).catch(console.error);
    return () => clearScanner();
  }, [clearScanner]);

  useEffect(() => {
    if (selectedEventId) {
      const event = events.find((e) => e.id === selectedEventId);
      if (event?.sessions?.length) {
        setSessions(event.sessions);
        setSelectedSessionId(event.sessions[0].id);
      } else {
        setSessions([]);
        setSelectedSessionId("");
      }
    }
  }, [selectedEventId, events]);

  async function loadStudents() {
    if (!selectedEventId) return;
    try {
      setLoadingStudents(true);
      const students = await getEventRegisteredStudentsAction(selectedEventId);
      setScannerStudents(students);
      setStudentsLoaded(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch {
      setError("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  }

  const processBarcodeValue = useCallback(
    (value: string, method: "SCANNED" | "MANUAL" = "SCANNED") => {
      const now = Date.now();
      const code = value.trim().toUpperCase();

      if (
        code === lastScannedCodeRef.current &&
        now - lastScanTimeRef.current < 2000
      ) {
        return;
      }
      lastScannedCodeRef.current = code;
      lastScanTimeRef.current = now;

      const student = scannerStudentsRef.current.find(
        (s) =>
          s.rollNumber?.toUpperCase() === code ||
          s.studentId === code ||
          s.registrationId === code,
      );

      if (!student) {
        playBeep("error");
        setLastScan({ name: `Not found (${code})`, success: false });
        return;
      }

      if (scannedIdsRef.current.has(student.studentId)) {
        playBeep("duplicate");
        setLastScan({
          name: `Already scanned: ${student.studentName}`,
          success: false,
        });
        return;
      }

      markScanned(student.studentId);
      setScannedList((prev) => [{ ...student, method }, ...prev]);
      playBeep("success");
      setLastScan({ name: student.studentName, success: true });
    },
    [markScanned],
  );

  // ── Camera: Native BarcodeDetector engine ──────────────────────────────
  const startNativeBarcodeDetector = useCallback(async () => {
    try {
      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      const formats = await BarcodeDetectorClass.getSupportedFormats();
      const supported = [
        "code_128",
        "code_39",
        "code_93",
        "codabar",
        "ean_13",
        "ean_8",
        "itf",
        "upc_a",
        "upc_e",
        "qr_code",
      ].filter((f) => formats.includes(f));

      const detector = new BarcodeDetectorClass({
        formats: supported.length > 0 ? supported : formats,
      });

      const constraints: MediaStreamConstraints = {
        video: { facingMode: "environment" },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      nativeStreamRef.current = stream;

      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.setAttribute("autoplay", "true");
      video.muted = true;
      await video.play();

      nativeVideoRef.current = video;

      const container = document.getElementById("reader-container");
      if (container) {
        container.innerHTML = "";
        container.appendChild(video);
      }

      setScannerReady(true);
      isScanningRef.current = true;

      async function detectLoop() {
        if (!isScanningRef.current) return;
        try {
          if (video.readyState >= 2) {
            const barcodes = await detector.detect(video);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) {
                processBarcodeValue(code, "SCANNED");
              }
            }
          }
        } catch {
          // Detection frame non-fatal error
        }
        nativeAnimFrameRef.current = requestAnimationFrame(detectLoop);
      }

      nativeAnimFrameRef.current = requestAnimationFrame(detectLoop);
    } catch (err: any) {
      console.warn("Native BarcodeDetector failed, using html5-qrcode fallback:", err);
      startHtml5QrCode();
    }
  }, [processBarcodeValue]);

  // ── Camera: Fallback html5-qrcode engine ────────────────────────────────
  const startHtml5QrCode = useCallback(async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {}
        html5QrCodeRef.current = null;
      }

      const qrCode = new Html5Qrcode("reader-container");
      html5QrCodeRef.current = qrCode;

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.floor(minEdge * 0.75);
          return { width: Math.max(edge, 180), height: Math.max(edge, 180) };
        },
        aspectRatio: 1.0,
      };

      await qrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText: string) => {
          processBarcodeValue(decodedText, "SCANNED");
        },
        () => {},
      );

      setScannerReady(true);
    } catch (err: any) {
      setCameraError(err?.message || "Camera permission denied.");
      setScannerReady(false);
    }
  }, [processBarcodeValue]);

  const stopCamera = useCallback(async () => {
    isScanningRef.current = false;
    if (nativeAnimFrameRef.current) {
      cancelAnimationFrame(nativeAnimFrameRef.current);
      nativeAnimFrameRef.current = null;
    }
    if (nativeStreamRef.current) {
      nativeStreamRef.current.getTracks().forEach((t) => t.stop());
      nativeStreamRef.current = null;
    }
    if (nativeVideoRef.current) {
      nativeVideoRef.current.srcObject = null;
      nativeVideoRef.current = null;
    }
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScannerReady(false);
  }, []);

  useEffect(() => {
    if (!studentsLoaded || activeTab !== "SCANNER") return;

    let unmounted = false;

    async function initCamera() {
      try {
        setCameraError("");
        const hasNative =
          typeof window !== "undefined" && "BarcodeDetector" in window;

        if (hasNative) {
          await startNativeBarcodeDetector();
        } else {
          await startHtml5QrCode();
        }
      } catch (e: any) {
        if (!unmounted) {
          setCameraError(e.message || "Failed to initialize camera.");
        }
      }
    }

    initCamera();

    return () => {
      unmounted = true;
      stopCamera();
    };
  }, [studentsLoaded, activeTab, startNativeBarcodeDetector, startHtml5QrCode, stopCamera]);

  function handleBarcodeScan(code: string) {
    processBarcodeValue(code, "SCANNED");
    setBarcodeInput("");
  }

  function handleManualAdd(student: RegisteredStudent) {
    if (student.rollNumber) {
      processBarcodeValue(student.rollNumber, "MANUAL");
    } else {
      processBarcodeValue(student.studentId, "MANUAL");
    }
  }

  async function handleSubmit() {
    if (scannedList.length === 0) return;
    try {
      setSubmitting(true);
      setError("");
      await submitBatchAttendanceAction(
        selectedSessionId,
        selectedEventId,
        scannedList,
      );
      setScannedList([]);
      setLastScan(null);
      alert(`Submitted attendance for ${scannedList.length} students`);
    } catch (e: any) {
      setError(e.message || "Failed to submit attendance");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredStudents = manualSearch.trim()
    ? scannerStudents.filter(
        (s) =>
          s.studentName
            .toLowerCase()
            .includes(manualSearch.toLowerCase()) ||
          s.rollNumber?.toLowerCase().includes(manualSearch.toLowerCase()),
      )
    : [];

  return (
    <main className="min-h-screen bg-[#F7F7F8] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D] mb-4 sm:mb-6">
          Attendance Terminal
        </h1>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-xs sm:text-sm font-medium break-words">
            {error}
          </div>
        )}

        {!studentsLoaded ? (
          <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                Select Event
              </label>
              <select
                className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-white text-[#051B1D]"
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setSelectedSessionId("");
                }}
              >
                <option value="" className="text-[#051B1D]">Choose event...</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id} className="text-[#051B1D]">
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            {sessions.length > 0 && (
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Select Session
                </label>
                <select
                  className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-white text-[#051B1D]"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                >
                  <option value="" className="text-[#051B1D]">Choose session...</option>
                  {sessions.map((s: any) => (
                    <option key={s.id} value={s.id} className="text-[#051B1D]">
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={loadStudents}
              disabled={
                !selectedEventId || !selectedSessionId || loadingStudents
              }
              className="w-full bg-[#00666B] text-white border-2 border-black rounded-xl px-4 py-3 sm:py-3.5 font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
            >
              {loadingStudents
                ? "Loading students..."
                : `Load Students (1 read)`}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats bar */}
            <div className="bg-white border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                    Loaded
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-[#00666B]">
                    {scannerStudents.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Scanned</p>
                  <p className="text-xl sm:text-2xl font-black text-[#051B1D]">
                    {scannedIds.size}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Remaining</p>
                  <p className="text-xl sm:text-2xl font-black text-[#051B1D]">
                    {scannerStudents.length - scannedIds.size}
                  </p>
                </div>
              </div>

              {lastScan && (
                <div
                  className={`mt-3 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold text-center border-2 ${lastScan.success ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-400 text-red-600"}`}
                >
                  {lastScan.success ? "✓" : "✗"} {lastScan.name}
                </div>
              )}
            </div>

            {/* Mode tabs */}
            <div className="grid grid-cols-2 gap-2">
              {(["SCANNER", "MANUAL"] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2.5 sm:py-3 rounded-xl border-2 border-black font-bold text-xs sm:text-sm transition-all ${
                    activeTab === tab
                      ? "bg-[#00666B] text-white shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]"
                      : "bg-white text-[#051B1D] shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  }`}
                >
                  {tab === "SCANNER" ? "📷 Camera" : "⌨️ Manual / Search"}
                </button>
              ))}
            </div>

            {/* Camera Viewfinder */}
            {activeTab === "SCANNER" && (
              <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
                <div className="relative w-full aspect-square bg-[#051B1D]">
                  <div
                    id="reader-container"
                    className="absolute inset-0 w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"
                  />

                  {scannerReady && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="relative z-10 w-44 sm:w-52 h-44 sm:h-52">
                        <span className="absolute -top-[2px] -left-[2px] w-6 sm:w-7 h-6 sm:h-7 border-t-[3px] border-l-[3px] border-[#73FFFF]" />
                        <span className="absolute -top-[2px] -right-[2px] w-6 sm:w-7 h-6 sm:h-7 border-t-[3px] border-r-[3px] border-[#73FFFF]" />
                        <span className="absolute -bottom-[2px] -left-[2px] w-6 sm:w-7 h-6 sm:h-7 border-b-[3px] border-l-[3px] border-[#73FFFF]" />
                        <span className="absolute -bottom-[2px] -right-[2px] w-6 sm:w-7 h-6 sm:h-7 border-b-[3px] border-r-[3px] border-[#73FFFF]" />
                      </div>
                      <p className="absolute bottom-4 left-0 right-0 text-center text-[10px] sm:text-xs text-white/80 font-bold">
                        Align barcode in frame
                      </p>
                    </div>
                  )}

                  {!scannerReady && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#051B1D]/80 p-4">
                      <p className="text-white text-xs sm:text-sm font-bold animate-pulse">
                        Initializing camera...
                      </p>
                    </div>
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#051B1D]/90 p-4 text-center">
                      <p className="text-2xl sm:text-3xl">📵</p>
                      <p className="text-white text-xs sm:text-sm font-bold">{cameraError}</p>
                      <p className="text-white/60 text-[10px] sm:text-xs">
                        Switch to Manual tab to mark attendance
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Roll Form */}
            <div className="bg-white border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
              <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-2">
                Barcode / Roll Input
              </label>
              <input
                ref={inputRef}
                className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-white text-[#051B1D] placeholder:text-gray-400 uppercase"
                placeholder="Point scanner or type roll number..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && barcodeInput.trim()) {
                    handleBarcodeScan(barcodeInput.trim());
                  }
                }}
              />
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                Press Enter or scan barcode to mark attendance
              </p>
            </div>

            {/* Manual Search */}
            {activeTab === "MANUAL" && (
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-2">
                  Manual Search
                </label>
                <input
                  className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-white text-[#051B1D] placeholder:text-gray-400"
                  placeholder="Search by name or roll number..."
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                />
                {filteredStudents.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {filteredStudents.map((s) => (
                      <div
                        key={s.studentId}
                        onClick={() => handleManualAdd(s)}
                        className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 cursor-pointer transition-all gap-2 ${scannedIds.has(s.studentId) ? "border-green-400 bg-green-50" : "border-black hover:border-[#39A8AD]"}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-bold text-[#051B1D] truncate">
                            {s.studentName}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400 truncate">{s.rollNumber}</p>
                        </div>
                        {scannedIds.has(s.studentId) ? (
                          <span className="text-green-600 font-bold text-xs sm:text-sm shrink-0">
                            ✓
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-[#00666B] shrink-0">
                            Mark
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Scanned List */}
            {scannedList.length > 0 && (
              <div className="bg-white border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
                <h3 className="font-black text-[#051B1D] text-sm sm:text-base mb-2 sm:mb-3">
                  Scanned ({scannedList.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scannedList.map((s) => (
                    <div
                      key={s.studentId}
                      className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-xl gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-[#051B1D] truncate">
                          {s.studentName}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400 truncate">{s.rollNumber}</p>
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-400 shrink-0">{s.method}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || scannedList.length === 0}
              className="w-full bg-[#00666B] text-white border-2 border-black rounded-2xl px-4 py-3.5 sm:py-4 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : `Submit Attendance (${scannedList.length} students) →`}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
