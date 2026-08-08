import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import { IconButton, MenuItem, TextField } from "@mui/material";
import dayjs from "dayjs";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";

const UNIT_OPTIONS = [
  "ST 701A",
  "ST 701B",
  "ST 601A",
  "ST 601B",
  "ST 501A",
  "ST 501B",
];

const ENERGY_METER_ROWS = [
  {
    unitNo: "ST 501A",
    meterNo: "MTR-501A-001",
    previousReading: 12580,
  },
  {
    unitNo: "ST 501B",
    meterNo: "MTR-501B-001",
    previousReading: 11240,
  },
  {
    unitNo: "ST 601A",
    meterNo: "MTR-601A-001",
    previousReading: 15890,
  },
  {
    unitNo: "ST 601B",
    meterNo: "MTR-601B-001",
    previousReading: 13450,
  },
  {
    unitNo: "ST 701A",
    meterNo: "MTR-701A-001",
    previousReading: 17560,
  },
  {
    unitNo: "ST 701B",
    meterNo: "MTR-701B-001",
    previousReading: 14230,
  },
];

const SEED_READINGS = [
  {
    id: 1,
    meterNo: "MTR-ST-001",
    unitNo: "ST-701A",
    previousReading: 12480,
    currentReading: 12640,
    consumption: 160,
    date: "2026-08-07",
    addedBy: "Rajesh Sawant",
  },
  {
    id: 2,
    meterNo: "MTR-ST-002",
    unitNo: "ST-701B",
    previousReading: 15210,
    currentReading: 15350,
    consumption: 140,
    date: "2026-08-07",
    addedBy: "Nilesh Patil",
  },
  {
    id: 3,
    meterNo: "MTR-ST-003",
    unitNo: "ST-601A",
    previousReading: 9800,
    currentReading: 9965,
    consumption: 165,
    date: "2026-08-06",
    addedBy: "Shubham Jadhav",
  },
  {
    id: 4,
    meterNo: "MTR-ST-004",
    unitNo: "G-1",
    previousReading: 17640,
    currentReading: 17755,
    consumption: 115,
    date: "2026-08-05",
    addedBy: "Sneha Desai",
  },
];

const emptyFormValues = {
  meterNo: "",
  unitNo: "",
  previousReading: "",
  currentReading: "",
  date: dayjs().format("YYYY-MM-DD"),
  addedBy: "",
};

const formatDate = (value) => dayjs(value).format("DD-MM-YYYY");

const MaintainanceStEnergyReadingDaily = () => {
  const [readings, setReadings] = useState(SEED_READINGS);
  const [filterDate, setFilterDate] = useState(
  dayjs().format("YYYY-MM-DD")
);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedReading, setSelectedReading] = useState(null);
  const [readingName, setReadingName] = useState("Kalpesh Naik");

const [readingDate, setReadingDate] = useState(
  dayjs().format("YYYY-MM-DD")
);

const [dailyReadings, setDailyReadings] = useState(
  ENERGY_METER_ROWS.map((row) => ({
    ...row,
    currentReading: "",
    consumption: 0,
  }))
);

 const {
  control,
  handleSubmit,
  reset,
  watch,
} = useForm({
  defaultValues: emptyFormValues,
});

const editCurrentReading = watch("currentReading");

  const currentDateLabel = useMemo(
    () => dayjs().format("DD MMM YYYY"),
    [],
  );

  const handlePreviousDate = () => {
  setFilterDate((prev) =>
    dayjs(prev).subtract(1, "day").format("YYYY-MM-DD")
  );
};

const handleNextDate = () => {
  setFilterDate((prev) =>
    dayjs(prev).add(1, "day").format("YYYY-MM-DD")
  );
};

const selectedDateLabel = dayjs(filterDate).format("DD MMM YYYY");
  const tableTitle = `Sunteck Building - Energy Reading`;

const filteredReadings = useMemo(() => {
  return readings
    .filter((row) =>
      dayjs(row.date).isSame(dayjs(filterDate), "day")
    )
    .sort(
      (a, b) =>
        dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    );
}, [filterDate, readings]);

  const tableData = useMemo(
    () =>
      filteredReadings.map((row, index) => ({
        ...row,
        srNo: index + 1,
        dateDisplay: formatDate(row.date),
        meterNoDisplay: row.meterNo,
      })),
    [filteredReadings],
  );

  const openAddModal = () => {
  setModalMode("add");
  setSelectedReading(null);

  setReadingDate(filterDate);

  setDailyReadings(
    ENERGY_METER_ROWS.map((row) => ({
      ...row,
      currentReading: "",
      consumption: 0,
    }))
  );

  setModalOpen(true);
};

