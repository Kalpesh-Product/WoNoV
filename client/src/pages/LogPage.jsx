import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import YearWiseTable from "../components/Tables/YearWiseTable";
import humanDate from "../utils/humanDateForamt";
import humanTime from "../utils/humanTime";
import DetalisFormatted from "../components/DetalisFormatted";
import MuiModal from "../components/MuiModal";
import PageFrame from "../components/Pages/PageFrame";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import dayjs from "dayjs";

const LogPage = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState(() =>
    dayjs().startOf("day"),
  );

  const selectedLogDateKey = selectedLogDate.format("YYYY-MM-DD");
  const selectedLogDateLabel = selectedLogDate.format("MMM D, YYYY");

  const [selectedLog, setselectedLog] = useState({});
  const { data, isLoading } = useQuery({
    queryKey: ["secret-logs", selectedLogDateKey],
    queryFn: async () => {
      try {
        // const response = await axios.get("/api/logs/get-logs");
        const response = await axios.get("/api/logs/get-logs", {
          params: {
            fromDate: selectedLogDateKey,
            toDate: selectedLogDateKey,
          },
        });
        return response.data || [];
      } catch (error) {
        console.error(error?.response?.data?.message || error.message);
        return [];
        //   return response.data;
        // } catch (error) {
        //   console.error(error.response.data.message);
      }
    },
  });

  const handlePreviousLogDay = useCallback(() => {
    setSelectedLogDate((prevDate) => prevDate.subtract(1, "day"));
  }, []);

  const handleNextLogDay = useCallback(() => {
    setSelectedLogDate((prevDate) => prevDate.add(1, "day"));
  }, []);

  const handleViewlog = (data) => {
    setselectedLog(data);
    setOpenModal(true);
  };

  const isMongoIdSegment = (value) =>
    typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

  const getReadableLogLabel = (value) => {
    if (!value || typeof value !== "object") return null;

    const fullName = [value.firstName, value.middleName, value.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      fullName ||
      value.name ||
      value.title ||
      value.label ||
      value.departmentId ||
      value.empId ||
      value.email ||
      null
    );
  };

  const findPayloadLabelById = (payload, targetId) => {
    if (!payload || typeof payload !== "object" || !targetId) return null;

    for (const value of Object.values(payload)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item?._id?.toString?.() === targetId) {
            const label = getReadableLogLabel(item);
            if (label) return label;
          }
        }
        continue;
      }

      if (value?._id?.toString?.() === targetId) {
        const label = getReadableLogLabel(value);
        if (label) return label;
      }
    }

    return null;
  };

  const formatLogPath = (path, payload) => {
    const cleanSegments = (path || "")
      .split("/")
      .filter(Boolean)
      .slice(2)
      .map((segment) => {
        if (!isMongoIdSegment(segment)) return segment;
        return findPayloadLabelById(payload, segment) || "-";
      })
      .filter(Boolean);

    return cleanSegments.join(" > ") || "-";
  };

  const formatLogActivity = (action, path) => {
    if (!action) return "-";
    if (!isMongoIdSegment(action)) return action;

    const fallbackActivity = (path || "")
      .split("/")
      .filter(Boolean)
      .slice(2)
      .find((segment) => !isMongoIdSegment(segment));

    return fallbackActivity || "-";
  };

  const columns = [
    {
      headerName: "Sr No",
      field: "srNo",
      width: 100,
      sort: "desc",
    },
    {
      headerName: "Activity",
      field: "activity",
      flex: 1,
    },
    {
      headerName: "User",
      field: "user",
      flex: 1,
    },
    {
      headerName: "Path",
      field: "path",
      flex: 1,
    },
    {
      headerName: "Date",
      field: "createdAtExport",
      flex: 1,
      valueFormatter: (params) => {
        if (!params.value) return "-";
        return params.value;
      },
      cellRenderer: (params) => {
        if (!params.data?.createdAt) return "-";
        return `${humanDate(params.data.createdAt)}, ${humanTime(params.data.createdAt)}`;
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      align: "left",
      pinned: "right",
      suppressCsvExport: true,
      cellRenderer: (params) => (
        <div className="flex items-center justify-center h-full">
          <button
            type="button"
            aria-label="View log details"
            onClick={() => handleViewlog(params.data.payload)}
            className="text-[#5f6368] hover:text-primary"
          >
            <MdOutlineRemoveRedEye size={20} />
          </button>
        </div>
      ),
    },
  ];
  const tableData = isLoading
    ? []
    : // : data.map((item) => ({
      (data || []).map((item) => ({
        ...item,
        activity: formatLogActivity(item.action, item.path),
        user: `${item.performedBy?.firstName} ${item.performedBy?.lastName}`,
        path: formatLogPath(item.path, item.payload),
        createdAt: item.createdAt,
        createdAtExport: item.createdAt
          ? `${humanDate(item.createdAt)}, ${humanTime(item.createdAt)}`
          : "-",
        payload: item.payload,
      }));

  //////////////////////Format data for view modal/////////////////////////

  // Format key to be human-readable
  // const formatKey = (key) =>
  //   key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  const skipKeys = ["__v", "_id", "refreshToken", "password"];

  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const isMongoId = (value) => isMongoIdSegment(value);

  // Enhanced filter for object fields
  // const shouldSkipField = (key, value) => {
  //   if (skipKeys.includes(key)) return true;
  //   if (isMongoId(value)) return true;
  //   if (typeof value === "object" && !Array.isArray(value) && value !== null)
  //     return false; // allow first-level objects for image
  //   return false;
  // };

  const shouldSkipField = (key, value) => {
    if (skipKeys.includes(key)) return true;
    if (typeof value === "string" && isMongoId(value)) return true;
    if (Array.isArray(value)) {
      return value.every((item) => isMongoId(item));
    }
    return false;
  };

  const formatNestedDisplayValue = (value, parentKey = "") => {
    if (value === null || value === undefined || value === "") return "-";

    if (Array.isArray(value)) {
      const visibleItems = value.filter((item) => {
        if (typeof item === "object" && item !== null) {
          return Object.entries(item).some(
            ([itemKey, itemValue]) => !shouldSkipField(itemKey, itemValue),
          );
        }
        return !isMongoId(item);
      });

      if (!visibleItems.length) return "-";

      return (
        <ul className="list-disc list-inside">
          {visibleItems.map((item, idx) => (
            <li key={idx}>
              {typeof item === "object" && item !== null
                ? formatNestedDisplayValue(item, parentKey)
                : formatNestedDisplayValue(item, parentKey)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      const entries = Object.entries(value).filter(
        ([childKey, childValue]) => !shouldSkipField(childKey, childValue),
      );

      if (!entries.length) return "-";

      return (
        <div className="grid grid-cols-1 gap-1 text-sm max-w-md overflow-x-auto">
          {entries.map(([childKey, childValue], idx) => {
            const isImageField = childKey.toLowerCase().includes("image");
            if (isImageField && childValue) {
              const imageUrl =
                typeof childValue === "string"
                  ? childValue
                  : childValue.url || null;

              if (imageUrl) {
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <span>{formatKey(childKey)}:</span>
                    <img
                      src={imageUrl}
                      alt={childKey}
                      className="h-24 w-24 rounded border object-cover"
                    />
                  </div>
                );
              }
            }

            return (
              <div key={idx} className="flex gap-1 items-start">
                <span className="whitespace-nowrap">
                  {formatKey(childKey)}:
                </span>
                <span className="break-words">
                  {formatNestedDisplayValue(childValue, childKey)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    if (parentKey.toLowerCase().includes("date")) return humanDate(value);
    if (parentKey.toLowerCase().includes("time")) return humanTime(value);

    return String(value);
  };

  const formatValue = (key, value) => {
    if (shouldSkipField(key, value)) return null;
    if (isMongoId(value)) return null;

    // Arrays
    if (Array.isArray(value)) {
      return formatNestedDisplayValue(value, key);
    }

    // Objects
    if (typeof value === "object" && value !== null) {
      const entries = Object.entries(value).filter(
        ([subKey, subVal]) => !shouldSkipField(subKey, subVal),
      );

      if (!entries.length) return null;

      return formatNestedDisplayValue(value, key);
    }

    // Top-level key formatting
    if (key.toLowerCase().includes("date")) return humanDate(value);
    if (key.toLowerCase().includes("time")) return humanTime(value);

    return value ?? "-";
  };

  return (
    <div className="p-4">
      <PageFrame>
        <YearWiseTable
          data={tableData || []}
          columns={columns}
          dateColumn="createdAt"
          tableHeight={400}
          tableTitle="Logs Table"
          exportData={true}
          search={true}
          showDateNavigator
          selectedDateLabel={selectedLogDateLabel}
          onPreviousDay={handlePreviousLogDay}
          onNextDay={handleNextLogDay}
        />
        <MuiModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="View Log"
        >
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            {selectedLog &&
              Object.entries(selectedLog).map(([key, value], index) => {
                console.log("keys", key, "->", skipKeys.includes(key));
                if (skipKeys.includes(key)) {
                  console.log("inside", key, "->", skipKeys.includes(key));
                  return null;
                }
                const formattedKey = formatKey(key);
                const formattedValue = formatValue(key, value);

                if (!formattedKey || formattedValue === null) return null;

                return (
                  <DetalisFormatted
                    key={index}
                    title={formattedKey}
                    detail={formattedValue}
                  />
                );
              })}
          </div>
        </MuiModal>
      </PageFrame>
    </div>
  );
};

export default LogPage;
