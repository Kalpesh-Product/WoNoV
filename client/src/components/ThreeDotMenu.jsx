import { Popover, IconButton, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
// import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { MdMoreHoriz } from 'react-icons/md'; 

const ThreeDotMenu = ({ rowId, menuItems, isLoading }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {/* Three-dot menu button */}
      <IconButton onClick={handleOpen}>
        <MdMoreHoriz  />
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
          {menuItems.map(({ label, onClick, disabled }, index) => (
            <div
              key={index}
              onClick={() => {
                if (!disabled) {
                  onClick();
                }
                return;
              }}
              className={`${label === "Cancel" ? "bg-red-100 text-red-600" : "bg-white text-primary"}  p-4 py-2 border-b-[1px] border-borderGray cursor-pointer text-content hover:bg-gray-200 ${
                disabled ? "text-gray-400 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? <CircularProgress color="#1E3D73" /> : label}
            </div>
          ))}
        </div>
      </Popover>
    </div>
  );
};

export default ThreeDotMenu;
