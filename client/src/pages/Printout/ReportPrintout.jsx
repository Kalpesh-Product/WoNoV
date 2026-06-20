import { useMemo, useState } from "react";
import { CircularProgress, Popover } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DateRangePicker } from "react-date-range";
import { MdCalendarToday, MdOutlineRemoveRedEye } from "react-icons/md";
import AgTable from "../../components/AgTable";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const joinName = (...parts) => parts.filter(Boolean).join(" ");

const getUserName = (user) =>
  user?.employeeName ||
  joinName(user?.firstName, user?.lastName) ||
  user?.name ||
  user?.email ||
  "—";

const getCompanyName = (company) =>
  company?.clientName || company?.companyName || company?.name || "—";

const getLocationName = (location, unit) =>
  location?.buildingName || unit?.building?.buildingName || "—";

const getUnitName = (unit) => unit?.unitNo || unit?.unitName || "—";
const getDepartmentName = (department) => department?.name || "—";

const formatDateTime = (value) =>
  value && dayjs(value).isValid()
    ? dayjs(value).format("DD-MM-YYYY , hh:mm A")
    : "—";

const getTableValue = (value) => {
  const normalizedValue = String(value ?? "").trim();
  return ["-", "—", "–", "â€”", "Ã¢â‚¬â€"].includes(normalizedValue)
    ? ""
    : value;
};

const csvEscape = (value) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
};

