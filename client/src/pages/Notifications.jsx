import React from "react";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import useAuth from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Notifications = () => {

  // Helper function to determine the section (Today, Yesterday, Older)
  const { auth } = useAuth();
  const axios = useAxiosPrivate();

  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axios.get("/api/notifications/get-my-notifications");

      const filtered = res.data.filter(
        (n) => n.initiatorData?._id !== auth?.user?._id
      );

      return filtered;
    },
    refetchInterval: 15000,
  });

  const unreadCount = notifications.reduce((total, notification) => {
    const count = notification.users.filter(
      (user) =>
        user.userActions?.hasRead === false &&
        user.userActions?.whichUser?._id === auth.user._id
    ).length;
    return total + count;
  }, 0);

  const getSection = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date >= today) return "Today";
    if (date >= yesterday) return "Yesterday";
    return "Older";
  };

  // Categorize notifications into sections
  const todayNotifications = notifications.filter(
    (notification) => getSection(new Date(notification.createdAt)) === "Today"
  );
  const yesterdayNotifications = notifications.filter(
    (notification) =>
      getSection(new Date(notification.createdAt)) === "Yesterday"
  );
  const olderNotifications = notifications.filter(
    (notification) => getSection(new Date(notification.createdAt)) === "Older"
  );

  const calculateTimeDue = (date) => {
    const now = new Date();
    const diffInMilliseconds = now - new Date(date);
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  };

  // Render notifications by section
  const renderNotifications = (sectionName, sectionNotifications) => (
    <>
      {sectionNotifications.length > 0 && (
        <>
          <div className="text-xl font-semibold pb-4">{sectionName}</div>
          {sectionNotifications.map((notification) => (
            <div key={notification._id} className="mb-4">
              {/* Main Section */}
              <div className="border-2 border-gray-300 p-4 rounded-md flex w-full justify-between items-center">
                {/* Message Section */}
                <div className="flex flex-col w-full gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-subtitle">{notification.module}</span>
                    <span className="text-content">
                      {notification.message}
                    </span>
                  </div>
                  {/* <div className="flex gap-4">
                    <PrimaryButton title={"Accept"} />
                    {notification.type !== "ticket" && (
                      <SecondaryButton title={"Decline"} />
                    )}
                  </div> */}
                </div>
                {/* Timing and type */}
                <div className="flex flex-col gap-2 justify-end items-end w-full">
                  {/* Timing Section */}
                  <div>
                    <span className="text-content text-gray-500">
                      {getSection(new Date(notification.createdAt)) === "Today"
                        ? calculateTimeDue(notification.createdAt)
                        : getSection(new Date(notification.createdAt))}
                    </span>
                  </div>

                  {/* Type Section */}
                  <div>
                    <span
                      className={`text-content py-2 px-4 rounded-md ${
                        notification.module === "Meeting"
                          ? "bg-red-200 text-red-600"
                          : "bg-blue-200 text-blue-600"
                      }`}
                    >
                      {notification.type.charAt(0).toUpperCase() +
                        notification.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );

  return (
    <div className="p-4">
      {renderNotifications("Today", todayNotifications)}
      {renderNotifications("Yesterday", yesterdayNotifications)}
      {renderNotifications("Older", olderNotifications)}
    </div>
  );
};

export default Notifications;
