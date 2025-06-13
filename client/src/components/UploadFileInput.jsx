import React, { useRef, useState } from "react";
import { TextField, IconButton, Avatar, Box } from "@mui/material";
import { LuImageUp } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import MuiModal from "./MuiModal";

const UploadFileInput = ({
  value,
  onChange,
  disabled=false,
  label = "Upload File",
  allowedExtensions = ["jpg", "jpeg", "png", "pdf"],
  previewType = "auto", // "image", "pdf", "none", or "auto"
}) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(
    value ? URL.createObjectURL(value) : null
  );
  const [openModal, setOpenModal] = useState(false);

  const getExtension = (fileName) => fileName.split(".").pop().toLowerCase();

  const isImage = (ext) =>
    ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext);

  const isPDF = (ext) => ext === "pdf";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = getExtension(file.name);
      if (!allowedExtensions.includes(ext)) {
        alert(`Only ${allowedExtensions.join(", ")} files are allowed.`);
        return;
      }

      onChange(file);
      setPreviewUrl(URL.createObjectURL(file));
      fileInputRef.current.value = null;
    }
  };

  const handleClear = () => {
    onChange(null);
    setPreviewUrl(null);
  };

  const acceptAttr = allowedExtensions.map((ext) => `.${ext}`).join(",");

  const renderPreview = () => {
    const ext = getExtension(value.name);
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
          src={previewUrl}
          alt="Preview"
          sx={{ width: "100%", height: "auto", borderRadius: 2 }}
          variant="square"
        />
      );
    }

    if (type === "pdf") {
      return (
        <iframe
          src={previewUrl}
          title="PDF Preview"
          style={{ width: "100%", height: "500px", borderRadius: "8px" }}
        />
      );
    }

    return <div className="text-muted text-sm">Preview not available</div>;
  };

  return (
    <Box className="flex flex-col gap-2">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        disabled={disabled}
        hidden
        id="file-upload"
        onChange={handleFileChange}
      />

      {/* Display TextField Trigger */}
      <TextField
        size="small"
        variant="outlined"
        fullWidth
        label={label}
        disabled={disabled}
        value={value?.name || ""}
        placeholder="Choose a file..."
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton component="label" htmlFor="file-upload" color="primary">
              <LuImageUp />
            </IconButton>
          ),
        }}
      />

      {/* Preview and Delete */}
      {value && previewUrl && (
        <>
          <span
            className="underline text-primary text-sm cursor-pointer w-fit"
            onClick={() => setOpenModal(true)}
          >
            Preview
          </span>

          <MuiModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            title="File Preview"
          >
            <div className="flex flex-col gap-2">
              <IconButton color="error" onClick={handleClear}>
                <MdDelete />
              </IconButton>
              <div className="p-2 border border-gray-300 rounded-md">
                {renderPreview()}
              </div>
            </div>
          </MuiModal>
        </>
      )}
    </Box>
  );
};

export default UploadFileInput;
