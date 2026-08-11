import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Chip, IconButton, Modal, TextField } from "@mui/material";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "motion/react";
import { IoMdClose } from "react-icons/io";
import { FaEye } from "react-icons/fa";

import PrimaryButton from "../../../../components/PrimaryButton";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAuth from "../../../../hooks/useAuth";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { toast } from "sonner";

const DTC_ENERGY_MONTHLY_API = "/api/maintenance";
const DTC_ENERGY_MONTHLY_GET_API = `${DTC_ENERGY_MONTHLY_API}/get-dtc-energy-monthly`;
const DTC_ENERGY_MONTHLY_FORM_API = `${DTC_ENERGY_MONTHLY_GET_API}/form-data`;
const DTC_ENERGY_MONTHLY_ADD_API = `${DTC_ENERGY_MONTHLY_API}/add-dtc-energy-monthly`;
const DTC_ENERGY_MONTHLY_EDIT_API = `${DTC_ENERGY_MONTHLY_API}/edit-dtc-energy-monthly`;


const monthKeyFromValue = (value) => dayjs(value).format("YYYY-MM");
const formatDate = (value) => (value ? dayjs(value).format("DD-MM-YYYY") : "-");
const formatDateTime = (value) =>
  value ? dayjs(value).format("DD-MM-YYYY, hh:mm A") : "-";
const formatAmount = (value) =>
  `INR ${Number(value || 0).toLocaleString("en-IN")}`;

const getTodayDateKey = () => dayjs().format("YYYY-MM-DD");

// const getConsumptionForMonth = (unit, monthValue, index) => {
//   const monthFactor = dayjs(monthValue).month() + 1;
//   return unit.baseConsumption + monthFactor * 15 + index * 8;
// };

// const buildBillTimestamp = (baseDate, index) =>
//   dayjs(baseDate)
//     .hour(9 + index)
//     .minute((index * 13) % 60)
//     .second(0)
//     .millisecond(0)
//     .toISOString();

// const getBillAmountForConsumption = (consumption, index) => {
//   const rate = 7.4 + index * 0.18;
//   return Math.round(consumption * rate);
// };

// const getSeedRecords = () => {
//   const currentMonth = dayjs().startOf("month");
//   const previousMonth = dayjs().subtract(1, "month").startOf("month");
//   const months = [previousMonth, currentMonth];

//   return months.flatMap((month, monthIndex) =>
//     MONTHLY_UNIT_MASTER.map((unit, index) => {
//       const totalConsumption = getConsumptionForMonth(
//         unit,
//         month,
//         index + monthIndex,
//       );
//       const totalBillAmount = getBillAmountForConsumption(
//         totalConsumption,
//         index + monthIndex,
//       );
//       const date = month.add(20 + index, "day").format("YYYY-MM-DD");
//       const billTimestamp = buildBillTimestamp(date, index + monthIndex);

//       return {
//         id: createId(),
//         unitNo: unit.unitNo,
//         meterNo: unit.meterNo,
//         totalConsumption,
//         totalBillAmount,
//         date,
//         billTimestamp,
//         addedBy: "System Admin",
//         monthKey: monthKeyFromValue(date),
//       };
//     }),
//   );
// };

// const buildMonthRows = (monthValue, existingRows, addedBy) => {
//   const monthKey = monthKeyFromValue(monthValue);

//   return MONTHLY_UNIT_MASTER.map((unit, index) => {
//     const existingRow = existingRows.find((row) => row.unitNo === unit.unitNo);
//     const dateValue =
//       existingRow?.date || dayjs(monthValue).endOf("month").format("YYYY-MM-DD");
//     const billTimestamp =
//       existingRow?.billTimestamp || buildBillTimestamp(dateValue, index);
//     const totalConsumption =
//       existingRow?.totalConsumption ??
//       getConsumptionForMonth(unit, monthValue, index);

