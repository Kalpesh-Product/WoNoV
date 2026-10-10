import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MdAccessTime,
  MdArrowForward,
  MdCalendarToday,
  MdCameraAlt,
  MdClose,
  MdRefresh,
} from "react-icons/md";

const AttendanceCameraModal = ({
  open,
  title,
  isLoading,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [cameraRetryKey, setCameraRetryKey] = useState(0);
  useEffect(() => {
    if (!open) return undefined;

    setCapturedPhoto(null);
    setCameraError("");
    setIsReady(false);
    let cancelled = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Camera is unavailable here. Open the app on HTTPS or localhost and try again.",
      );
      return undefined;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "user" } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((error) => {
        if (cancelled) return;

        if (error?.name === "NotAllowedError") {
          setCameraError(
            "Camera permission is blocked. Allow camera access in the browser, then click Retry Camera.",
          );
        } else if (error?.name === "NotFoundError") {
          setCameraError("No camera was found on this device.");
        } else if (error?.name === "NotReadableError") {
          setCameraError(
            "The camera is being used by another app. Close it there, then click Retry Camera.",
          );
        } else {
          setCameraError(
            "Camera could not be started. Check browser permission and try again.",
          );
        }
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsReady(false);
    };
  }, [cameraRetryKey, open]);

  useEffect(() => {
    if (!open) return undefined;

    setCurrentTime(new Date());
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [open]);

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;

    const capturedAt = new Date();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedPhoto({
          blob,
          capturedAt: capturedAt.toISOString(),
          previewUrl: canvas.toDataURL("image/jpeg", 0.9),
        });
      },
      "image/jpeg",
      0.9,
    );
  };

  const retake = () => {
    setCapturedPhoto(null);
    setCurrentTime(new Date());
  };

  const proceed = () => {
    if (!capturedPhoto) return;
    onCapture(capturedPhoto.blob, capturedPhoto.capturedAt);
  };

  if (!open) return null;

  const displayedTime = capturedPhoto
    ? new Date(capturedPhoto.capturedAt)
    : currentTime;

  return createPortal(
    <div className="fixed inset-0 z-[1400] flex items-start justify-center overflow-y-auto bg-[#172033]/80 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-camera-title"
        className="w-full max-w-[400px] shrink-0 overflow-hidden rounded-[26px] border border-white/70 bg-[#f8fafc] shadow-[0_28px_80px_rgba(2,6,23,0.38)]"
      >
        <div className="flex items-start justify-between border-b border-[#e5e9f1] bg-white px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-[#1E3D73]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dbe8fb] bg-[#eaf2ff]">
                <MdCameraAlt
                  size={21}
                  className="text-[#1E3D73]"
                  aria-hidden="true"
                />
              </span>
              <h2
                id="attendance-camera-title"
                className="text-xl font-pbold leading-none"
              >
                CAPTURE SELFIE
              </h2>
            </div>
            <p className="mt-2 text-[10px] font-pbold uppercase tracking-[0.28em] text-[#9aa6bb]">
              {title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close camera"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7ebf1] bg-[#f8fafc] text-[#ff000080] transition-colors hover:bg-[#edf1f7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdClose size={21} />
          </button>
        </div>

        <div className="p-5">
          <div className="overflow-hidden rounded-[24px] bg-[#020617] p-2.5 shadow-inner">
            <div className="flex items-center justify-between px-1 pb-2.5 pt-0.5 text-[10px] font-pbold text-white/70">
              <span className="uppercase tracking-[0.26em]">Selfie Preview</span>
              <span>
                {capturedPhoto
                  ? "Photo captured"
                  : isReady
                    ? "Ready to capture"
                    : "Preparing camera"}
              </span>
            </div>
            <div
              className="relative overflow-hidden rounded-[19px] bg-[#111827]"
              style={{ aspectRatio: "4 / 4.2" }}
            >
              <video
                ref={videoRef}
                className={`h-full w-full scale-x-[-1] object-cover ${capturedPhoto ? "invisible" : ""}`}
                playsInline
                muted
                onCanPlay={() => setIsReady(true)}
              />
              {cameraError && !capturedPhoto && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#111827] px-6 text-center text-white">
                  <MdCameraAlt
                    size={34}
                    className="text-white/70"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-pmedium leading-6">
                    {cameraError}
                  </p>
                </div>
              )}
              {capturedPhoto && (
                <img
                  src={capturedPhoto.previewUrl}
                  alt="Captured attendance selfie"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-[#e2e7ef] bg-[#f1f3f6] px-3 py-3 shadow-[0_2px_8px_rgba(30,61,115,0.05)]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dbe8fb] bg-[#eaf2ff] text-[#1E3D73]">
                <MdCalendarToday
                  size={17}
                  className="text-[#1E3D73]"
                  aria-hidden="true"
                />
              </span>
              <div>
                <div className="text-[10px] font-pbold uppercase tracking-wide text-[#7b879b]">
                  Date
                </div>
                <div className="mt-1 text-sm font-pbold text-[#263750]">
                  {displayedTime.toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[#e2e7ef] bg-[#f1f3f6] px-3 py-3 shadow-[0_2px_8px_rgba(30,61,115,0.05)]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dbe8fb] bg-[#eaf2ff] text-[#1E3D73]">
                <MdAccessTime
                  size={18}
                  className="text-[#1E3D73]"
                  aria-hidden="true"
                />
              </span>
              <div>
                <div className="text-[10px] font-pbold uppercase tracking-wide text-[#7b879b]">
                  Time
                </div>
                <div className="mt-1 text-sm font-pbold text-[#263750]">
                  {displayedTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[#e5e9f1] bg-white px-5 py-4">
          <button
            type="button"
            onClick={capturedPhoto ? retake : onClose}
            disabled={isLoading}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-pbold uppercase shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              capturedPhoto
                ? "border-[#3cb37180] bg-[#3cb37180] text-white hover:bg-[#3cb37199]"
                : "border-[#ff000080] bg-[#ff000080] text-white hover:bg-[#ff000099]"
            }`}
          >
            {capturedPhoto ? (
              <MdRefresh size={17} aria-hidden="true" />
            ) : (
              <MdClose size={16} aria-hidden="true" />
            )}
            {capturedPhoto ? "Retake" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={
              cameraError
                ? () => setCameraRetryKey((current) => current + 1)
                : capturedPhoto
                  ? proceed
                  : capture
            }
            disabled={(!cameraError && !capturedPhoto && !isReady) || isLoading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1E3D73] text-xs font-pbold uppercase text-white shadow-[0_8px_20px_rgba(30,61,115,0.28)] transition-colors hover:bg-[#162f5b] disabled:cursor-not-allowed disabled:bg-[#9aa8bd] disabled:shadow-none"
          >
            {cameraError ? (
              <MdRefresh size={17} aria-hidden="true" />
            ) : capturedPhoto ? (
              <MdArrowForward size={17} aria-hidden="true" />
            ) : (
              <MdCameraAlt size={17} aria-hidden="true" />
            )}
            {isLoading
              ? "Saving..."
              : cameraError
                ? "Retry Camera"
                : capturedPhoto
                  ? "Proceed"
                  : "Capture"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AttendanceCameraModal;
