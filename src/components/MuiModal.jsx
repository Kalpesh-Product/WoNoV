// MuiModal.js
import { Modal, Box, IconButton } from "@mui/material";
import { IoMdClose } from "react-icons/io";

const MuiModal = ({ open, onClose, title, children, headerBackground }) => {
  return (
    <Modal open={open} onClose={onClose} className="motion-preset-fade-md">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "40%",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          outline: "none",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          className="flex justify-between items-center px-4 py-2  z-[-1] rounded-t-md border-default border-borderGray"
          style={{
            backgroundColor: headerBackground ? headerBackground : "white",
            color: headerBackground ? "white" : "black",
          }}
        >
          <div className="text-title w-full text-center text-primary">
            {title}
          </div>
          <IconButton sx={{ p: 0 }} onClick={onClose}>
            <IoMdClose
              className="text-white"
              style={{ color: headerBackground ? "white" : "black" }}
            />
          </IconButton>
        </div>
        <div className="p-4 h-full">{children}</div>
      </Box>
    </Modal>
  );
};

export default MuiModal;
