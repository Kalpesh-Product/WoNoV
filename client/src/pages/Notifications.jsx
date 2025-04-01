import React from "react";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      title: "Meeting on frontend development",
      description: "UI / UX mockup reference",
      date: "2025-01-10T09:00:00", // ISO string format from the backend
      type: "meeting",
      actionTaken: false,
    },
    {
      id: 2,
      title: "New Ticket Created",
      description: "You have a new ticket assigned to you",
      date: "2025-01-09T15:00:00", // Yesterday
      type: "ticket",
      actionTaken: false,
    },
    {
      id: 3,
      title: "Project Review Meeting Scheduled",
      description:
        "A meeting has been scheduled to review the project progress",
      date: "2025-01-08T10:30:00", // Older
      type: "meeting",
      actionTaken: false,
    },
    {
      id: 4,
      title: "Project Review Meeting Scheduled",
      description:
        "A meeting has been scheduled to review the project progress",
      date: "2025-01-09T15:30:00", 
      type: "meeting",
      actionTaken: false,
    },
  ];

  // Helper function to determine the section (Today, Yesterday, Older)
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
    (notification) => getSection(new Date(notification.date)) === "Today"
  );
  const yesterdayNotifications = notifications.filter(
    (notification) => getSection(new Date(notification.date)) === "Yesterday"
  );
  const olderNotifications = notifications.filter(
    (notification) => getSection(new Date(notification.date)) === "Older"
  );

  const calculateTimeDue = (date) => {
    const now = new Date();
    const diffInMilliseconds = now - new Date(date);
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
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
            <div key={notification.id} className="mb-6">
              {/* Main Section */}
              <div className="border-2 border-gray-300 p-4 rounded-md flex items-start gap-4">
                {/* Message Section */}
                <div className="flex flex-col w-full gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-subtitle">
                      {notification.title}
                    </span>
                    <span className="text-content">
                      {notification.description}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <PrimaryButton title={"Accept"} />
                    {notification.type !== "ticket" && (
                      <SecondaryButton title={"Decline"} />
                    )}
                  </div>
                </div>
                {/* Timing and type */}
                <div className="flex flex-col items-end w-[15%] justify-end gap-4">
                  {/* Timing Section */}
                  <div>
                    <span className="text-content text-gray-500">
                      {getSection(new Date(notification.date)) === "Today"
                        ? calculateTimeDue(notification.date)
                        : getSection(new Date(notification.date))}
                    </span>
                  </div>

                  {/* Type Section */}
                  <div>
                    <span
                      className={`text-content p-2 rounded-md ${
                        notification.type === "meeting"
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