//     return {
//       id: existingRow?.id || createId(),
//       unitNo: unit.unitNo,
//       meterNo: existingRow?.meterNo || unit.meterNo,
//       totalConsumption,
//       totalBillAmount: existingRow?.totalBillAmount ?? "",
//       date: dateValue,
//       billTimestamp,
//       addedBy: existingRow?.addedBy || addedBy,
//       monthKey,
//     };
//   });
// };

const modalFieldSx = {
  "& .MuiInputLabel-root": {
    fontSize: "0.8rem",
    color: "#7a8497",
    top: "-2px",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#1f3f7a",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fafafa",
    minHeight: "48px",
    "& fieldset": {
      borderColor: "#d6dbe6",
    },
    "&:hover fieldset": {
      borderColor: "#9aa7bd",
    },
    "&.Mui-disabled": {
      backgroundColor: "#f8fafc",
    },
  },
  "& .MuiInputBase-input": {
    padding: "13px 14px",
    fontSize: "0.96rem",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#6b7280",
  },
};

const editFieldSx = {
  "& .MuiInputLabel-root": {
    fontSize: "0.88rem",
    color: "#8f8f8f",
    top: "0px",
    fontWeight: 400,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#1f3f7a",
  },
  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
    backgroundColor: "#fff",
    padding: "0 4px",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "4px",
    backgroundColor: "#ffffff",
    minHeight: "40px",
    "& fieldset": {
      borderColor: "#cfcfcf",
    },
    "&:hover fieldset": {
      borderColor: "#b8b8b8",
    },
    "&.Mui-disabled": {
      backgroundColor: "#ffffff",
    },
  },
  "& .MuiInputBase-input": {
    padding: "10px 12px",
    fontSize: "0.95rem",
    color: "#4b4b4b",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "#8e8e8e",
  },
};

const currentBillFieldSx = {
  ...modalFieldSx,
  position: "relative",
  "& .MuiFormHelperText-root": {
    position: "absolute",
    left: 0,
    bottom: "-15px",
    margin: 0,
    lineHeight: 1,
    fontSize: "0.72rem",
    whiteSpace: "nowrap",
  },
};

const MonthlyBillModal = ({ open, onClose, title, children }) => {
  return (
    <AnimatePresence>
      <Modal open={open} onClose={onClose}>
        <div className="fixed inset-0 flex items-center justify-center px-3 py-5">
          <motion.div
            initial={{ y: 26, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 26, opacity: 0, scale: 0.985 }}
            className="flex max-h-[92vh] w-[88vw] max-w-[820px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] outline-none"
          >
            <div className="relative flex items-center justify-center border-b border-slate-200 bg-white px-4 py-2.5 md:px-5">
              <div className="text-center text-[1.05rem] font-medium uppercase tracking-[0.03em] text-[#1f3f7a]">
                {title}
              </div>

              <IconButton
                onClick={onClose}
                sx={{ position: "absolute", right: 14, top: "50%", p: 0 }}
                style={{ transform: "translateY(-50%)" }}
                aria-label="close-modal"
              >
                <IoMdClose className="text-[22px] text-black" />
              </IconButton>
            </div>

             <div className="overflow-y-auto px-4 pb-4 pt-3 md:px-5">
              {children}
            </div>
          </motion.div>
        </div>
      </Modal>
    </AnimatePresence>
  );
};

const emptyEditValues = {
  totalBillAmount: "",
};