const ReportPrintout = () => {
  const axios = useAxiosPrivate();
  const [selectedPrintout, setSelectedPrintout] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    },
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openCalendar = Boolean(anchorEl);

  const { data: printouts = [], isLoading: isPrintoutsLoading } = useQuery({
    queryKey: ["printouts"],
    queryFn: async () => {
      const response = await axios.get("/api/printout");
      return response.data?.printouts || [];
    },
  });

  const filteredPrintouts = useMemo(() => {
    const startDate = dateRange[0]?.startDate
      ? dayjs(dateRange[0].startDate).startOf("day")
      : null;
    const endDate = dateRange[0]?.endDate
      ? dayjs(dateRange[0].endDate).endOf("day")
      : null;

    return printouts.filter((printout) => {
      const takenAt = dayjs(printout.takenAt);
      if (!takenAt.isValid()) return false;
      if (startDate && takenAt.isBefore(startDate)) return false;
      if (endDate && takenAt.isAfter(endDate)) return false;
      return true;
    });
  }, [dateRange, printouts]);

  const tableRows = useMemo(
    () =>
      filteredPrintouts.map((printout, index) => ({
        rawPrintout: printout,
        srNo: index + 1,
        takenBy: getTableValue(getUserName(printout.takenBy)),
        takenAt: getTableValue(formatDateTime(printout.takenAt)),
        location: getTableValue(getLocationName(printout.location, printout.unit)),
        unit: getTableValue(getUnitName(printout.unit)),
        client: getTableValue(getCompanyName(printout.client)),
        requestedBy: getTableValue(getUserName(printout.requestedBy)),
        department: getTableValue(getDepartmentName(printout.department)),
        printoutCount: printout.printoutCount,
      })),
    [filteredPrintouts]
  );

  const columns = [
    { field: "srNo", headerName: "Sr. No.", width: 110 },
    { field: "takenBy", headerName: "Taken By",flex:1},
    { field: "takenAt", headerName: "Taken At",flex:1},
    { field: "location", headerName: "Building",flex:1},
    { field: "unit", headerName: "Unit",flex:1},
    { field: "client", headerName: "Company",flex:1},
    { field: "requestedBy", headerName: "Person",flex:1},
    { field: "department", headerName: "Department",flex:1},
    { field: "printoutCount", headerName: "Quantity",flex:1},
    // {
    //   field: "actions",
    //   headerName: "Action",
    //   pinned: "right",
    //   cellRenderer: ({ data }) => (
    //     <div className="flex items-center gap-2">
    //       <div
    //         role="button"
    //         onClick={() => openViewModal(data)}
    //         className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
    //       >
    //         <MdOutlineRemoveRedEye />
    //       </div>
    //     </div>
    //   ),
    // },
  ];

  const openViewModal = (row) => {
    setSelectedPrintout(row?.rawPrintout || null);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedPrintout(null);
  };

  const handleOpenCalendar = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCalendar = () => {
    setAnchorEl(null);
  };

  const handleExport = () => {
    const headers = columns.map((column) => column.headerName);
    const fields = columns.map((column) => column.field);
    const csvRows = [
      headers.map(csvEscape).join(","),
      ...tableRows.map((row) => fields.map((field) => csvEscape(row[field])).join(",")),
    ];
    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `printout-report-${dayjs().format("YYYY-MM-DD")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <PageFrame>
        <div className="flex flex-col gap-4 pb-4">
          <div className="grid grid-cols-12 items-center w-full pb-4">
            <div className="col-span-12 md:col-span-4">
              <span className="text-title text-primary font-pmedium uppercase">
                Printout Reports
              </span>
            </div>
            <div className="col-span-12 md:col-span-4 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                  <span className="text-gray-600 text-content font-pregular">
                    {dayjs(dateRange[0]?.startDate).format("DD MMM YYYY")}
                  </span>
                </div>
                <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                  <span className="text-gray-600 text-content font-pregular">
                    {dayjs(dateRange[0]?.endDate).format("DD MMM YYYY")}
                  </span>
                </div>
                <div
                  className="p-2 rounded-md bg-primary text-white cursor-pointer hover:bg-[#1E3D55]"
                  onClick={handleOpenCalendar}
                >
                  <MdCalendarToday size={19} />
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 flex justify-end">
              <PrimaryButton
                title="Export"
                handleSubmit={handleExport}
                type="button"
                externalStyles="!bg-primary"
                padding="px-6 py-2"
              />
            </div>
          </div>

          <Popover
            open={openCalendar}
            anchorEl={anchorEl}
            onClose={handleCloseCalendar}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <DateRangePicker
              ranges={dateRange}
              onChange={(item) => setDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
            />
          </Popover>

          <AgTable
            data={tableRows}
            columns={columns}
            search
            tableHeight={500}
            //hideFilter
            //hideTitle
            paginationPageSize={10}
          />
          {isPrintoutsLoading ? (
            <div className="flex justify-center p-4">
              <CircularProgress size={24} />
            </div>
          ) : null}
        </div>
      </PageFrame>

      <MuiModal
        open={isViewModalOpen}
        onClose={closeViewModal}
        title="Printout Details"
      >
        <div className="flex flex-col gap-3">
          <DetalisFormatted
            title="Taken By"
            detail={getUserName(selectedPrintout?.takenBy)}
          />
          <DetalisFormatted
            title="Taken At"
            detail={formatDateTime(selectedPrintout?.takenAt)}
          />
          <DetalisFormatted
            title="Building"
            detail={getLocationName(selectedPrintout?.location, selectedPrintout?.unit)}
          />
          <DetalisFormatted
            title="Unit"
            detail={getUnitName(selectedPrintout?.unit)}
          />
          <DetalisFormatted
            title="Company"
            detail={getCompanyName(selectedPrintout?.client)}
          />
          <DetalisFormatted
            title="Person"
            detail={getUserName(selectedPrintout?.requestedBy)}
          />
          <DetalisFormatted
            title="Department"
            detail={getDepartmentName(selectedPrintout?.department)}
          />
          <DetalisFormatted
            title="Quantity"
            detail={selectedPrintout?.printoutCount}
          />
        </div>
      </MuiModal>
    </div>
  );
};

export default ReportPrintout;


// const ReportPrintout = () => {
//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-semibold">Report Printout</h1>
//       <p className="mt-2 text-gray-600">Report Printout Page</p>
//     </div>
//   );
// };

// export default ReportPrintout;
