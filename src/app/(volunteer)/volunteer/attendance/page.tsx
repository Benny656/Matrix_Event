"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/user-store";
import {
  getVolunteerEventsAction,
  getEventRegisteredStudentsAction,
  submitBatchAttendanceAction,
} from "@/actions/attendance";
import type { RegisteredStudent } from "@/types";

type ScannedEntry = RegisteredStudent & { method: "SCANNED" | "MANUAL" };

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [manualSearch, setManualSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getVolunteerEventsAction().then(setEvents).catch(console.error);
    return () => clearScanner();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const event = events.find((e) => e.id === selectedEventId);
      if (event?.sessions) setSessions(event.sessions);
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

  function normalizeRoll(raw: string): string {
    return raw.replace(/^C1/i, "").trim().toUpperCase();
  }

  function handleBarcodeScan(raw: string) {
    const roll = normalizeRoll(raw);
    const student = scannerStudents.find(
      (s) => s.rollNumber?.toUpperCase() === roll,
    );

    if (!student) {
      setLastScan({ name: `${roll} — not found`, success: false });
      setBarcodeInput("");
      return;
    }

    if (scannedIds.has(student.studentId)) {
      setLastScan({
        name: `${student.studentName} — already scanned`,
        success: false,
      });
      setBarcodeInput("");
      return;
    }

    markScanned(student.studentId);
    setScannedList((prev) => [...prev, { ...student, method: "SCANNED" }]);
    setLastScan({ name: student.studentName, success: true });
    setBarcodeInput("");
  }

  function handleManualAdd(student: RegisteredStudent) {
    if (scannedIds.has(student.studentId)) {
      setLastScan({
        name: `${student.studentName} — already marked`,
        success: false,
      });
      return;
    }
    markScanned(student.studentId);
    setScannedList((prev) => [...prev, { ...student, method: "MANUAL" }]);
    setLastScan({ name: student.studentName, success: true });
    setManualSearch("");
  }

  async function handleSubmit() {
    if (!selectedSessionId) return setError("Select a session first");
    if (scannedList.length === 0) return setError("No students scanned yet");
    try {
      setSubmitting(true);
      setError("");
      const result = await submitBatchAttendanceAction(
        selectedSessionId,
        selectedEventId,
        scannedList.map((s) => ({
          studentId: s.studentId,
          studentName: s.studentName,
          rollNumber: s.rollNumber,
          department: s.department,
          yearOfStudy: s.yearOfStudy,
          programType: s.programType,
          method: s.method,
        })),
      );
      setSubmitted(true);
      clearScanner();
    } catch (e: any) {
      setError(e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredStudents =
    manualSearch.length > 1
      ? scannerStudents
          .filter(
            (s) =>
              s.studentName
                .toLowerCase()
                .includes(manualSearch.toLowerCase()) ||
              s.rollNumber?.toLowerCase().includes(manualSearch.toLowerCase()),
          )
          .slice(0, 5)
      : [];

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f0faf8] flex items-center justify-center px-4">
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[6px_6px_0px_#000] text-center max-w-sm w-full">
          <p className="text-5xl mb-4">✅</p>
          <h2 className="text-2xl font-black text-black mb-2">
            Attendance Submitted!
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {scannedList.length} students marked successfully
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setScannedList([]);
              setStudentsLoaded(false);
            }}
            className="w-full bg-[#0d9488] text-white border-2 border-black rounded-xl px-4 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            Scan Another Session
          </button>
          <button
            onClick={() => router.push("/volunteer")}
            className="w-full mt-3 bg-white border-2 border-black rounded-xl px-4 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-black hover:text-[#0d9488] transition-colors"
        >
          ← Back
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-black text-black">Attendance Scanner</h1>
          <p className="text-gray-500 text-sm mt-1">
            Load students once, scan offline
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {!studentsLoaded ? (
          <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] space-y-4">
            <div>
              <label className="text-sm font-bold text-black block mb-1">
                Select Event
              </label>
              <select
                className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488] bg-white"
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setSelectedSessionId("");
                }}
              >
                <option value="">Choose event...</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>

            {sessions.length > 0 && (
              <div>
                <label className="text-sm font-bold text-black block mb-1">
                  Select Session
                </label>
                <select
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488] bg-white"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                >
                  <option value="">Choose session...</option>
                  {sessions.map((s: any) => (
                    <option key={s.id} value={s.id}>
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
              className="w-full bg-[#0d9488] text-white border-2 border-black rounded-xl px-4 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
            >
              {loadingStudents
                ? "Loading students..."
                : `Load Students (1 read)`}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Students loaded
                  </p>
                  <p className="text-2xl font-black text-[#0d9488]">
                    {scannerStudents.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Scanned</p>
                  <p className="text-2xl font-black text-black">
                    {scannedIds.size}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Remaining</p>
                  <p className="text-2xl font-black text-black">
                    {scannerStudents.length - scannedIds.size}
                  </p>
                </div>
              </div>

              {lastScan && (
                <div
                  className={`rounded-xl px-4 py-2 text-sm font-bold text-center border-2 ${lastScan.success ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-400 text-red-600"}`}
                >
                  {lastScan.success ? "✓" : "✗"} {lastScan.name}
                </div>
              )}
            </div>

            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
              <label className="text-sm font-bold text-black block mb-2">
                Barcode Scanner
              </label>
              <input
                ref={inputRef}
                className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                placeholder="Point scanner here..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && barcodeInput.trim()) {
                    handleBarcodeScan(barcodeInput.trim());
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">
                Press Enter or scan barcode to mark attendance
              </p>
            </div>

            <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
              <label className="text-sm font-bold text-black block mb-2">
                Manual Search
              </label>
              <input
                className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                placeholder="Search by name or roll number..."
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
              />
              {filteredStudents.length > 0 && (
                <div className="mt-2 space-y-2">
                  {filteredStudents.map((s) => (
                    <div
                      key={s.studentId}
                      onClick={() => handleManualAdd(s)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${scannedIds.has(s.studentId) ? "border-green-400 bg-green-50" : "border-black hover:border-[#0d9488]"}`}
                    >
                      <div>
                        <p className="text-sm font-bold text-black">
                          {s.studentName}
                        </p>
                        <p className="text-xs text-gray-400">{s.rollNumber}</p>
                      </div>
                      {scannedIds.has(s.studentId) ? (
                        <span className="text-green-600 font-bold text-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#0d9488]">
                          Mark
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {scannedList.length > 0 && (
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000]">
                <h3 className="font-black text-black mb-3">
                  Scanned ({scannedList.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scannedList.map((s) => (
                    <div
                      key={s.studentId}
                      className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-bold text-black">
                          {s.studentName}
                        </p>
                        <p className="text-xs text-gray-400">{s.rollNumber}</p>
                      </div>
                      <span className="text-xs text-gray-400">{s.method}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || scannedList.length === 0}
              className="w-full bg-[#0d9488] text-white border-2 border-black rounded-2xl px-4 py-4 font-black shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
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
