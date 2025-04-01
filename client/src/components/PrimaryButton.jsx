import React from "react";
import { CircularProgress } from "@mui/material"; // Import MUI Spinner
import { motion } from "motion/react";

const PrimaryButton = ({
  title,
  handleSubmit,
  type,
  fontSize,
  externalStyles,
  disabled,
  isLoading, // New prop for showing the spinner
}) => {
  return (
    <motion.button
      whileHover={{scale:1.050}}
      whileTap={{scale:0.9}}
      disabled={disabled || isLoading} // Disable if loading
      type={type}
      className={`px-8 py-2 flex items-center justify-center gap-2 ${
        disabled || isLoading ? "bg-gray-400" : "bg-primary"
      } motion-preset-slide-up-sm text-white rounded-md ${
        fontSize ? fontSize : "text-content leading-5"
      } ${externalStyles}`}
      onClick={handleSubmit}
    >
      {isLoading && <CircularProgress size={16} color="#1E3D73" />}{" "}
      {/* Spinner */}
      <span>{isLoading ? `${title}ing` : title}</span>
    </motion.button>
  );
};

export default PrimaryButton;
