import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import YearWiseTable from "../components/Tables/YearWiseTable";
const IST_TIME_ZONE = "Asia/Kolkata";

// Meeting logs carry the whole room/client document; the modal only needs the
// name of each so the remaining fields are not repeated as separate details.
const NAME_ONLY_KEYS = new Set([
  "bookedRoom",
  "room",
  "roomId",
  "bookedBy",
  "externalBookedBy",
  "clientBookedBy",
  "client",
  "externalClient",
  "externalCompany",
  "unit",
]);

// Nested fields that should not be expanded under a specific parent in the
// View Log modal.
const HIDDEN_CHILD_KEYS_BY_PARENT = {
  meetingId: new Set(["housekeepingChecklist"]),
};

const shouldHideChild = (parentKey, childKey) =>
  Boolean(HIDDEN_CHILD_KEYS_BY_PARENT[parentKey]?.has(childKey));

const ID_PROOF_KEYS = new Set(["idproof", "id_proof"]);
const FLAT_ID_KEYS = new Set(["idtype", "idnumber"]);

const isFlatIdKey = (key) =>
  FLAT_ID_KEYS.has(String(key || "").toLowerCase().replace(/[^a-z]/g, ""));

const isIdProofKey = (key) =>
  ID_PROOF_KEYS.has(String(key || "").toLowerCase());

