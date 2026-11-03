import React from "react";
import { useNavigate } from "react-router-dom";

const TicketCard = ({
  title,
  icon,
  data,
  bgcolor,
  fontColor,
  height,
  fontFamily,
  titleColor,
  route,
  loading = false,
}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(route)}
      className={`shadow-md p-4 rounded-md text-center flex flex-col justify-center items-center cursor-pointer`}
      style={{
        backgroundColor: bgcolor || "#ffffff",
        color: fontColor || "black",
        height: height || "",
      }}
    >
      {loading ? (
        <>
          <div className="mb-4 h-10 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-24 max-w-full animate-pulse rounded bg-gray-200" />
        </>
      ) : (
        <>
          <div
            style={{ fontFamily: fontFamily || "" }}
            className="flex items-center justify-center text-4xl mb-4"
          >
            {icon || data}
          </div>
          <span style={{ color: titleColor || "black" }} className="text-center">
            {title}
          </span>
        </>
      )}
    </div>
  );
};

export default TicketCard;
