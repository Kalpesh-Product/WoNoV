import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

const AttendanceCameraModal = ({
  open,
  title,
  isLoading,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [isReady, setIsReady] = useState(false);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
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
      .catch(() => {
        toast.error("Camera access is required to record attendance");
        onCloseRef.current();
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsReady(false);
    };
  }, [open]);

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;

    const capturedAt = new Date();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const label = capturedAt.toLocaleString();
    const fontSize = Math.max(18, Math.round(canvas.width / 32));
    context.font = `${fontSize}px sans-serif`;
    const padding = Math.round(fontSize * 0.6);
    const labelWidth = context.measureText(label).width;
    context.fillStyle = "rgba(0, 0, 0, 0.65)";
    context.fillRect(
      canvas.width - labelWidth - padding * 2,
      canvas.height - fontSize - padding * 2,
      labelWidth + padding * 2,
      fontSize + padding * 2,
    );
    context.fillStyle = "#fff";
    context.fillText(
      label,
      canvas.width - labelWidth - padding,
      canvas.height - padding,
    );

    canvas.toBlob(
      (blob) => blob && onCapture(blob, capturedAt.toISOString()),
      "image/jpeg",
      0.9,
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-primary">{title}</h2>
        <div className="relative overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            className="max-h-[60vh] w-full scale-x-[-1] object-cover"
            playsInline
            muted
            onCanPlay={() => setIsReady(true)}
          />
          <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
            {new Date().toLocaleString()}
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          Keep your face visible. The attendance time will be added to the
          captured photo.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <SecondaryButton title="Cancel" handleSubmit={onClose} />
          <PrimaryButton
            title={isLoading ? "Saving..." : "Capture & Save"}
            handleSubmit={capture}
            disabled={!isReady || isLoading}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceCameraModal;