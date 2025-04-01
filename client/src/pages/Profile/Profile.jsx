import React, { useState } from "react";
import { Tabs, Tab } from "@mui/material";
import MyProfile from "./MyProfile";
import ChangePassword from "./ChangePassword";
import AccessGrant from "./AccessGrant";
import MyAssets from "./MyAssets";
import MeetingRoomCredits from "./MeetingRoomCredits";
import TicketsHistory from "./TicketsHistory";

const Profile = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="w-full rounded-md bg-white p-4">
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          border: "1px solid #d1d5db",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "medium",
            padding: "12px 16px",
            borderRight: "0.1px solid #d1d5db",
          },
          "& .Mui-selected": {
            backgroundColor: "#1E3D73", // Highlight background color for the active tab
            color: "white",
          },
        }}
      >
        <Tab label="My Profile" />
        <Tab label="Change Password" />
        <Tab label="Access Grant" />
        <Tab label="My Assets" />
        <Tab label="Meetings" />
        <Tab label="Tickets History" />
      </Tabs>

      <div className="py-4 bg-white">
        {activeTab === 0 && (
          <div className="">
            <MyProfile pageTitle={"Profile settings"}/>
          </div>
        )}
        {activeTab === 1 && (
          <div>
            <ChangePassword pageTitle={"Change password"} />
            </div>
          )}
        {activeTab === 2 && (
          <div>
            <AccessGrant pageTitle={"Access grant"} />
          </div>
          )}
           {activeTab === 3 && (
          <div>
            <MyAssets pageTitle={'My Assets'} />
          </div>
          )}
          {activeTab === 4 && (
          <div>
            <MeetingRoomCredits pageTitle={'Meeting Room Credits'} />
          </div>
          )}
          {activeTab === 5 && (
          <div>
            <TicketsHistory pageTitle={'Tickets History'} />
          </div>
          )}
      </div>
    </div>
  );
};

export default Profile;
