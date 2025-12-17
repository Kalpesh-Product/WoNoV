// MuiModal.js
import React, { useRef } from "react";
import { Modal, Box, IconButton } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { AnimatePresence, motion } from "motion/react";

const MuiModal = ({
  open,
  onClose,
  title,
  children,
  headerBackground,
  hideHeader = false,
}) => {
  const modalRef = useRef(null);
  return (
    <AnimatePresence>
      <Modal open={open} onClose={onClose}>
        <div
          ref={modalRef}
          className="fixed inset-0 flex items-center justify-center"
        >
          <motion.div
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            exit={{ y: -30 }}
            className="w-2/5 bg-white shadow-xl rounded-lg outline-none max-h-[90vh] flex flex-col"
          >
            {/* Sticky Header */}
            {!hideHeader && (
              <div className="flex justify-between items-center px-4 py-2 rounded-t-md border-b border-borderGray sticky top-0 z-10 bg-white">
                <div className="text-subtitle w-full text-center text-primary uppercase">
                  {title}
                </div>
                <IconButton sx={{ p: 0 }} onClick={onClose}>
                  <IoMdClose
                    className="text-black text-subtitle"
                    style={{ color: "black" }}
                  />
                </IconButton>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      </Modal>
    </AnimatePresence>
  );
};

export default MuiModal;
