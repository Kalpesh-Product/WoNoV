import React from "react";

const PageFrame = ({ children, className = "" }) => {
  return (
    <div className={`p-4 border-default border-borderGray rounded-xl ${className}`}>
      {children}
    </div>
  );
};

export default PageFrame;
