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
  padding,
  className,
  isLoading, // New prop for showing the spinner
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      disabled={disabled || isLoading} // Disable if loading
      type={type}
      className={` flex items-center justify-center gap-2 ${
        disabled || isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary"
      } motion-preset-slide-up-sm text-white rounded-md ${
        fontSize ? fontSize : "text-content leading-5"
      } ${externalStyles} ${padding ? padding : "px-8 py-2"} ${className}`}
      onClick={handleSubmit}>
      {isLoading && <CircularProgress size={16} color="#1E3D73" />}{" "}
      {/* Spinner */}
      <span className="whitespace-nowrap">
        {isLoading ? `${title}` : title}
      </span>
    </motion.button>
  );
};

export default PrimaryButton;
