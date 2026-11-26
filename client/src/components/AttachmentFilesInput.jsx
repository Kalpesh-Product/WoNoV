import { useEffect, useMemo } from "react";
import { Chip, FormHelperText, IconButton, TextField } from "@mui/material";
import { LuImageUp } from "react-icons/lu";
import { toast } from "sonner";

const invoiceExtensions = ".jpg,.jpeg,.png,.webp,.gif,.bmp,.pdf,.doc,.docx,.xls,.xlsx,.csv";

export default function AttachmentFilesInput({
  value, onChange, id, label = "Upload Files", maxFiles = 15, maxSizeMb = 5, extensions,
  placeholder = "Choose up to 15 files", fallbackName = "Invoice", error = false,
  helperText = "Maximum 15 files, 5 MB each. Images, PDF, Word, Excel, and CSV.",
}) {
  const files = useMemo(() => (Array.isArray(value) ? value : []), [value]);
  const fileUrls = useMemo(
    () =>
      files.map((file) =>
        file instanceof File
          ? { url: URL.createObjectURL(file), shouldRevoke: true }
          : { url: file.link || file.url || "", shouldRevoke: false },
      ),
    [files],
  );

  useEffect(
    () => () => {
      fileUrls.forEach(({ url, shouldRevoke }) => {
        if (shouldRevoke) URL.revokeObjectURL(url);
      });
    },
    [fileUrls],
  );

  const selectFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const availableSlots = maxFiles - files.length;
    const withinLimit = selected.slice(0, Math.max(availableSlots, 0));
    const validFiles = withinLimit.filter((file) => {
      if (extensions && !extensions.includes(file.name.split(".").pop()?.toLowerCase())) {
        toast.error(`Choose a ${extensions.join(", ")} file.`);
        return false;
      }
      if (maxSizeMb != null && file.size > maxSizeMb * 1024 * 1024) {
        toast.error(`${file.name} exceeds the ${maxSizeMb} MB limit`);
        return false;
      }
      return true;
    });

    if (selected.length > availableSlots) {
      toast.error(`You can attach a maximum of ${maxFiles} file${maxFiles === 1 ? "" : "s"}`);
    }
    onChange([...files, ...validFiles]);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        id={id}
        accept={extensions ? extensions.map((extension) => `.${extension}`).join(",") : invoiceExtensions}
        multiple={maxFiles > 1}
        hidden
        onChange={selectFiles}
      />
      <TextField
        size="small"
        fullWidth
        label={label}
        error={error}
        value={files.length ? (maxFiles === 1 ? files[0].name : `${files.length} file(s) selected`) : ""}
        placeholder={placeholder}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton
              component="label"
              htmlFor={id}
              color="primary"
              aria-label={label}
              disabled={files.length >= maxFiles}
            >
              <LuImageUp />
            </IconButton>
          ),
        }}
      />
      <FormHelperText error={error}>{helperText}</FormHelperText>
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => {
          const fileName = file.name || `${fallbackName} ${index + 1}`;
          return (
            <Chip
              key={file.id || `${fileName}-${file.lastModified || index}`}
              label={
                fileName.length > 28
                  ? `${fileName.slice(0, 20)}...${fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : ""}`
                  : fileName
              }
              title={fileName}
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => {
                if (fileUrls[index]?.url) {
                  window.open(
                    fileUrls[index].url,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }
              }}
              onDelete={() => onChange(files.filter((_, i) => i !== index))}
              sx={{ maxWidth: "100%" }}
            />
          );
        })}
      </div>
    </div>
  );
}
