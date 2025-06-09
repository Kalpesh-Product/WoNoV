import React, { useRef, useState } from "react";
import { TextField, IconButton, Avatar, Box } from "@mui/material";
import { LuImageUp } from "react-icons/lu";
import { MdDelete } from "react-icons/md";
import MuiModal from "./MuiModal"; // Adjust path as needed

const UploadImageInput = ({ value, onChange, label = "Upload Image" }) => {
  const imageRef = useRef(null);
  const [preview, setPreview] = useState(
    value ? URL.createObjectURL(value) : null
  );
  const [openModal, setOpenModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
      setPreview(URL.createObjectURL(file));
      imageRef.current.value = null;
    }
  };

  const handleClear = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <Box className="flex flex-col gap-2">
      {/* Hidden File Input */}
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        hidden
        id="image-upload"
        onChange={handleFileChange}
      />

      {/* Display TextField Trigger */}
      <TextField
        size="small"
        variant="outlined"
        fullWidth
        label={label}
        value={value?.name || ""}
        placeholder="Choose a file..."
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton
              component="label"
              htmlFor="image-upload"
              color="primary"
            >
              <LuImageUp />
            </IconButton>
          ),
        }}
      />

      {/* Preview and Delete */}
      {preview && (
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
            title="Preview File"
          >
            <div className="flex flex-col gap-2">
              <IconButton color="error" onClick={handleClear}>
                <MdDelete />
              </IconButton>
              <div className="p-2 border border-gray-300 rounded-md">
                <Avatar
                  src={preview}
                  alt="Preview"
                  sx={{ width: "100%", height: "auto", borderRadius: 2 }}
                  variant="square"
                />
              </div>
            </div>
          </MuiModal>
        </>
      )}
    </Box>
  );
};

export default UploadImageInput;
