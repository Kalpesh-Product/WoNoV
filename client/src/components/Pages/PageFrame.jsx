import React from "react";

const PageFrame = ({ children }) => {
  return (
    <div className="p-4 border-default border-borderGray rounded-xl">
      {children}
    </div>
  );
};

export default PageFrame;
