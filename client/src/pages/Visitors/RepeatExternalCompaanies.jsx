import { useCallback, useEffect, useMemo, useState } from "react";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import AgTable from "../../components/AgTable";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "../../constants/pagination";

const RepeatExternalCompaanies = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [loading, setLoading] = useState(true);
  const [repeatExternalCompanies, setRepeatExternalCompanies] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSubmittingRepeatClient, setIsSubmittingRepeatClient] =
    useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [companySearch, setCompanySearch] = useState("");
  const [debouncedCompanySearch, setDebouncedCompanySearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setDebouncedCompanySearch(companySearch.trim()),
      400,
    );
    return () => clearTimeout(timeoutId);
  }, [companySearch]);

  const handleCompanySearchChange = useCallback((value) => {
    setCompanySearch(value);
    setPagination((current) => ({ ...current, page: 1 }));
  }, []);

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      visitorName: "",
      company: "",
      purposeOfVisit: "Full Day Pass",
      location: "",
      unit: "",
      dateOfVisit: dayjs(),
      checkInTime: null,
      checkOutTime: null,
    },
  });
  const watchLocation = watch("location");

  const { data: unitsData = [] } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        return response.data || [];
      } catch (error) {
        console.error("Error fetching units data:", error);
        return [];
      }
    },
  });

  const fetchRepeatExternalCompanies = useCallback(async () => {
    setLoading(true);
    try {
      //const visitorsResponse = await axios.get("/api/visitors/fetch-visitors?type=day-pass&page=1&limit=10");
       const visitorsResponse = await axios.get("/api/visitors/fetch-visitors", {
        params: {
          type: "day-pass",
          visitorFlag: "Client",
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedCompanySearch || undefined,
          searchContext: "repeat-external-companies",
        },
      });
      const visitors = visitorsResponse.data.data || [];
       const responsePagination =
        visitorsResponse.data.pagination || visitorsResponse.data;

      setPagination((current) => ({
        page: Number(responsePagination.page) || current.page,
        limit: Number(responsePagination.limit) || current.limit,
        total: Number(responsePagination.total) || 0,
      }));
      console.log("Fetched visitors:", visitors);

      const dayPassVisitors = visitors.filter((visitor) => {
        const isExternalVisitor = visitor.visitorFlag === "Client";
        const purpose = (visitor.purposeOfVisit || "").trim().toLowerCase();

        return (
          isExternalVisitor &&
          (purpose === "half-day pass" || purpose === "full-day pass")
        );
      });

      setRepeatExternalCompanies(dayPassVisitors);
      const convertedClients = visitors.filter(
        (visitor) => visitor?.visitorFlag === "Client",
      );

      setRepeatExternalCompanies(convertedClients);
    } catch (error) {
      console.error("Failed to fetch repeat external companies", error);
      toast.error("Failed to load repeat external companies.");
    } finally {
      setLoading(false);
    }
  }, [
    axios,
    pagination.page,
    pagination.limit,
    debouncedCompanySearch,
  ]);

  useEffect(() => {
    fetchRepeatExternalCompanies();
  }, [fetchRepeatExternalCompanies]);

  const tableData = useMemo(
    () =>
      repeatExternalCompanies.map((item, index) => ({
        ...item,
        srNo: (pagination.page - 1) * pagination.limit + index + 1,
        mongoId: item._id,
        visitorName:
          `${item.firstName || ""} ${item.lastName || ""}`.trim() || "N/A",
        company:
          item.visitorCompany ||
          item.brandName ||
          item.registeredClientCompany ||
          "N/A",
        locationId:
          item?.building?._id ||
          item?.location?._id ||
          item?.location?.building?._id ||
          (typeof item?.building === "string" ? item.building : ""),
        unitId:
          item?.unit?._id || (typeof item?.unit === "string" ? item.unit : ""),
      })),
    [repeatExternalCompanies, pagination.page, pagination.limit], 
  );

  const openRepeatClientModal = useCallback(
    (row) => {
      setSelectedRow(row);
      const sourceCheckIn = row?.checkIn ? dayjs(row.checkIn) : dayjs();

      reset({
        visitorName: row?.visitorName || "N/A",
        company: row?.company || "N/A",
        purposeOfVisit: "Full Day Pass",
        location: row?.locationId || "",
        unit: row?.unitId || "",
        dateOfVisit: sourceCheckIn.startOf("day"),
        checkInTime: sourceCheckIn,
        checkOutTime: null,
      });

      setOpenModal(true);
    },
    [reset],
  );

  const handleRepeatClientSubmit = async (formData) => {
    if (!selectedRow?.mongoId) return;

    const selectedDate = dayjs(formData.dateOfVisit);
    const checkInInput = dayjs(formData.checkInTime);
    const checkOutInput = formData.checkOutTime
      ? dayjs(formData.checkOutTime)
      : null;

    if (!selectedDate.isValid()) {
      toast.error("Please select valid date of visit.");
      return;
    }

    if (!checkInInput.isValid()) {
      toast.error("Please select valid check-in time.");
      return;
    }

    const checkIn = selectedDate
      .hour(checkInInput.hour())
      .minute(checkInInput.minute())
      .second(0)
      .millisecond(0);

    const checkOut = checkOutInput?.isValid()
      ? selectedDate
          .hour(checkOutInput.hour())
          .minute(checkOutInput.minute())
          .second(0)
          .millisecond(0)
      : null;

    if (checkOut?.isValid() && checkOut.isBefore(checkIn)) {
      toast.error("Check-out time cannot be before check-in time.");
      return;
    }

    setIsSubmittingRepeatClient(true);
    try {
      await axios.post(`/api/visitors/rebook-client/${selectedRow.mongoId}`, {
        purposeOfVisit: formData.purposeOfVisit,
        building: formData.location || null,
        unit: formData.unit || null,
        dateOfVisit: selectedDate.startOf("day").toISOString(),
        checkInTime: checkIn.toISOString(),
        checkOutTime: checkOut?.isValid() ? checkOut.toISOString() : null,
      });

      toast.success("Repeat client added successfully.");
      setOpenModal(false);
      setSelectedRow(null);
      reset();
      navigate("/app/visitors/manage-visitors/external-clients");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to repeat client.");
    } finally {
      setIsSubmittingRepeatClient(false);
    }
  };

  const columns = useMemo(
    () => [
      { field: "srNo", headerName: "Sr No" },
      { field: "visitorName", headerName: "Visitor Name", flex: 1 },
      { field: "company", headerName: "Company", flex: 1 },
      {
        field: "action",
        headerName: "Action",
        cellRenderer: (params) => (
          <ThreeDotMenu
            menuItems={[
              {
                label: "Repeat Client",
                onClick: () => openRepeatClientModal(params.data),
              },
            ]}
          />
        ),
      },
    ],
    [openRepeatClientModal],
  );

  return (
    <div className="p-4">
      <PageFrame>
        {loading ? (
          <div className="flex justify-center p-8">
            <CircularProgress />
          </div>
        ) : (
          <AgTable
            search
            tableTitle="REPEAT EXTERNAL COMPANIES"
            data={tableData}
            columns={columns}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            paginationPageSize={pagination.limit}
            isPagination={true}
            serverPagination
            paginationPage={pagination.page}
            paginationTotal={pagination.total}
            onPaginationPageChange={(page) =>
              setPagination((current) => ({ ...current, page }))
            }
            onPaginationPageSizeChange={(limit) =>
              setPagination((current) =>
                current.limit === limit
                  ? current
                  : { ...current, page: 1, limit },
              )
            }
            serverSearch
            searchValue={companySearch}
            onSearchChange={handleCompanySearchChange}
          />
        )}
      </PageFrame>

      <MuiModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedRow(null);
        }}
        title="Repeat Client"
      >
        <form
          className="grid grid-cols-1 gap-4"
          onSubmit={handleSubmit(handleRepeatClientSubmit)}
        >
          <Controller
            name="visitorName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Visitor Name"
                size="small"
                disabled
              />
            )}
          />

          <Controller
            name="company"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Company" size="small" disabled />
            )}
          />

          <Controller
            name="purposeOfVisit"
            control={control}
            rules={{ required: "Purpose of Visit is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Purpose of Visit"
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="Full Day Pass">Full Day Pass</MenuItem>
                <MenuItem value="Half Day Pass">Half Day Pass</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="location"
            control={control}
            rules={{ required: "Location is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Location"
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="">Select Location</MenuItem>
                {auth?.user?.company?.workLocations?.length > 0 ? (
                  auth.user.company.workLocations.map((loc) => (
                    <MenuItem key={loc._id} value={loc._id}>
                      {loc.buildingName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No Locations Available</MenuItem>
                )}
              </TextField>
            )}
          />

          <Controller
            name="unit"
            control={control}
            rules={{ required: "Unit is required" }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Select Unit"
                size="small"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="">Select Unit</MenuItem>
                {unitsData
                  .filter((item) => item?.building?._id === watchLocation)
                  .map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.unitNo || item.name || "Unit"}
                    </MenuItem>
                  ))}
              </TextField>
            )}
          />

          <Controller
            name="dateOfVisit"
            control={control}
            rules={{ required: "Date of Visit is required" }}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Date of Visit"
                value={field.value}
                format="DD-MM-YYYY"
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />

          <Controller
            name="checkInTime"
            control={control}
            rules={{ required: "Check-In Time is required" }}
            render={({ field, fieldState }) => (
              <TimePicker
                label="Check-In Time"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />

          <Controller
            name="checkOutTime"
            control={control}
            // rules={{ required: "Check-Out Time is required" }}
            render={({ field, fieldState }) => (
              <TimePicker
                label="Check-Out Time"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />

          <PrimaryButton
            title={isSubmittingRepeatClient ? "Submitting..." : "Submit"}
            type="submit"
            disabled={isSubmittingRepeatClient}
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default RepeatExternalCompaanies;
