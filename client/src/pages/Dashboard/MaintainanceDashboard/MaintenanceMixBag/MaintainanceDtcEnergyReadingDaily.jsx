import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import { Chip, IconButton, MenuItem, Modal, TextField } from "@mui/material";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "motion/react";
import { IoMdClose } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";

import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import useAuth from "../../../../hooks/useAuth";
import { toast } from "sonner";

const DTC_ENERGY_DAILY_API = "/api/maintenance";
const DTC_ENERGY_DAILY_GET_API = `${DTC_ENERGY_DAILY_API}/get-dtc-energy-daily`;
const DTC_ENERGY_DAILY_FORM_API = `${DTC_ENERGY_DAILY_GET_API}/form-data`;
const DTC_ENERGY_DAILY_ADD_API = `${DTC_ENERGY_DAILY_API}/add-dtc-energy-daily`;
const DTC_ENERGY_DAILY_EDIT_API = `${DTC_ENERGY_DAILY_API}/edit-dtc-energy-daily`;

const emptyFormValues = {
  meterNo: "",
  unitNo: "",
  previousReading: "",
  currentReading: "",
  date: dayjs().format("YYYY-MM-DD"),
  addedBy: "",
};

const formatDate = (value) => dayjs(value).format("DD-MM-YYYY");
const formatDateTime = (value) =>
  value ? dayjs(value).format("DD-MM-YYYY, hh:mm A") : "";
const isPreviousDate = (value) => dayjs(value).isBefore(dayjs(), "day");


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

