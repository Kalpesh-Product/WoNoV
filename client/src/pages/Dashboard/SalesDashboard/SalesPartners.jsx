import { useMemo, useState } from "react";
import { TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import WidgetTable from "../../../components/Tables/WidgetTable";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import PrimaryButton from "../../../components/PrimaryButton";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const partnerFields = [
  ["id", "ID"],
  ["kind", "Type"],
  ["source", "Source Page"],
  ["status", "Status"],
  ["createdAt", "Submitted At"],
  ["updatedAt", "Updated At"],
  ["name", "Name"],
  ["email", "Email"],
  ["mobile", "Mobile"],
  ["count", "People Count"],
  ["sdate", "Preferred Start Date"],
  ["pagename", "Product / Form"],
  ["category", "Category"],
  ["dob", "Date of Birth"],
  ["location", "Location"],
  ["experience", "Experience (Years)"],
  ["linkedin", "LinkedIn"],
  ["currentmonthlysalary", "Current Monthly Salary"],
  ["expectedsalary", "Expected Salary"],
  ["canjoin", "Joining Availability"],
  ["relocategoa", "Relocate to Goa"],
  ["personality", "Personality"],
  ["skills", "Skills"],
  ["specialexperience", "Relevant Experience"],
  ["willing", "Startup Willingness"],
  ["message", "Message"],
  ["job_position", "Job Position"],
  ["notificationStatus", "Notification Status"],
  ["hasResume", "Has Resume"],
  ["resumeFilename", "Resume Filename"],
];

const visibleFields = new Set([
  "name", "email", "mobile", "message", "source", "pagename", "status", "createdAt",
]);
const dateFields = new Set(["createdAt", "updatedAt", "sdate", "dob"]);
const formatValue = (field, value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "hasResume") return value ? "Yes" : "No";
  if (dateFields.has(field)) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format(field.endsWith("At") ? "DD-MM-YYYY hh:mm A" : "DD-MM-YYYY") : String(value);
  }
  return String(value);
};

const blankPartner = { name: "", email: "", mobile: "", message: "" };

const SalesPartners = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [form, setForm] = useState(blankPartner);

  const { data: localPartners = [], isPending: localPending } = useQuery({
    queryKey: ["salesPartnersLocal"],
    queryFn: async () => (await axios.get("/api/sales/partners")).data,
  });
  const {
    data: websitePartners,
    isPending: websitePending,
    isError: websiteError,
    error: websiteRequestError,
  } = useQuery({
    queryKey: ["salesPartnersWebsite"],
    queryFn: async () => (await axios.get("/api/sales/partners/website")).data,
    retry: false,
  });

  const rows = useMemo(() => {
    const localRows = localPartners.map((partner) => ({
      ...partner,
      id: String(partner._id),
      source: partner.source || "local",
    }));
    return [...localRows, ...(websitePartners?.data || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }, [localPartners, websitePartners?.data]);

  const savePartner = useMutation({
    mutationFn: async (values) => (await axios.post("/api/sales/partners", values)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesPartnersLocal"] });
      setForm(blankPartner);
      setFormOpen(false);
      toast.success("Partner added successfully");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Could not add partner"),
  });

  const columns = useMemo(() => [
    { field: "srNo", headerName: "Sr No", width: 90 },
    ...partnerFields.map(([field, headerName]) => ({
      field,
      headerName,
      flex: visibleFields.has(field) ? 1 : undefined,
      minWidth: visibleFields.has(field) ? 140 : undefined,
      hide: !visibleFields.has(field),
      valueFormatter: (params) => formatValue(field, params.value),
    })),
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      pinned: "right",
      sortable: false,
      filter: false,
      suppressCsvExport: true,
      cellRenderer: (params) => (
        <button type="button" className="text-primary underline" onClick={() => setViewRow(params.data)}>
          View
        </button>
      ),
    },
  ], []);

  const updateField = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    savePartner.mutate(form);
  };

  return (
    <div className="p-4">
      {websiteError && (
        <p role="alert" className="mb-3 text-red-600">
          {websiteRequestError?.response?.data?.message || "Unable to load website partners."} Local partners remain available.
        </p>
      )}
      {(websitePartners?.pagination?.filteredTotal ?? 0) > (websitePartners?.data?.length ?? 0) && (
        <p className="mb-3 text-sm text-gray-600">
          Showing the first {websitePartners.data.length} website partners. More pages require additional API query parameters.
        </p>
      )}
      <WidgetTable
        tableTitle="Partners"
        titleAmountOverride={`TOTAL : ${rows.length}`}
        data={rows}
        columns={columns}
        search
        buttonTitle="Add Partner"
        handleSubmit={() => setFormOpen(true)}
        loading={localPending || websitePending}
        tableHeight={450}
      />

      <MuiModal open={formOpen} onClose={() => setFormOpen(false)} title="Add Partner" widthClass="w-4/5 lg:w-2/5">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <TextField label="Name" value={form.name} onChange={updateField("name")} required size="small" />
          <TextField label="Email" type="email" value={form.email} onChange={updateField("email")} required size="small" />
          <TextField label="Mobile" value={form.mobile} onChange={updateField("mobile")} size="small" />
          <TextField label="Message" value={form.message} onChange={updateField("message")} multiline minRows={3} size="small" />
          <div className="flex justify-end gap-3">
            <PrimaryButton title="Cancel" type="button" handleSubmit={() => setFormOpen(false)} />
            <PrimaryButton title="Add Partner" type="submit" isLoading={savePartner.isPending} />
          </div>
        </form>
      </MuiModal>

      <MuiModal open={Boolean(viewRow)} onClose={() => setViewRow(null)} title="Partner Details" widthClass="w-4/5 lg:w-2/5">
        <div className="flex flex-col gap-3">
          {partnerFields.map(([field, label]) => (
            <DetalisFormatted key={field} title={label} detail={formatValue(field, viewRow?.[field])} />
          ))}
        </div>
      </MuiModal>
    </div>
  );
};

export default SalesPartners;
