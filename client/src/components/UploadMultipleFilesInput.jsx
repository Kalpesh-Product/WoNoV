import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  TextField,
  IconButton,
  Avatar,
  Box,
  Chip,
  FormHelperText,
} from "@mui/material";
import { LuImageUp } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import { toast } from "sonner";
import MuiModal from "./MuiModal";

const UploadMultipleFilesInput = ({
  value = [],                // Array<File>
  onChange,                  // (files: File[]) => void
  disabled = false,
  label = "Upload Files",
  allowedExtensions = ["jpg", "jpeg", "png", "pdf","webp"],
  previewType = "auto",      // "image", "pdf", "none", or "auto"
  name,                      // optional: set to include in FormData (e.g., "heroImages")
  id,                        // input id for htmlFor
  maxFiles = 5,
  maxSizeMb = 5,
  helperText = "",
  showPreviews = true,
  showClearAll = true,
  showMaxInLabel = true,
}) => {
  const fileInputRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const getExtension = (fileName = "") =>
    fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";

  const isImage = (ext) =>
    ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext);

  const isPDF = (ext) => ext === "pdf";

  const getFileName = (file) =>
    file?.name ||
    file?.url?.split("/").pop()?.split("?")[0] ||
    "saved-file";

  const getChipLabel = (file) => {
    const fileName = getFileName(file);
    if (fileName.length <= 28) return fileName;

    const extensionIndex = fileName.lastIndexOf(".");
    const extension = extensionIndex > 0 ? fileName.slice(extensionIndex) : "";
    return `${fileName.slice(0, 20)}...${extension}`;
  };

  // Create/revoke object URLs for previews
  const previews = useMemo(
    () =>
      (value || []).map((f) => {
        const isLocalFile = f instanceof File;
        return {
          file: f,
          url: isLocalFile ? URL.createObjectURL(f) : f?.url,
          ext: getExtension(getFileName(f)),
          isLocalFile,
        };
      }),
    [value]
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.isLocalFile && p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [previews]);

  const acceptAttr = allowedExtensions.map((ext) => `.${ext}`).join(",");

  const dedupe = (filesArr) => {
    const seen = new Set();
    const out = [];
    for (const f of filesArr) {
      const key =
        f instanceof File
          ? `${f.name}-${f.size}-${f.lastModified}`
          : `${f?.id || ""}-${f?.url || getFileName(f)}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(f);
      }
    }
    return out;
  };

  const handleFileChange = (e) => {
    const chosen = Array.from(e.target.files || []);
    if (!chosen.length) return;

    const existingFiles = value || [];
    const availableSlots = Math.max(maxFiles - existingFiles.length, 0);
    const filesWithinLimit = chosen.slice(0, availableSlots);

    if (chosen.length > availableSlots) {
      toast.error("You can attach a maximum of 5 files");
    }

    // filter by allowed extensions
    const extensionFiltered = filesWithinLimit.filter((f) =>
      allowedExtensions.includes(getExtension(f.name)),
    );
    const filtered = extensionFiltered.filter((file) => {
      if (file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`${file.name} exceeds the ${maxSizeMb} MB limit`);
        return false;
      }
      return true;
    });
    const rejected = filesWithinLimit.length - extensionFiltered.length;
    if (rejected > 0) {
      toast.error(`Only ${allowedExtensions.join(", ")} files are allowed.`);
    }

    // merge with existing, dedupe, then enforce max
    const merged = dedupe([...(value || []), ...filtered]);
    const limited = merged.slice(0, maxFiles);

    onChange?.(limited);

    // reset input so same file can be picked again later
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleRemoveAt = (index) => {
    const copy = [...(value || [])];
    copy.splice(index, 1);
    onChange?.(copy);
  };

  const handleClear = () => {
    onChange?.([]);
  };

  const renderPreviewContent = (p) => {
    const ext = p.ext;
    const type =
      previewType === "auto"
        ? isImage(ext)
          ? "image"
          : isPDF(ext)
          ? "pdf"
          : "none"
        : previewType;

    if (type === "image") {
      return (
        <Avatar
          src={p.url}
          alt={getFileName(p.file)}
          sx={{ width: "100%", height: "auto", borderRadius: 2 }}
          variant="square"
        />
      );
    }

    if (type === "pdf") {
      return (
        <iframe
          src={p.url}
          title={getFileName(p.file)}
          style={{ width: "100%", height: "65vh", borderRadius: "8px" }}
        />
      );
    }

    return (
      <div className="text-sm text-gray-500">
        Preview not available for “{getFileName(p.file)}”
      </div>
    );
  };

  // Friendly label value (TextField needs a string)
  const displayValue =
    (value?.length || 0) === 0
      ? ""
      : value.length === 1
        ? getFileName(value[0])
      : `${value.length} files selected`;

  const reachedLimit = (value?.length || 0) >= maxFiles;

  return (
    <Box className="flex flex-col gap-2">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        id={id ?? "multiple-file-upload"}
        accept={acceptAttr}
        disabled={disabled}
        hidden
        multiple
        onChange={handleFileChange}
      />

      {/* Trigger / Display */}
      <TextField
        size="small"
        variant="outlined"
        fullWidth
        label={showMaxInLabel ? `${label} (max ${maxFiles})` : label}
        disabled={disabled}
        value={displayValue}
        placeholder={`Choose up to ${maxFiles} files...`}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton
              component="label"
              htmlFor={id ?? "multiple-file-upload"}
              color="primary"
              disabled={disabled}
              title="Select files"
              onClick={(event) => {
                if (reachedLimit) {
                  event.preventDefault();
                  toast.error("You can attach a maximum of 5 files");
                }
              }}
            >
              <LuImageUp />
            </IconButton>
          ),
        }}
      />

      {helperText && (
        <FormHelperText sx={{ marginLeft: 0 }}>{helperText}</FormHelperText>
      )}

      {/* Chips list */}
      {value?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((f, i) => (
            <Chip
              key={`${getFileName(f)}-${f?.size || f?.id || f?.url}-${i}`}
              label={getChipLabel(f)}
              title={getFileName(f)}
              clickable
              onClick={() => {
                setModalIndex(i);
                setOpenModal(true);
              }}
              onDelete={(event) => {
                event.stopPropagation();
                handleRemoveAt(i);
              }}
              variant="outlined"
              size="small"
              color="primary"
              sx={{ maxWidth: 230 }}
            />
          ))}
        </div>
      )}

      {/* Preview thumbnails grid */}
      {showPreviews && previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div
              key={`${getFileName(p.file)}-${i}`}
              className="border rounded-md p-2 flex flex-col gap-2"
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  setModalIndex(i);
                  setOpenModal(true);
                }}
                title="Open preview"
              >
                {isImage(p.ext) ? (
                  <img
                    src={p.url}
                    alt={getFileName(p.file)}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : isPDF(p.ext) ? (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded text-xs">
                    PDF Preview
                  </div>
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded text-xs">
                    No Preview
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs truncate" title={getFileName(p.file)}>
                  {getFileName(p.file)}
                </span>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleRemoveAt(i)}
                  title="Remove"
                >
                  <MdDelete />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear all */}
      {showClearAll && value?.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-red-600"
          >
            Remove all
          </button>
        </div>
      )}

      {/* Modal for larger preview */}
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={
          previews[modalIndex]
            ? getFileName(previews[modalIndex].file)
            : "File Preview"
        }
      >
        <div className="flex flex-col gap-2">
          <div className="p-2 border border-gray-300 rounded-md">
            {previews[modalIndex] && renderPreviewContent(previews[modalIndex])}
          </div>
          <div className="flex justify-end">
            <IconButton
              color="error"
              onClick={() => {
                handleRemoveAt(modalIndex);
                setOpenModal(false);
              }}
              title="Delete this file"
            >
              <MdDelete />
            </IconButton>
          </div>
        </div>
      </MuiModal>
    </Box>
  );
};

export default UploadMultipleFilesInput;
