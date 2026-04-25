// import React, { useEffect, useId, useRef, useState } from "react";
// import { TextField, IconButton, Avatar, Box } from "@mui/material";
// import { LuImageUp } from "react-icons/lu";
// import { MdDelete } from "react-icons/md";
// import MuiModal from "./MuiModal";

// const UploadFileInput = ({
//   value,
//   onChange,
//   disabled = false,
//   label = "Upload File",
//   allowedExtensions = ["jpg", "jpeg", "png", "pdf", "webp"],
//   previewType = "auto", // "image", "pdf", "none", or "auto"
//   error = false,
//   helperText = "",
//   onInvalidFile,
//   id,
// }) => {
//   const fileInputRef = useRef(null);
//   const generatedId = useId();
//   const inputId = id ?? `file-upload-${generatedId}`;
//   const fileUrl =
//     typeof value === "string"
//       ? value
//       : value?.url && typeof value?.url === "string"
//       ? value.url
//       : null;
//   const fileName =
//     value instanceof File
//       ? value.name
//       : fileUrl
//       ? fileUrl.split("/").pop()?.split("?")[0] || "selected-file"
//       : "";
//   const [previewUrl, setPreviewUrl] = useState(
//     value instanceof File
//       ? URL.createObjectURL(value)
//       : fileUrl || null
//   );
//   const [openModal, setOpenModal] = useState(false);

//   useEffect(() => {
//     if (value instanceof File) {
//       setPreviewUrl(URL.createObjectURL(value));
//       return;
//     }
//     setPreviewUrl(fileUrl || null);
//   }, [value, fileUrl]);

//   const getExtension = (fileName) => fileName.split(".").pop().toLowerCase();

//   const isImage = (ext) =>
//     ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext);

//   const isPDF = (ext) => ext === "pdf";

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const ext = getExtension(file.name);
//       if (!allowedExtensions.includes(ext)) {
//         onInvalidFile?.(
//           `Invalid file format. Allowed formats: ${allowedExtensions
//             .map((allowedExt) => `image/${allowedExt}`)
//             .join(", ")}`,
//           file,
//         );
//         return;
//       }

//       onChange(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       fileInputRef.current.value = null;
//     }
//   };

//   const handleClear = () => {
//     onChange(null);
//     setPreviewUrl(null);
//   };

//   const acceptAttr = allowedExtensions.map((ext) => `.${ext}`).join(",");

//   const renderPreview = () => {
//     const ext = getExtension(fileName);
//     const type =
//       previewType === "auto"
//         ? isImage(ext)
//           ? "image"
//           : isPDF(ext)
//           ? "pdf"
//           : "none"
//         : previewType;


//     if (type === "image") {
//       return (
//         <Avatar
//           src={previewUrl}
//           alt="Preview"
//           sx={{ width: "100%", height: "auto", borderRadius: 2 }}
//           variant="square"
//         />
//       );
//     }
import React, { useEffect, useId, useRef, useState } from "react";
import { TextField, IconButton, Box } from "@mui/material";
import { LuImageUp } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import MuiModal from "./MuiModal";

const UploadFileInput = ({
  value,
  onChange,
  disabled = false,
  label = "Upload File",
  allowedExtensions = ["jpg", "jpeg", "png", "pdf", "webp"],
  previewType = "auto", // "image", "pdf", "none", or "auto"
  error = false,
  helperText = "",
  onInvalidFile,
  id,
}) => {
  const fileInputRef = useRef(null);
  const generatedId = useId();
  const inputId = id ?? `file-upload-${generatedId}`;
  const fileUrl =
    typeof value === "string"
      ? value
      : value?.url && typeof value?.url === "string"
      ? value.url
      : null;
  const fileName =
    value instanceof File
      ? value.name
      : fileUrl
      ? fileUrl.split("/").pop()?.split("?")[0] || "selected-file"
      : "";
  const [previewUrl, setPreviewUrl] = useState(
    value instanceof File
      ? URL.createObjectURL(value)
      : fileUrl || null
  );
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (value instanceof File) {
      setPreviewUrl(URL.createObjectURL(value));
      return;
    }
    setPreviewUrl(fileUrl || null);
  }, [value, fileUrl]);

  const getExtension = (fileName) => fileName.split(".").pop().toLowerCase();

  const isImage = (ext) =>
    ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(ext);

  const isPDF = (ext) => ext === "pdf";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = getExtension(file.name);
      if (!allowedExtensions.includes(ext)) {
        onInvalidFile?.(
          `Invalid file format. Allowed formats: ${allowedExtensions
            .map((allowedExt) => `image/${allowedExt}`)
            .join(", ")}`,
          file,
        );
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
    const ext = getExtension(fileName);
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
        <Box
          component="img"
          src={previewUrl}
          alt="Preview"
          sx={{
            maxWidth: "100%",
            maxHeight: "500px",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            borderRadius: 2,
            mx: "auto",
            display: "block",
          }}
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
        id={inputId}
        onChange={handleFileChange}
      />

      {/* Display TextField Trigger */}
      <TextField
        size="small"
        variant="outlined"
        fullWidth
        label={label}
        disabled={disabled}
        error={error}
        helperText={helperText}
        value={fileName}
        placeholder="Choose a file..."
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton component="label" htmlFor={inputId} color="primary">
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
              <div className="flex justify-center">
                <IconButton color="error" onClick={handleClear}>
                  <MdDelete />
                </IconButton>
              </div>
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