const handleDailyReadingChange = (index, value) => {
  setDailyReadings((prev) =>
    prev.map((row, rowIndex) => {
      if (rowIndex !== index) return row;

      const previousReading = Number(row.previousReading) || 0;
      const currentReading = value === "" ? "" : Number(value);

      const consumption =
        currentReading === ""
          ? 0
          : currentReading - previousReading;

      return {
        ...row,
        currentReading: value,
        consumption,
      };
    })
  );
};

const handleAddDailyReadings = () => {
  const enteredReadings = dailyReadings.filter(
    (row) => row.currentReading !== ""
  );

  if (!enteredReadings.length) return;

  setReadings((current) => {
    let nextId =
      current.length > 0
        ? Math.max(...current.map((row) => row.id)) + 1
        : 1;

    const newRows = enteredReadings.map((row) => ({
      id: nextId++,
      meterNo: row.meterNo,
      unitNo: row.unitNo,
      previousReading: Number(row.previousReading),
      currentReading: Number(row.currentReading),
      consumption: Number(row.consumption),
      date: readingDate,
      addedBy: readingName,
    }));

    return [...newRows, ...current];
  });

  setFilterDate(readingDate);
  setModalOpen(false);
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

  const handleAddOrUpdate = (formValues) => {
    const previousReading = Number(formValues.previousReading || 0);
    const currentReading = Number(formValues.currentReading || 0);
    const payload = {
      meterNo: formValues.meterNo,
      unitNo: formValues.unitNo,
      previousReading,
      currentReading,
      consumption: Math.max(currentReading - previousReading, 0),
      date: formValues.date,
      addedBy: formValues.addedBy,
    };

    setReadings((current) => {
      if (modalMode === "edit" && selectedReading) {
        return current.map((row) =>
          row.id === selectedReading.id ? { ...row, ...payload } : row,
        );
      }

      const nextId =
        current.length > 0 ? Math.max(...current.map((row) => row.id)) + 1 : 1;

      return [
        {
          id: nextId,
          ...payload,
        },
        ...current,
      ];
    });

    closeModal();
    reset(emptyFormValues);
  };

  const columns = [
    { field: "srNo", headerName: "Sr. No", flex: 0.5, minWidth: 90 },
    { field: "meterNo", headerName: "Meter No", flex: 1, minWidth: 140 },
    { field: "unitNo", headerName: "Unit No", flex: 1, minWidth: 130 },
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
    { field: "dateDisplay", headerName: "Date", flex: 1, minWidth: 120 },
    { field: "addedBy", headerName: "Added By", flex: 1, minWidth: 160 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 160,
      pinned: "right",
      cellRenderer: (params) => (
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
      ),
    },
  ];

  const filteredCountLabel = filterDate
    ? `${filteredReadings.length} records`
    : `${readings.length} records`;

  return (
    <div className="p-4">
{/* <PageFrame>
  <div className="flex flex-col gap-5">

    <div className="flex items-center justify-center gap-3">
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

    <AgTable
      data={tableData}
      columns={columns}
      tableTitle={tableTitle}
      buttonTitle="Add Reading"
      handleClick={openAddModal}
      exportData
      hideFilter
    />

  </div> 
</PageFrame>*/}
<PageFrame>
  <div className="flex flex-col gap-5">
    <AgTable
      data={tableData}
      columns={columns}
      tableTitle="Sunteck Building - Energy Reading"
      buttonTitle="Add Reading"
      handleClick={openAddModal}
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

      {/* <MuiModal
        open={modalOpen}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit Reading" : "Add Reading"}
      >
        <form className="space-y-4" onSubmit={handleSubmit(handleAddOrUpdate)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              name="meterNo"
              control={control}
              rules={{ required: "Meter No is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Meter No"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="unitNo"
              control={control}
              rules={{ required: "Unit No is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Unit No"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="" disabled>
                    Select Unit
                  </MenuItem>
                  {UNIT_OPTIONS.map((unitNo) => (
                    <MenuItem key={unitNo} value={unitNo}>
                      {unitNo}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="previousReading"
              control={control}
              rules={{ required: "Previous Reading is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Previous Reading"
                  type="number"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="currentReading"
              control={control}
              rules={{ required: "Current Reading is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Current Reading"
                  type="number"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="date"
              control={control}
              rules={{ required: "Date is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="addedBy"
              control={control}
              rules={{ required: "Added By is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Added By"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3">
            <SecondaryButton title="Cancel" handleSubmit={closeModal} />
            <PrimaryButton
              type="submit"
              title={modalMode === "edit" ? "Save Changes" : "Add Reading"}
            />
          </div>
        </form>
      </MuiModal> */}
      <MuiModal
  open={modalOpen}
  onClose={closeModal}
  title={
    modalMode === "edit"
      ? "EDIT READING"
      : " ADD ENERGY READING"
  }
>
  {modalMode === "add" ? (
    <div className="w-full">

      {/* Name and Date */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="Name"
          size="small"
          fullWidth
          disabled
          value={readingName}
          onChange={(e) => setReadingName(e.target.value)}
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
        />
      </div>

      {/* Daily Reading Table */}
      <div className="overflow-x-auto rounded-md border border-borderGray">
        <table className="w-full border-collapse">

          <thead>
            <tr className="bg-primary text-white">
              <th className="px-3 py-3 text-center text-sm font-medium">
                Unit No.
              </th>

              <th className="px-3 py-3 text-center text-sm font-medium">
                Meter No.
              </th>

              <th className="px-3 py-3 text-center text-sm font-medium">
                Previous Reading
              </th>

              <th className="px-3 py-3 text-center text-sm font-medium">
                Current Reading
              </th>

              <th className="px-3 py-3 text-center text-sm font-medium">
                Consumption (Units)
              </th>
            </tr>
          </thead>

          <tbody>
            {dailyReadings.map((row, index) => (
              <tr
                key={row.unitNo}
                className="border-b border-borderGray last:border-b-0"
              >
                {/* Unit No */}
                <td className="border-r border-borderGray px-3 py-2 text-center">
                  <span className="text-sm font-medium">
                    {row.unitNo}
                  </span>
                </td>

                {/* Meter No */}
                <td className="border-r border-borderGray px-2 py-2">
                  <TextField
                    size="small"
                    fullWidth
                    value={row.meterNo}
                    disabled
                  />
                </td>

                {/* Previous Reading */}
                <td className="border-r border-borderGray px-2 py-2">
                  <TextField
                    size="small"
                    fullWidth
                    value={row.previousReading}
                    disabled
                  />
                </td>

                {/* Current Reading */}
                <td className="border-r border-borderGray px-2 py-2">
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    value={row.currentReading}
                    placeholder="Enter reading"
                    onChange={(e) =>
                      handleDailyReadingChange(
                        index,
                        e.target.value
                      )
                    }
                    inputProps={{
                      min: row.previousReading,
                    }}
                  />
                </td>

                {/* Consumption */}
                <td className="px-2 py-2">
                  <TextField
                    size="small"
                    fullWidth
                    value={row.consumption}
                    disabled
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Readings Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleAddDailyReadings}
          className="w-full rounded-md bg-primary py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Add Readings
        </button>
      </div>
    </div>
  ) : (
    /* EDIT MODAL */
    <form
      className="space-y-4"
      onSubmit={handleSubmit(handleAddOrUpdate)}
    >
      <div className="grid gap-4 md:grid-cols-2">

        <Controller
          name="meterNo"
          control={control}
          rules={{
            required: "Meter No is required",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Meter No"
              fullWidth
              size="small"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="unitNo"
          control={control}
          rules={{
            required: "Unit No is required",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              label="Unit No"
              fullWidth
              size="small"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              <MenuItem value="" disabled>
                Select Unit
              </MenuItem>

              {UNIT_OPTIONS.map((unitNo) => (
                <MenuItem key={unitNo} value={unitNo}>
                  {unitNo}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="previousReading"
          control={control}
          rules={{
            required: "Previous Reading is required",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Previous Reading"
              type="number"
              fullWidth
              size="small"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="currentReading"
          control={control}
          rules={{
            required: "Current Reading is required",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Current Reading"
              type="number"
              fullWidth
              size="small"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          rules={{
            required: "Date is required",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Date"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="addedBy"
          control={control}
          rules={{
            required: "Added By is required",
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Added By"
              fullWidth
              size="small"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-3">
        <SecondaryButton
          title="Cancel"
          handleSubmit={closeModal}
        />

        <PrimaryButton
          type="submit"
          title="Save Changes"
        />
      </div>
    </form>
  )}
</MuiModal>

    <MuiModal
  open={detailOpen}
  onClose={closeDetailModal}
  title="VIEW READING DETAILS"
>
  {selectedReading && (
    <div className="px-2 py-2">
      <div className="flex flex-col gap-4">
        <DetalisFormatted
          title="Sr. No"
          detail={selectedReading.id ?? "-"}
        />

        <DetalisFormatted
          title="Meter No"
          detail={selectedReading.meterNo || "-"}
        />

        <DetalisFormatted
          title="Unit No"
          detail={selectedReading.unitNo || "-"}
        />

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

        <DetalisFormatted
          title="Date"
          detail={
            selectedReading.date
              ? formatDate(selectedReading.date)
              : "-"
          }
        />

        <DetalisFormatted
          title="Added By"
          detail={selectedReading.addedBy || "-"}
        />
      </div>
    </div>
  )}
</MuiModal>
    </div>
  );
};

export default MaintainanceStEnergyReadingDaily;