const currentReadingFieldSx = {
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

const DailyReadingModal = ({ open, onClose, title, children }) => {
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

const MaintainanceDtcEnergyReadingDaily = () => {
   const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const [readings, setReadings] = useState([]);
  const [filterDate, setFilterDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedReading, setSelectedReading] = useState(null);
   const readingName = auth?.user
    ? `${auth.user.firstName || ""} ${auth.user.lastName || ""}`.trim()
    : "";
  const [readingDate, setReadingDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentReadingErrors, setCurrentReadingErrors] = useState({});
    const [dailyReadings, setDailyReadings] = useState([]);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: emptyFormValues,
  });

  const editPreviousReading = watch("previousReading");
  const editCurrentReading = watch("currentReading");
  const editConsumption = Math.max(
    selectedReading?.hasPreviousReading
      ? Number(editCurrentReading || 0) - Number(editPreviousReading || 0)
      : 0,
    0,
  );

  useEffect(() => {
    let active = true;
    axiosPrivate
      .get(DTC_ENERGY_DAILY_GET_API, { params: { date: filterDate } })
      .then(({ data }) => active && setReadings(data.data || []))
      .catch((error) => toast.error(error.response?.data?.message || "Unable to load readings"));
    return () => {
      active = false;
    };
  }, [axiosPrivate, filterDate]);

  const handlePreviousDate = () => {
    setFilterDate((prev) =>
      dayjs(prev).subtract(1, "day").format("YYYY-MM-DD"),
    );
  };

  const handleNextDate = () => {
    setFilterDate((prev) => dayjs(prev).add(1, "day").format("YYYY-MM-DD"));
  };

  const selectedDateLabel = dayjs(filterDate).format("DD MMM YYYY");
  const tableTitle = "Dempo Trade Centre Building - Energy Reading";

 const tableData = useMemo(
    () =>
      readings.map((row, index) => ({
        ...row,
        srNo: index + 1,
        dateDisplay: formatDateTime(row.date),
        meterNoDisplay: row.meterNo,
      })),
    [readings],
  );

  const totalConsumption = useMemo(
    () =>
      readings.reduce(
        (sum, row) => sum + Number(row.consumption || 0),
        0,
      ),
    [readings],
  );

  const openAddModal = async () => {
    setModalMode("add");
    setSelectedReading(null);
    setReadingDate(filterDate);
    setCurrentReadingErrors({});
    try {
      const { data } = await axiosPrivate.get(
        DTC_ENERGY_DAILY_FORM_API,
        { params: { date: filterDate } },
      );
      setDailyReadings(
        (data.data || []).map((row) => ({
          ...row,
          currentReading: "",
          consumption: 0,
        })),
      );
      setModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load DTC units");
    }
  };

  const handleMeterChange = (index, value) => {
    setDailyReadings((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, meterNo: value } : row,
      ),
    );
  };


  const handleDailyReadingChange = (index, value) => {
    setCurrentReadingErrors((prev) => {
      if (!prev[index]) return prev;

      const next = { ...prev };
      delete next[index];
      return next;
    });

    setDailyReadings((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const previousReading = Number(row.previousReading) || 0;
        const currentReading = value === "" ? "" : Number(value);
        const consumption =
          currentReading === ""
            ? 0
            : row.hasPreviousReading
              ? currentReading - previousReading
              : 0;

        return {
          ...row,
          currentReading: value,
          consumption,
        };
      }),
    );
  };

  const handleAddDailyReadings = async () => {
    if (isPreviousDate(readingDate)) {
      toast.error("Reading cannot be added for a previous date");
      return;
    }
  const nextErrors = {};
    dailyReadings.forEach((row, index) => {
      if (!row.meterNo.trim() || row.currentReading === "") {
        nextErrors[index] = "Meter No. and current reading are required";
      } else if (Number(row.currentReading) < Number(row.previousReading)) {
        nextErrors[index] = "Must be at least the previous reading";
      }
    });

    setCurrentReadingErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

     try {
      setSaving(true);
      await axiosPrivate.post(DTC_ENERGY_DAILY_ADD_API, {
        date: readingDate,
        readings: dailyReadings.map(({ unitId, meterNo, currentReading }) => ({
          unitId,
          meterNo,
          currentReading: Number(currentReading),
        })),
      });
      setFilterDate(readingDate);
      setModalOpen(false);
      setCurrentReadingErrors({});
      toast.success("DTC energy readings added");
      const { data } = await axiosPrivate.get(DTC_ENERGY_DAILY_GET_API, {
        params: { date: readingDate },
      });
      setReadings(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add readings");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (row) => {
    setModalMode("edit");
    setSelectedReading(row);
    reset({
      meterNo: row.meterNo,
      unitNo: row.unitNo,
      previousReading: row.previousReading,
      currentReading: row.currentReading,
      date: row.date,
      addedBy: row.addedBy,
      hasPreviousReading: row.hasPreviousReading,
    });
    setModalOpen(true);
  };

  const openViewModal = (row) => {
    setSelectedReading(row);
    setDetailOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const closeDetailModal = () => {
    setDetailOpen(false);
  };

  const handleAddOrUpdate = async (formValues) => {
    try {
      setSaving(true);
      const { data } = await axiosPrivate.patch(
        `${DTC_ENERGY_DAILY_EDIT_API}/${selectedReading.id}`,
        { meterNo: formValues.meterNo, currentReading: Number(formValues.currentReading) },
      );
      setReadings((current) =>
        current.map((row) => (row.id === selectedReading.id ? data.data : row)),
      );
      closeModal();
      reset(emptyFormValues);
      toast.success("DTC energy reading updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update reading");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: "srNo", headerName: "Sr. No", flex: 0.5, minWidth: 90 },
    { field: "unitNo", headerName: "Unit No", flex: 1, minWidth: 140 },
    { field: "meterNo", headerName: "Meter No", flex: 1, minWidth: 130 },
    {
      field: "previousReading",
      headerName: "Previous Reading",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "currentReading",
      headerName: "Current Reading",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "consumption",
      headerName: "Consumption (KWH)",
      flex: 1,
      minWidth: 170,
    },
    { field: "addedBy", headerName: "Added By", flex: 1, minWidth: 120 },
    { field: "dateDisplay", headerName: "AddedAt", flex: 1, minWidth: 150 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 160,
      pinned: "right",
      cellRenderer: (params) => (
        params.data.id ? (
          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              onClick={() => openViewModal(params.data)}
              aria-label="view-reading"
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
        ) : null
      ),
    },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        <div className="flex flex-col gap-5">
          <AgTable
            data={tableData}
            search={true}
            columns={columns}
            tableTitle={tableTitle}
            buttonTitle="Add Reading"
            handleClick={openAddModal}
            headerActions={
              <div className="order-first">
                <Chip
                  label={`TOTAL CONSUMPTION : ${totalConsumption}`}
                  sx={{
                    backgroundColor: "#dfe8ff",
                    color: "#1f3f7a",
                    border: "1px solid #b8cbff",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    height: "40px",
                    borderRadius: "10px",
                    px: 1.5,
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />
              </div>
            }
            exportData
            hideFilter
            headerBottomContent={
              <div className="flex w-full justify-center pt-2 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePreviousDate}
                    className="flex h-10 w-12 items-center justify-center rounded-xl bg-primary text-white transition hover:opacity-90"
                  >
                    <FaChevronLeft size={14} />
                  </button>

                  <div className="flex h-10 min-w-[140px] items-center justify-center rounded-lg border border-primary bg-white px-5 text-sm font-medium text-slate-600">
                    {selectedDateLabel}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextDate}
                    className="flex h-10 w-12 items-center justify-center rounded-xl bg-primary text-white transition hover:opacity-90"
                  >
                    <FaChevronRight size={14} />
                  </button>
                </div>
              </div>
            }
          />
        </div>
      </PageFrame>

      {modalMode === "add" && (
        <DailyReadingModal
          open={modalOpen}
          onClose={closeModal}
          title="ADD DTC ENERGY READING - DAILY"
        >
          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <TextField
                label="Name"
                size="small"
                fullWidth
                disabled
                value={readingName}
                 // onChange={(e) => setReadingName(e.target.value)}
                sx={modalFieldSx}
              />

              <TextField
                label="Date"
                type="date"
                size="small"
                disabled
                fullWidth
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={modalFieldSx}
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[12%]" />
                  <col className="w-[22%]" />
                  <col className="w-[20%]" />
                  <col className="w-[23%]" />
                  <col className="w-[23%]" />
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
                      Previous Reading
                    </th>
                    <th className="px-4 py-3 text-center text-[13px] font-medium tracking-wide">
                      Current Reading
                    </th>
                    <th className="px-4 py-3 text-center text-[13px] font-medium tracking-wide">
                      Consumption (KWH)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dailyReadings.map((row, index) => (
                    <tr
                      key={row.unitNo}
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
                            placeholder="Enter meter no."
                          type="text"
                          onChange={(event) => handleMeterChange(index, event.target.value)}
                          inputProps={{ inputMode: "text" }}
                          sx={modalFieldSx}
                        />
                      </td>

                      <td className="border-r border-slate-200 px-2 py-2">
                        <TextField
                          size="small"
                          fullWidth
                          value={row.previousReading}
                          disabled
                          sx={modalFieldSx}
                        />
                      </td>

                      <td className="border-r border-slate-200 px-2 py-2">
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          value={row.currentReading}
                          placeholder="Enter reading"
                          onChange={(e) =>
                            handleDailyReadingChange(index, e.target.value)
                          }
                          error={Boolean(currentReadingErrors[index])}
                          helperText={currentReadingErrors[index]}
                          inputProps={{
                            min: row.previousReading,
                          }}
                          sx={currentReadingFieldSx}
                        />
                      </td>

                      <td className="px-2 py-2">
                        <TextField
                          size="small"
                          fullWidth
                          value={row.consumption}
                          disabled
                          sx={modalFieldSx}
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
                onClick={handleAddDailyReadings}
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
                {saving ? "Saving..." : "Add Reading"}
              </motion.button>
            </div>
          </div>
        </DailyReadingModal>
      )}

      {modalMode === "edit" && (
        <DailyReadingModal
          open={modalOpen}
          onClose={closeModal}
          title="EDIT DTC ENERGY READING - DAILY"
        >
          <form className="space-y-3.5" onSubmit={handleSubmit(handleAddOrUpdate)}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Controller
                name="addedBy"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    size="small"
                    disabled
                    InputLabelProps={{ shrink: true }}
                    sx={editFieldSx}
                  />
                )}
              />

              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date"
                   // type="date"
                    fullWidth
                    size="small"
                    disabled
                    value={field.value ? formatDateTime(field.value) : ""}
                    InputLabelProps={{ shrink: true }}
                    sx={editFieldSx}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Controller
                name="unitNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Unit No"
                    fullWidth
                    size="small"
                    disabled
                    InputLabelProps={{ shrink: true }}
                    sx={editFieldSx}
                  />
                )}
              />

              <Controller
                name="meterNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Meter No"
                    type="text"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                   // inputProps={{ inputMode: "text" }}
                    sx={editFieldSx}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Controller
                name="previousReading"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Previous Reading"
                    type="number"
                    fullWidth
                    size="small"
                    disabled
                    InputLabelProps={{ shrink: true }}
                    sx={editFieldSx}
                  />
                )}
              />

              <Controller
                name="currentReading"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Current Reading"
                    type="number"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={editFieldSx}
                  />
                )}
              />

              <TextField
                label="Consumption (KWH)"
                value={editConsumption}
                fullWidth
                size="small"
                disabled
                InputLabelProps={{ shrink: true }}
                sx={editFieldSx}
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
        </DailyReadingModal>
      )}

      <MuiModal
        open={detailOpen}
        onClose={closeDetailModal}
        title="VIEW READING DETAILS"
      >
        {selectedReading && (
          <div className="px-2 py-2">
            <div className="flex flex-col gap-4">
              <DetalisFormatted title="Sr. No" detail={selectedReading.srNo ?? "-"} />
              <DetalisFormatted title="Unit No" detail={selectedReading.unitNo || "-"} />
              <DetalisFormatted title="Meter No" detail={selectedReading.meterNo || "-"} />
              <DetalisFormatted
                title="Previous Reading"
                detail={selectedReading.previousReading ?? "-"}
              />
              <DetalisFormatted
                title="Current Reading"
                detail={selectedReading.currentReading ?? "-"}
              />
              <DetalisFormatted
                title="Consumption (KWH)"
                detail={selectedReading.consumption ?? "-"}
              />
              <DetalisFormatted title="Added By" detail={selectedReading.addedBy || "-"} />
              <DetalisFormatted
                title="Added At"
                detail={selectedReading.date ? formatDateTime(selectedReading.date) : "-"}

              />
            </div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default MaintainanceDtcEnergyReadingDaily;