// Visitor logs carry `idProof` as the raw JSON string submitted by the form;
// parse it so its parts can be shown as normal fields.
const parseJsonLikeValue = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  if (!trimmed || !/^[[{]/.test(trimmed) || !/[\]}]$/.test(trimmed)) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const istDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const istTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const toIstDate = (value) => {
  const parsed = new Date(value);

  if (!value || Number.isNaN(parsed.getTime())) return "—";

  return istDateFormatter.format(parsed).replace(/\//g, "-");
};

const toIstTime = (value) => {
  const parsed = new Date(value);

  if (!value || Number.isNaN(parsed.getTime())) return "—";

  return istTimeFormatter.format(parsed);
};

const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

// Keys such as `checkIn`/`checkOut` carry timestamps without saying "date" or
// "time" in the name, so recognise the value itself.
const formatIsoDateValue = (value) => {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return null;

  return value.includes("T") || value.includes(" ")
    ? `${toIstDate(value)}, ${toIstTime(value)}`
    : toIstDate(value);
};
import DetalisFormatted from "../components/DetalisFormatted";
import MuiModal from "../components/MuiModal";
import PageFrame from "../components/Pages/PageFrame";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import dayjs from "dayjs";

const LogPage = ({
  moduleFilter = "",
  userFilter = "",
  actionFilter = "",
  tableTitle = "Logs Table",
}) => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedLogDate, setSelectedLogDate] = useState(() =>
    dayjs().startOf("day"),
  );

  const selectedLogDateKey = selectedLogDate.format("YYYY-MM-DD");
  const selectedLogDateLabel = selectedLogDate.format("MMM D, YYYY");

  const [selectedLog, setselectedLog] = useState({});
  const { data, isLoading } = useQuery({
    queryKey: ["logs", selectedLogDateKey, moduleFilter, userFilter, actionFilter],
    queryFn: async () => {
      try {
        const params = {
          fromDate: selectedLogDateKey,
          toDate: selectedLogDateKey,
        };

        if (moduleFilter) params.module = moduleFilter;
        if (userFilter) params.performedBy = userFilter;
        if (actionFilter) params.actions = actionFilter;

        const response = await axios.get("/api/logs/get-logs", { params });
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

  const handleLogDateChange = useCallback((date) => {
    setSelectedLogDate(dayjs(date).startOf("day"));
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
      value.employeeName ||
      value.visitorCompany ||
      value.name ||
      value.title ||
      value.label ||
      value.subject ||
      value.clientName ||
      value.clientCompany ||
      value.registeredClientCompany ||
      value.companyName ||
      value.departmentId ||
      value.empId ||
      value.email ||
      null
    );
  };

  const getNameOnlyValue = (value) => {
    if (!value || typeof value !== "object") return null;

    // Units are identified by their number, not by their internal name.
    if (value.unitNo) return value.unitNo;

    return getReadableLogLabel(value);
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
      headerName: "User",
      field: "user",
      flex: 1,
    },
    {
      headerName: "Activity",
      field: "activity",
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
        return `${toIstDate(params.data.createdAt)}, ${toIstTime(params.data.createdAt)}`;
      },
    },
    {
      headerName: "Details",
      field: "logDetailsExport",
      hide: true,
      lockVisible: true,
      filter: false,
      getQuickFilterText: () => "",
    },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      align: "center",
      headerAlign: "center",
      pinned: "right",
      suppressCsvExport: true,
      cellRenderer: (params) => (
        <div className="flex h-full min-h-[36px] items-center justify-center">
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
          ? `${toIstDate(item.createdAt)}, ${toIstTime(item.createdAt)}`
          : "-",
        payload: item.payload,
      }));

  //////////////////////Format data for view modal/////////////////////////

  // Format key to be human-readable
  // const formatKey = (key) =>
  //   key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  const skipKeys = [
    "__v",
    "_id",
    "refreshToken",
    "password",
    "createdAt",
    "updatedAt",
  ];

  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const getIdProofParts = (value) => {
    const parsed = parseJsonLikeValue(value);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    if (parsed.idType === undefined && parsed.idNumber === undefined) {
      return null;
    }

    return { idType: parsed.idType, idNumber: parsed.idNumber };
  };

  // Visitor forms send both `idProof` and flat `idType`/`idNumber` fields.
  // Use the parsed object once and suppress the duplicate flat keys.
  const getIdProofPartsFromPayload = (payload) => {
    for (const [key, rawValue] of Object.entries(payload || {})) {
      if (!isIdProofKey(key)) continue;
      const parts = getIdProofParts(parseJsonLikeValue(rawValue));
      if (parts) return parts;
    }
    return null;
  };

  // `idProof` is shown as two plain fields (ID Type / ID Number) instead of a
  // single JSON blob in the View Log modal.
  const getLogDetailEntries = (payload) => {
    const idProofParts = getIdProofPartsFromPayload(payload);
    let idProofRendered = false;

    return Object.entries(payload || {}).flatMap(([key, rawValue]) => {
      if (skipKeys.includes(key)) return [];

      const value = parseJsonLikeValue(rawValue);

      if (isIdProofKey(key)) {
        if (idProofParts && !idProofRendered) {
          idProofRendered = true;
          return [
            { key: "idType", title: "Id Type", value: idProofParts.idType },
            {
              key: "idNumber",
              title: "Id Number",
              value: idProofParts.idNumber,
            },
          ];
        }
        return [];
      }

      if (idProofParts && isFlatIdKey(key)) return [];

      return [{ key, title: formatKey(key), value }];
    });
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

  const formatNestedDisplayValue = (value, parentKey = "", asText = false) => {
    value = parseJsonLikeValue(value);

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

      if (asText) {
        return visibleItems
          .map((item) => `- ${formatNestedDisplayValue(item, parentKey, true)}`)
          .join("\n");
      }

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
      if (NAME_ONLY_KEYS.has(parentKey)) {
        return getNameOnlyValue(value) || "-";
      }

      const entries = Object.entries(value).filter(
        ([childKey, childValue]) =>
          !shouldSkipField(childKey, childValue) &&
          !shouldHideChild(parentKey, childKey),
      );

      if (!entries.length) return "-";

      if (asText) {
        return entries
          .map(([childKey, childValue]) => {
            const imageUrl = childKey.toLowerCase().includes("image")
              ? typeof childValue === "string"
                ? childValue
                : childValue?.url
              : null;
            return `${formatKey(childKey)}: ${imageUrl || formatNestedDisplayValue(childValue, childKey, true)}`;
          })
          .join("\n");
      }

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

    if (parentKey.toLowerCase().includes("date")) return toIstDate(value);
    if (parentKey.toLowerCase().includes("time")) return toIstTime(value);

    const isoDate = formatIsoDateValue(value);
    if (isoDate) return isoDate;

    return String(value);
  };

  const formatValue = (key, value, asText = false) => {
    value = parseJsonLikeValue(value);

    if (shouldSkipField(key, value)) return null;
    if (isMongoId(value)) return null;

    // Arrays
    if (Array.isArray(value)) {
      return formatNestedDisplayValue(value, key, asText);
    }

    // Objects
    if (typeof value === "object" && value !== null) {
      if (NAME_ONLY_KEYS.has(key)) {
        return getNameOnlyValue(value) || "-";
      }

      const entries = Object.entries(value).filter(
        ([subKey, subVal]) =>
          !shouldSkipField(subKey, subVal) &&
          !shouldHideChild(key, subKey),
      );

      if (!entries.length) return null;

      const readableLabel = getReadableLogLabel(value);
      const hasOnlyReadableLabel = entries.every(([subKey]) =>
        ["name", "title", "label", "empId", "email"].includes(subKey),
      );

      if (readableLabel && hasOnlyReadableLabel) return readableLabel;

      return formatNestedDisplayValue(value, key, asText);
    }

    // Top-level key formatting
    if (key.toLowerCase().includes("date")) return toIstDate(value);
    if (key.toLowerCase().includes("time")) return toIstTime(value);

    const isoDate = formatIsoDateValue(value);
    if (isoDate) return isoDate;

    return value ?? "-";
  };

  // Flattens every field shown in the View Log modal into one line so the
  // exported Details cell carries the same information (CSV cells that rely on
  // line breaks appear truncated in most spreadsheet apps).
  const formatLogDetailsForExport = (payload) => {
    const segments = [];

    const pushValue = (rawValue, path, key) => {
      const value = parseJsonLikeValue(rawValue);
      const label = path.join(" > ");

      const leafText = (leafValue) => {
        if (leafValue === null || leafValue === undefined || leafValue === "") {
          return "-";
        }

        const formatted = formatValue(key, leafValue, true);

        return formatted === null || formatted === undefined
          ? "-"
          : String(formatted);
      };

      if (Array.isArray(value)) {
        const visibleItems = value.filter((item) => {
          if (item && typeof item === "object") {
            return Object.entries(item).some(
              ([itemKey, itemValue]) => !shouldSkipField(itemKey, itemValue),
            );
          }
          return !isMongoId(item);
        });

        if (!visibleItems.length) {
          segments.push(`${label}: -`);
          return;
        }

        const primitiveItems = visibleItems.filter(
          (item) => item === null || typeof item !== "object",
        );

        if (primitiveItems.length) {
          segments.push(
            `${label}: ${primitiveItems.map((item) => leafText(item)).join(", ")}`,
          );
        }

        visibleItems
          .filter((item) => item !== null && typeof item === "object")
          .forEach((item, index) => {
            pushValue(
              item,
              [
                ...path.slice(0, -1),
                `${path[path.length - 1]} ${index + 1}`,
              ],
              key,
            );
          });

        return;
      }

      if (value && typeof value === "object") {
        const entries = Object.entries(value).filter(
          ([childKey, childValue]) =>
            !shouldSkipField(childKey, childValue) &&
            !shouldHideChild(key, childKey),
        );

        if (!entries.length) {
          segments.push(`${label}: -`);
          return;
        }

        const readableLabel = getReadableLogLabel(value);
        const hasOnlyReadableLabel = entries.every(([childKey]) =>
          ["name", "title", "label", "empId", "email"].includes(childKey),
        );

        if (NAME_ONLY_KEYS.has(key)) {
          segments.push(`${label}: ${getNameOnlyValue(value) || "-"}`);
          return;
        }

        if (readableLabel && hasOnlyReadableLabel) {
          segments.push(`${label}: ${readableLabel}`);
          return;
        }

        entries.forEach(([childKey, childValue]) => {
          pushValue(childValue, [...path, formatKey(childKey)], childKey);
        });

        return;
      }

      segments.push(`${label}: ${leafText(value)}`);
    };

    const idProofParts = getIdProofPartsFromPayload(payload);
    let idProofExported = false;

    Object.entries(payload || {}).forEach(([key, rawValue]) => {
      if (skipKeys.includes(key)) return;

      const value = parseJsonLikeValue(rawValue);

      if (isIdProofKey(key)) {
        if (idProofParts && !idProofExported) {
          idProofExported = true;
          segments.push(`Id Type: ${idProofParts.idType ?? "-"}`);
          segments.push(`Id Number: ${idProofParts.idNumber ?? "-"}`);
        }
        return;
      }

      if (idProofParts && isFlatIdKey(key)) return;
      if (shouldSkipField(key, value) || isMongoId(value)) return;
      pushValue(value, [formatKey(key)], key);
    });

    return segments.join(" | ") || "-";
  };

  // The Details column is a value of the exported row itself, so the export
  // does not depend on a hidden column's valueGetter.
  const tableDataWithDetails = tableData.map((row) => ({
    ...row,
    logDetailsExport: formatLogDetailsForExport(row.payload),
  }));

  return (
    <div className="p-4">
      <PageFrame>
        <YearWiseTable
          loading={isLoading}
          data={tableDataWithDetails || []}
          columns={columns}
          dateColumn="createdAt"
          tableHeight={400}
          tableTitle={tableTitle}
          exportData={true}
          exportAllColumns
          search={true}
          showDateNavigator
          selectedDateLabel={selectedLogDateLabel}
          selectedDate={selectedLogDate}
          onSelectedDateChange={handleLogDateChange}
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
              getLogDetailEntries(selectedLog).map(
                ({ key, title, value }, index) => {
                  const formattedValue = formatValue(key, value);

                  if (!title || formattedValue === null) return null;

                  return (
                    <DetalisFormatted
                      key={`${key}-${index}`}
                      title={title}
                      detail={formattedValue}
                    />
                  );
                },
              )}
          </div>
        </MuiModal>
      </PageFrame>
    </div>
  );
};

export default LogPage;
