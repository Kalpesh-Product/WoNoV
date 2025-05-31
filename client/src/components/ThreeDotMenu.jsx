import { Popover, IconButton, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
// import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { MdMoreHoriz } from "react-icons/md";

const ThreeDotMenu = ({ rowId, menuItems, isLoading, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {/* Three-dot menu button */}
      <IconButton onClick={handleOpen} disabled={disabled}>
        <MdMoreHoriz />
      </IconButton>

      {/* Popover Dropdown */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div className="w-full bg-white rounded-xl motion-preset-slide-down-sm">
          {menuItems.map(
            ({ label, onClick, disabled: itemDisabled }, index) => (
              <div
                key={index}
                onClick={() => {
                  if (!itemDisabled) {
                    onClick();
                    handleClose(); // optionally close after click
                  }
                }}
                className={`${
                  label === "Cancel"
                    ? "bg-red-100 text-red-600"
                    : "bg-white text-primary"
                }  
                p-4 py-2 border-b-[1px] border-borderGray cursor-pointer text-content hover:bg-gray-200
                ${itemDisabled ? "text-gray-400 cursor-not-allowed" : ""}`}
              >
                {isLoading ? <CircularProgress size={16} /> : label}
              </div>
            )
          )}
        </div>
      </Popover>
    </div>
  );
};

export default ThreeDotMenu;
