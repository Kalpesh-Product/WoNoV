import React from "react";
import ThreeDotMenu from "./ThreeDotMenu";
import { MdFolderShared } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const GoogleFolderCard = ({ title, routeId, files }) => {
  const navigate = useNavigate();
  return (
    <div
      className="rounded-xl p-2 px-4 flex items-center justify-between bg-borderGray text-black hover:bg-gray-200 cursor-pointer transition-all"
      onClick={() =>
        navigate(
          `${routeId}`,
          { state: {title : title, files:files}, replace:true }
        )
      }
    >
      <div className="flex items-end gap-2">
        <span className="text-title">
          <MdFolderShared />
        </span>
        <span className="font-pmedium text-content">{title}</span>
      </div>
      <ThreeDotMenu
        menuItems={[
          { label: "Rename" },
        ]}
      />
    </div>
  );
};

export default GoogleFolderCard;