const MaintainanceDtcEnergyReadingMonthly = () => {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const readingName = auth?.user
    ? `${auth.user.firstName || ""} ${auth.user.lastName || ""}`.trim()
    : "System Admin";

  const [selectedMonth, setSelectedMonth] = useState(
    dayjs().startOf("month"),
  );
  const [todayDateKey, setTodayDateKey] = useState(getTodayDateKey);
  const [records, setRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [billRows, setBillRows] = useState([]);
  const [billErrors, setBillErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const lastKnownMonthKeyRef = useRef(dayjs().format("YYYY-MM"));

  const { control, handleSubmit, reset } = useForm({
    defaultValues: emptyEditValues,
  });

  const selectedMonthKey = useMemo(
    () => monthKeyFromValue(selectedMonth),
    [selectedMonth],
  );
  const currentMonthKey = todayDateKey.slice(0, 7);

  const monthRecords = records;

  const totalConsumption = useMemo(
    () =>
      monthRecords.reduce(
        (sum, row) => sum + Number(row.totalConsumption || 0),
        0,
      ),
    [monthRecords],
  );

  const totalBillAmount = useMemo(
    () =>
      monthRecords.reduce(
        (sum, row) => sum + Number(row.totalBillAmount || 0),
        0,
      ),
    [monthRecords],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTodayDateKey((currentDateKey) => {
        const nextDateKey = getTodayDateKey();
        return currentDateKey === nextDateKey ? currentDateKey : nextDateKey;
      });
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (
      selectedMonthKey === lastKnownMonthKeyRef.current &&
      currentMonthKey !== lastKnownMonthKeyRef.current
    ) {
      setSelectedMonth(dayjs().startOf("month"));
    }

    lastKnownMonthKeyRef.current = currentMonthKey;
  }, [currentMonthKey, selectedMonthKey]);

  const monthBillDate = selectedMonthKey === currentMonthKey
    ? todayDateKey
    : selectedMonth.endOf("month").format("YYYY-MM-DD");
  const monthRange = useMemo(
    () => ({
      startDate: selectedMonth.startOf("month").toDate(),
      endDate: selectedMonth.endOf("month").toDate(),
      key: "selection",
    }),
    [selectedMonth],
  );

  useEffect(() => {
    let active = true;
    const loadMonthlyBills = () => {
      axiosPrivate
        .get(DTC_ENERGY_MONTHLY_GET_API, { params: { date: monthBillDate } })
        .then(({ data }) => {
          if (active) {
            setRecords(
              (data.data || []).map((row) => ({
                ...row,
                billRecordedAt: row.billTimestamp || row.date,
              })),
            );
          }
        })
        .catch((error) => {
          if (active) {
            toast.error(
              error.response?.data?.message || "Unable to load DTC monthly bills",
            );
          }
        });
    };

    loadMonthlyBills();
    const shouldPollCurrentMonth = selectedMonthKey === currentMonthKey;
    const timer = shouldPollCurrentMonth
      ? setInterval(loadMonthlyBills, 30000)
      : null;

    return () => {
      active = false;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [axiosPrivate, currentMonthKey, monthBillDate, selectedMonthKey]);

  const openAddModal = async () => {
    try {
      const { data } = await axiosPrivate.get(DTC_ENERGY_MONTHLY_FORM_API, {
        params: { date: monthBillDate },
      });
      setBillRows(
        (data.data || []).map((row) => ({
          ...row,
          totalBillAmount:
            records.find((record) => record.unitId === row.unitId)
              ?.totalBillAmount ?? "",
        })),
      );
      setBillErrors({});
      setModalMode("add");
      setSelectedRecord(null);
      setModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load DTC units");
    }
  };

  const openEditModal = (row) => {
    setModalMode("edit");
    setSelectedRecord(row);
    reset({
      totalBillAmount: row.totalBillAmount,
    });
    setModalOpen(true);
  };

  const openViewModal = (row) => {
    setSelectedRecord(row);
    setDetailOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const closeDetailModal = () => {
    setDetailOpen(false);
  };

  const handleBillAmountChange = (index, value) => {
    setBillErrors((current) => {
      const rowErrors = current[index];
      if (!rowErrors?.totalBillAmount) return current;

      const next = { ...current };
      const nextRowErrors = { ...rowErrors };
      delete nextRowErrors.totalBillAmount;
      if (Object.keys(nextRowErrors).length === 0) {
        delete next[index];
      } else {
        next[index] = nextRowErrors;
      }
      return next;
    });

    setBillRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              totalBillAmount: value,
            }
          : row,
      ),
    );
  };

  const handleAddBills = async () => {
    const nextErrors = {};

    billRows.forEach((row, index) => {
      const rowErrors = {};

      if (Number(row.totalConsumption) <= 0) {
        rowErrors.totalConsumption = "Total Consumption is required";
      }

      if (row.totalConsumption > 0 && (row.totalBillAmount === "" || Number(row.totalBillAmount) <= 0)) {
        rowErrors.totalBillAmount = "Total Bill Amount is required";
      }

      if (Object.keys(rowErrors).length > 0) {
        nextErrors[index] = rowErrors;
      }
    });

    setBillErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

   try {
      setSaving(true);
      await axiosPrivate.post(DTC_ENERGY_MONTHLY_ADD_API, {
        date: monthBillDate,
        bills: billRows.map(({ unitId, totalBillAmount }) => ({
          unitId,
          totalBillAmount: Number(totalBillAmount),
        })),
      });
      const { data } = await axiosPrivate.get(DTC_ENERGY_MONTHLY_GET_API, {
        params: { date: monthBillDate },
      });
      setRecords(
        (data.data || []).map((row) => ({
          ...row,
          billRecordedAt: row.billTimestamp || row.date,
        })),
      );

      toast.success("DTC energy bills added");
      setModalOpen(false);
      setBillErrors({});
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add DTC energy bills");
    } finally {
      setSaving(false);
    }
  };

  const handleEditBill = async (formValues) => {
    if (!selectedRecord) return;

    try {
      setSaving(true);
      const nextBillAmount = Number(formValues.totalBillAmount || 0);

      if (nextBillAmount <= 0) {
        toast.error("Bill amount is required");
        return;
      }

      const { data } = await axiosPrivate.patch(
        `${DTC_ENERGY_MONTHLY_EDIT_API}/${selectedRecord.id}`,
        { totalBillAmount: nextBillAmount },
      );
      setRecords((current) =>
        current.map((row) =>
          row.id === selectedRecord.id
            ? {
                ...data.data,
                billRecordedAt: data.data.billTimestamp || data.data.date,
              }
            : row,
        ),
      );

      toast.success("DTC energy bill updated");
      setModalOpen(false);
      reset(emptyEditValues);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update DTC energy bill");
    } finally {
      setSaving(false);
    }
  };


  const columns = [
    { field: "srNo", headerName: "Sr. No", flex: 0.45, minWidth: 90 },
    { field: "unitNo", headerName: "Unit No", flex: 0.9, minWidth: 140 },
    { field: "meterNo", headerName: "Meter No", flex: 1, minWidth: 140 },
   {
      field: "totalConsumption",
      headerName: "Total Consumption (KWH)",
      flex: 1,
      minWidth: 180,
      valueFormatter: (params) => Number(params.value || 0).toLocaleString("en-IN"),
    },
    {
      field: "totalBillAmount",
      headerName: "Total Bill Amount",
      flex: 1,
      minWidth: 170,
      valueFormatter: (params) =>
        Number(params.value || 0).toLocaleString("en-IN"),
    },
    {
      field: "billRecordedAt",
      headerName: "Date",
      flex: 1.05,
      minWidth: 180,
      exportFormat: "datetime-comma",
      valueFormatter: (params) => formatDateTime(params.value),
    },
    { field: "addedBy", headerName: "Added By", flex: 1, minWidth: 150 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 170,
      pinned: "right",
      cellRenderer: (params) =>
        params.data?.id ? (
          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              onClick={() => openViewModal(params.data)}
              aria-label="view-record"
            >
              <FaEye />
            </IconButton>

            <ThreeDotMenu
              rowId={params.data.id}
              menuItems={[
                {
                  label: "Edit",
                  onClick: () => openEditModal(params.data),
                },
                {
                  label: "View Record",
                  onClick: () => openViewModal(params.data),
                },
              ]}
            />
          </div>
        ) : null,
    },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        <div className="flex flex-col gap-5">
          <YearWiseTable
            data={records}
            columns={columns}
            tableTitle="Dempo Trade Centre - Energy Consumption Bill"
            hideTitle={true}
            tableHeight={450}
            dateColumn="date"
            initialDateRange={monthRange}
            preserveCurrentMonthRange
            onDateFilterChange={({ selectedRange }) => {
              if (selectedRange?.startDate) {
                const nextMonth = dayjs(selectedRange.startDate).startOf("month");
                const nextMonthKey = monthKeyFromValue(nextMonth);
                if (nextMonthKey !== selectedMonthKey) {
                  setSelectedMonth(nextMonth);
                }
              }
            }}
            headerActions={
              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  label={`TOTAL CONSUMPTION : ${Number(
                    totalConsumption,
                  ).toLocaleString("en-IN")}`}
                  sx={{
                    backgroundColor: "#dfe8ff",
                    color: "#1f3f7a",
                    border: "1px solid #b8cbff",
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    height: "36px",
                    borderRadius: "8px",
                    px: 1.15,
                    "& .MuiChip-label": {
                      px: 0.9,
                    },
                  }}
                />

                <Chip
                  label={`TOTAL BILL : ${formatAmount(totalBillAmount)}`}
                                   sx={{
                    backgroundColor: "#eef7ef",
                    color: "#17693a",
                    border: "1px solid #c7e6d0",
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    height: "36px",
                    borderRadius: "8px",
                    px: 1.15,
                    "& .MuiChip-label": {
                      px: 0.9,
                    },
                  }}
                />

                <PrimaryButton title="Add Bill" handleSubmit={openAddModal} />
              </div>
            }
            exportData
            hideFilter
            taskExportDateTimeFormatting
          />
        </div>
      </PageFrame>

      {modalMode === "add" && (
        <MonthlyBillModal
          open={modalOpen}
          onClose={closeModal}
          title="ADD DTC ENERGY CONSUMPTION BILL - MONTHLY"
        >
          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                label="Name"
                size="small"
                fullWidth
                disabled
                value={readingName}
                sx={modalFieldSx}
              />

              <TextField
                label="Date"
                size="small"
                disabled
                fullWidth
                value={formatDate(monthBillDate)}
                InputLabelProps={{ shrink: true }}
                sx={modalFieldSx}
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[18%]" />
                  <col className="w-[24%]" />
                  <col className="w-[30%]" />
                  <col className="w-[28%]" />
                </colgroup>

                <thead>
                  <tr className="bg-[#1f3f7a] text-white">
                    <th className="px-4 py-3 text-center text-[13px] font-medium tracking-wide">
                      Unit No.
                    </th>
                    <th className="px-4 py-3 text-center text-[13px] font-medium tracking-wide">
                      Meter No.
                    </th>
                    <th className="px-4 py-3 text-center text-[13px] font-medium tracking-wide">
                      Total Consumption (KWH)
                    </th>
                    <th className="px-4 py-3 text-center text-[13px] font-medium tracking-wide">
                      Total Bill Amount (INR)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {billRows.map((row, index) => (
                    <tr
                      key={row.unitId}
                      className="border-b border-slate-200 last:border-b-0 even:bg-slate-50/50"
                    >
                      <td className="border-r border-slate-200 px-3 py-2.5 text-center">
                        <span className="text-sm font-medium text-slate-800">
                          {row.unitNo}
                        </span>
                      </td>

                      <td className="border-r border-slate-200 px-2 py-2">
                        <TextField
                          size="small"
                          fullWidth
                          value={row.meterNo}
                          disabled
                          sx={modalFieldSx}
                        />
                      </td>

                      <td className="border-r border-slate-200 px-2 py-2">
                        <TextField
                          size="small"
                          fullWidth
                          value={row.totalConsumption}
                          disabled
                          error={Boolean(billErrors[index]?.totalConsumption)}
                          helperText={billErrors[index]?.totalConsumption}
                          sx={modalFieldSx}
                        />
                      </td>

                      <td className="px-2 py-2">
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          value={row.totalBillAmount}
                          placeholder="Enter bill amount"
                          onChange={(event) =>
                            handleBillAmountChange(index, event.target.value)
                          }
                          error={Boolean(billErrors[index]?.totalBillAmount)}
                          helperText={billErrors[index]?.totalBillAmount}
                          inputProps={{
                            min: 0,
                          }}
                          sx={currentBillFieldSx}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-1">
              <motion.button
                type="button"
                onClick={handleAddBills}
                disabled={saving}
                whileHover={{
                  scale: 1.035,
                  y: -4,
                  boxShadow: "0 18px 38px rgba(31, 63, 122, 0.38)",
                }}
                whileTap={{ scale: 0.97, y: 0 }}
                transition={{ type: "spring", stiffness: 650, damping: 24 }}
                className="w-full rounded-xl bg-primary py-3 text-base font-medium text-white shadow-[0_10px_20px_rgba(31,63,122,0.22)] transition-[filter] duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {saving ? "Saving..." : "Add Bill"}
              </motion.button>
            </div>
          </div>
        </MonthlyBillModal>
      )}

      {modalMode === "edit" && (
        <MonthlyBillModal
          open={modalOpen}
          onClose={closeModal}
          title="EDIT CONSUMPTION BILL"
        >
          <form className="space-y-3.5" onSubmit={handleSubmit(handleEditBill)}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                label="Name"
                size="small"
                fullWidth
                disabled
                value={selectedRecord?.addedBy || readingName}
                InputLabelProps={{ shrink: true }}
                sx={editFieldSx}
              />

              <TextField
                label="Date"
                size="small"
                fullWidth
                disabled
              value={formatDate(selectedRecord?.billRecordedAt)}
                InputLabelProps={{ shrink: true }}
                sx={editFieldSx}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                label="Unit No"
                size="small"
                fullWidth
                disabled
                value={selectedRecord?.unitNo || "-"}
                InputLabelProps={{ shrink: true }}
                sx={editFieldSx}
              />

              <TextField
                label="Meter No"
                size="small"
                fullWidth
                disabled
                value={selectedRecord?.meterNo || "-"}
                InputLabelProps={{ shrink: true }}
                sx={editFieldSx}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                label="Total Consumption (KWH)"
                size="small"
                fullWidth
                disabled
                value={selectedRecord?.totalConsumption ?? "-"}
                InputLabelProps={{ shrink: true }}
                sx={editFieldSx}
              />

              <Controller
                name="totalBillAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Total Bill Amount"
                    type="number"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={editFieldSx}
                  />
                )}
              />
            </div>

            <div className="pt-1">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99, y: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 26 }}
                className="w-full rounded-[4px] bg-primary py-[10px] text-[14px] font-medium text-white shadow-[0_10px_18px_rgba(31,63,122,0.18)] transition-[filter,box-shadow] duration-150 hover:brightness-110 hover:shadow-[0_14px_24px_rgba(31,63,122,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </form>
        </MonthlyBillModal>
      )}

      <MuiModal
        open={detailOpen}
        onClose={closeDetailModal}
        title="VIEW CONSUMPTION BILL DETAILS"
      >
        {selectedRecord && (
          <div className="px-2 py-2">
            <div className="flex flex-col gap-4">
              <DetalisFormatted title="Sr. No" detail={selectedRecord.srNo ?? "-"} />
              <DetalisFormatted title="Unit No" detail={selectedRecord.unitNo || "-"} />
              <DetalisFormatted title="Meter No" detail={selectedRecord.meterNo || "-"} />
              <DetalisFormatted
                title="Total Consumption (KWH)"
                detail={selectedRecord.totalConsumption ?? "-"}
              />
              <DetalisFormatted
                title="Total Bill Amount"
                detail={formatAmount(selectedRecord.totalBillAmount)}
              />
              <DetalisFormatted
                title="Date"
                detail={formatDateTime(selectedRecord.billRecordedAt)}
              />
              <DetalisFormatted title="Added By" detail={selectedRecord.addedBy || "-"} />
            </div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default MaintainanceDtcEnergyReadingMonthly;
