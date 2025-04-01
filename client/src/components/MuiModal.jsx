// MuiModal.js
import React, { useRef } from "react";
import { Modal, Box, IconButton } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { AnimatePresence, motion } from "motion/react";

const MuiModal = ({ open, onClose, title, children, headerBackground }) => {
  const modalRef = useRef(null);
  return (
    <AnimatePresence>
      <Modal open={open} onClose={onClose}>
        <div
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center"
        >
          <motion.div
            drag
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileDrag={{ scale: 0.9 }}
            exit={{ scale: 0 }}
            dragConstraints={modalRef} // Constrain dragging within the modal container
            dragElastic={0.2} // Adjust elasticity for smoother movement
            className="w-2/5 bg-white shadow-xl rounded-lg outline-none max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div
              className="flex justify-between items-center px-4 py-2 rounded-t-md border-b border-borderGray"
              style={{
                backgroundColor: headerBackground || "white",
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

            {/* Content */}
            <div className="p-4 h-full">{children}</div>
          </motion.div>
        </div>
      </Modal>
    </AnimatePresence>
  );
};

export default MuiModal;
