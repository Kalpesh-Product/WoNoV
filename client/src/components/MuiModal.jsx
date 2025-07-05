import React, { useRef } from "react";
import { Modal, IconButton } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { AnimatePresence, motion } from "motion/react";

const MuiModal = ({ open, onClose, title, children, headerBackground }) => {
  const modalRef = useRef(null);

  return (
    <AnimatePresence>
      {open && (
        <Modal open={open} onClose={onClose}>
          <div
            ref={modalRef}
            className="fixed inset-0 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-2/5 bg-white shadow-xl rounded-lg outline-none max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Scrollable container with sticky header */}
              <div className="overflow-y-auto h-full">
                {/* Sticky Header */}
                <div
                  className="sticky top-0 z-10 flex justify-between items-center px-4 py-2 rounded-t-md border-b border-borderGray bg-white"
                  style={{
                    // backgroundColor: headerBackground || "white",
                    // color: headerBackground ? "white" : "black",
                  }}
                >
                  <div className="text-subtitle w-full text-center text-primary uppercase">
                    {title}
                  </div>
                  <IconButton sx={{ p: 0 }} onClick={onClose}>
                    <IoMdClose className="text-black text-subtitle" />
                  </IconButton>
                </div>

                {/* Content */}
                <div className="p-4">{children}</div>
              </div>
            </motion.div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default MuiModal;
