import { useMemo, useState } from "react";
import { MenuItem, Tab, Tabs, TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import WidgetTable from "../../../components/Tables/WidgetTable";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import PrimaryButton from "../../../components/PrimaryButton";
import UploadMultipleFilesInput from "../../../components/UploadMultipleFilesInput";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useSearchParams } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import { MdHistory } from "react-icons/md";
import SalesEditHistory from "./SalesEditHistory";
import { isLinkedInProfileUrl } from "../../../utils/validators";

const submissionTabs = [
  { kind: "partnership", label: "Partnership" },
  { kind: "startup", label: "Startup" },
  { kind: "subscription", label: "Subscription" },
  { kind: "contact", label: "Contact" },
];

const partnershipFields = [
  ["name", "Name"],
  ["email", "Email"],
  ["mobile", "Mobile"],
  ["sourceCompany", "Source Company"],
  ["message", "Message"],
  ["status", "Status"],
  ["createdAt", "Submitted At"],
];

const WEBSITE_EDIT_FIELDS = {
  partnership: ["name", "email", "mobile", "message", "status"],
  startup: ["name", "email", "phone", "startupName", "websiteUrl", "linkedinProfileUrl", "message", "status"],
  subscription: ["email", "status"],
  contact: ["name", "email", "phone", "subject", "message", "status"],
};
const isWebsiteRow = (row) => Boolean(
  row?.id && !row._id && /^[a-f\d]{24}$/i.test(row.id),
);

const mewoFields = {
  startup: [
    ["name", "Name"], ["startupName", "Startup Name"],
    ["email", "Email"], ["sourceCompany", "Source Company"],
    ["phone", "Phone"], ["websiteUrl", "Website URL"],
    ["linkedinProfileUrl", "LinkedIn Profile"], ["presentation", "Presentation"],
    ["message", "Message"], ["status", "Status"], ["createdAt", "Submitted At"],
  ],
  subscription: [
    ["email", "Email"], ["status", "Status"],
    ["createdAt", "Submitted At"], ["sourceCompany", "Source Company"],
  ],
  contact: [
    ["name", "Name"], ["email", "Email"], ["phone", "Phone"],
    ["sourceCompany", "Source Company"],
    ["subject", "Subject"], ["message", "Message"],
    ["status", "Status"], ["createdAt", "Submitted At"],
  ],
};
const startupTableFields = mewoFields.startup.filter(
  ([field]) => !["websiteUrl", "linkedinProfileUrl", "presentation", "message"].includes(field),
);
const contactTableFields = mewoFields.contact.filter(
  ([field]) => !["subject", "message"].includes(field),
);
const partnershipTableFields = partnershipFields.filter(
  ([field]) => field !== "message",
);
const dateFields = new Set(["createdAt", "updatedAt"]);
const safeExternalUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
const formatValue = (field, value) => {
  if (field === "presentation") return value?.filename || "—";
  if (value === null || value === undefined || value === "") return "—";
  if (field === "hasResume") return value ? "Yes" : "No";
  if (dateFields.has(field)) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("DD-MM-YYYY, hh:mm A") : String(value);
  }
  return String(value);
};

const formatEnquiryExportCell = (params) => {
  const field = params.column?.getColDef()?.field || "";
  const value = params.value;
  if ((field === "phone" || field === "mobile") && value != null && value !== "") {
    const phone = String(value).trim();
    // Only digits and an optional country-code prefix enter this Excel text formula.
    if (/^\+?\d+$/.test(phone)) return `="${phone}"`;
  }
  return field === "srNo" ? value : formatValue(field, value);
};

const blankPartner = {
  name: "", email: "", mobile: "", phone: "", subject: "", message: "",
  startupName: "", websiteUrl: "", linkedinProfileUrl: "", presentation: null, status: "",
};
const MESSAGE_LIMIT = 500;
const PARTNERSHIP_STATUSES = ["Pending", "Follow Up", "Converted", "Not Proceeding"];
const normalizePhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
};
const validatePartnerForm = (form, kind, existingRows, editingRow = null) => {
  const errors = {};
  if (editingRow && !PARTNERSHIP_STATUSES.includes(form.status)) {
    errors.status = "Select a status.";
  }
  if (kind !== "subscription" && !form.name.trim()) errors.name = "Name is required.";
  const email = form.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) errors.email = "Enter a valid email address.";
  if (kind === "partnership" && !/^\d{10}$/.test(form.mobile.trim())) errors.mobile = "Enter a 10-digit mobile number.";
  if (kind !== "partnership" && form.phone.trim() && !/^(?:\+91|0)?\d{10}$/.test(form.phone.trim())) errors.phone = "Enter a 10-digit phone number (optional 0 or +91 prefix).";
  if (kind === "contact" && !form.subject.trim()) errors.subject = "Subject is required.";
  if (kind === "startup" && !form.startupName.trim()) errors.startupName = "Startup name is required.";
  if (kind === "startup" && form.websiteUrl.trim()) {
    try { if (!["http:", "https:"].includes(new URL(form.websiteUrl.trim()).protocol)) throw new Error(); }
    catch { errors.websiteUrl = "Enter a valid URL, including https://."; }
  }
  if (kind === "startup" && form.linkedinProfileUrl.trim() && !isLinkedInProfileUrl(form.linkedinProfileUrl.trim())) {
    errors.linkedinProfileUrl = "Enter a LinkedIn profile or company URL.";
  }
  if (kind !== "subscription" && !form.message.trim()) errors.message = "Message is required.";
  else if (form.message.trim().length > MESSAGE_LIMIT) errors.message = `Keep the message within ${MESSAGE_LIMIT} characters.`;
  if (kind === "startup" && form.presentation instanceof File && (form.presentation.size > 10 * 1024 * 1024 || ![
    "application/pdf", "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ].includes(form.presentation.type))) errors.presentation = "Use a PDF or PowerPoint file up to 10 MB.";
  const emailChanged = !editingRow || String(editingRow.email || "").trim().toLowerCase() !== email;
  if (emailChanged && !errors.email && existingRows.some((row) => String(row.email || "").trim().toLowerCase() === email)) {
    errors.email = "Email already exists.";
  }
  const phoneField = kind === "partnership" ? "mobile" : "phone";
  const phone = normalizePhone(form[phoneField]);
  const phoneChanged = !editingRow || normalizePhone(editingRow[phoneField]) !== phone;
  if (phoneChanged && phone && !errors[phoneField] && existingRows.some((row) =>
    normalizePhone(row.phone || row.mobile) === phone)) {
    errors[phoneField] = "Phone number already exists.";
  }
  if (isWebsiteRow(editingRow)) {
    return Object.fromEntries(Object.entries(errors).filter(([field]) =>
      String(form[field] ?? "").trim() !== String(editingRow[field] ?? "").trim(),
    ));
  }
  return errors;
};

const SalesPartners = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedKind = submissionTabs.find((tab) => tab.kind === searchParams.get("kind"))?.kind || "partnership";
  const selectedLabel = submissionTabs.find((tab) => tab.kind === selectedKind).label;
  const [formOpen, setFormOpen] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [form, setForm] = useState(blankPartner);
  const [formErrors, setFormErrors] = useState({});
  const [editingRow, setEditingRow] = useState(null);
  const [historyRow, setHistoryRow] = useState(null);

  const { data: localPartners = [], isPending: localPending } = useQuery({
    queryKey: ["salesPartnersLocal", selectedKind],
    queryFn: async () => (await axios.get("/api/sales/partnership", { params: { kind: selectedKind } })).data,
  });
  const {
    data: websitePartners,
    isPending: websitePending,
    isError: websiteError,
    error: websiteRequestError,
  } = useQuery({
    queryKey: ["salesPartnersWebsite", selectedKind],
    queryFn: async () => (await axios.get("/api/sales/partnership/website", { params: { kind: selectedKind } })).data,
    retry: false,
  });

  const rows = useMemo(() => {
    const localRows = localPartners.map((partner) => ({
      ...partner,
      id: String(partner._id),
      source: partner.source || "local",
      sourceCompany: partner.sourceCompany || "Local",
    }));
    return [...localRows, ...(websitePartners?.data || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );
  }, [localPartners, websitePartners?.data]);

  const historySource = historyRow?._id ? "local" : "website";
  const { data: editHistory = [], isPending: historyPending, isError: historyError } = useQuery({
    queryKey: ["enquiryEditHistory", historySource, historyRow?.id],
    queryFn: async () => (await axios.get(`/api/sales/partnership/history/${historySource}/${historyRow.id}`, {
      params: historySource === "website" ? { kind: historyRow.kind || historyRow.source || selectedKind } : undefined,
    })).data,
    enabled: Boolean(historyRow),
    retry: false,
  });
  const closeHistory = () => {
    setHistoryRow(null);
  };

  const savePartner = useMutation({
    mutationFn: async (values) => (await axios.post("/api/sales/partnership", values)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesPartnersLocal", selectedKind] });
      setForm(blankPartner);
      setFormErrors({});
      setFormOpen(false);
      toast.success(`${selectedLabel} added successfully`);
    },
    onError: (error) => {
      const field = error?.response?.data?.field;
      const message = error?.response?.data?.message || "Could not add enquiry";
      if (["email", "phone", "mobile", "linkedinProfileUrl"].includes(field)) {
        setFormErrors((previous) => ({ ...previous, [field]: message }));
      } else {
        toast.error(message);
      }
    },
  });

  const editPartner = useMutation({
    mutationFn: async ({ id, values }) => (await axios.patch(`/api/sales/partnership/${id}`, values)).data,
    onSuccess: (submission) => {
      queryClient.invalidateQueries({ queryKey: ["salesPartnersLocal", submission.kind] });
      queryClient.invalidateQueries({ queryKey: ["enquiryEditHistory", "local", String(submission._id)] });
      setFormOpen(false);
      setEditingRow(null);
      setForm(blankPartner);
      setFormErrors({});
      toast.success("Enquiry updated");
    },
    onError: (error) => {
      const field = error?.response?.data?.field;
      const message = error?.response?.data?.message || "Could not update enquiry";
      if (["name", "email", "mobile", "phone", "subject", "startupName", "websiteUrl", "linkedinProfileUrl", "presentation", "message", "status"].includes(field)) {
        setFormErrors((previous) => ({ ...previous, [field]: message }));
      } else {
        toast.error(message);
      }
    },
  });

  const editWebsitePartner = useMutation({
    mutationFn: async ({ id, changes }) => (await axios.patch(`/api/sales/partnership/website/${id}`, changes)).data,
    onSuccess: (_submission, variables) => {
      queryClient.invalidateQueries({ queryKey: ["salesPartnersWebsite", "partnership"] });
      queryClient.invalidateQueries({ queryKey: ["enquiryEditHistory", "website", variables.id] });
      setFormOpen(false);
      setEditingRow(null);
      setForm(blankPartner);
      setFormErrors({});
      toast.success("Website enquiry updated");
    },
    onError: (error) => {
      const field = error?.response?.data?.field;
      const message = error?.response?.data?.message || "Could not update website enquiry";
      if (["name", "email", "mobile", "message", "status"].includes(field)) {
        setFormErrors((previous) => ({ ...previous, [field]: message }));
      } else {
        toast.error(message);
      }
    },
  });

  const editWebsiteSubmission = useMutation({
    mutationFn: async ({ kind, id, changes }) =>
      (await axios.patch(`/api/sales/partnership/website/${kind}/${id}`, changes)).data,
    onSuccess: (_submission, variables) => {
      queryClient.invalidateQueries({ queryKey: ["salesPartnersWebsite", variables.kind] });
      queryClient.invalidateQueries({ queryKey: ["enquiryEditHistory", "website", variables.id] });
      setFormOpen(false);
      setEditingRow(null);
      setForm(blankPartner);
      setFormErrors({});
      toast.success("Website enquiry updated");
    },
    onError: (error) => {
      const field = error?.response?.data?.field;
      const message = error?.response?.data?.message || "Could not update website enquiry";
      if (["name", "email", "phone", "startupName", "websiteUrl", "linkedinProfileUrl", "subject", "message", "status"].includes(field)) {
        setFormErrors((previous) => ({ ...previous, [field]: message }));
      } else {
        toast.error(message);
      }
    },
  });

  const openEditForm = (row) => {
    if (!row?._id && !isWebsiteRow(row)) return;
    setEditingRow(row);
    setForm({
      ...blankPartner,
      name: row.name || "", email: row.email || "", mobile: row.mobile || "", phone: row.phone || "",
      subject: row.subject || "", startupName: row.startupName || "", websiteUrl: row.websiteUrl || "",
      linkedinProfileUrl: row.linkedinProfileUrl || "", message: row.message || "",
      presentation: row.presentation?.url ? { ...row.presentation, name: row.presentation.filename } : null,
      status: PARTNERSHIP_STATUSES.includes(row.status) ? row.status : "",
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const fields = selectedKind === "partnership" ? partnershipFields : mewoFields[selectedKind];
  const tableFields = selectedKind === "startup" ? startupTableFields
    : selectedKind === "contact" ? contactTableFields
      : selectedKind === "partnership" ? partnershipTableFields : fields;
  const columns = useMemo(() => [
    { field: "srNo", headerName: "Sr No", width: 90 },
    ...tableFields.map(([field, headerName]) => ({
      field,
      headerName,
      flex: 1,
      minWidth: field === "createdAt" ? 190 : 140,
      valueFormatter: (params) => formatValue(field, params.value),
      cellRenderer: (params) => {
        const value = formatValue(field, params.value);
        return (
          <span className="block w-full truncate" title={value.length > 15 ? value : undefined}>
            {value}
          </span>
        );
      },
    })),
    ...fields.filter(([field]) => !tableFields.some(([visibleField]) => visibleField === field))
      .map(([field, headerName]) => ({
        field,
        headerName,
        hide: true,
        valueFormatter: (params) => formatValue(field, params.value),
      })),
    {
      field: "actions",
      headerName: "Actions",
      width: 105,
      pinned: "right",
      sortable: false,
      filter: false,
      suppressCsvExport: true,
      cellRenderer: (params) => {
        const viewButton = (
          <button
            type="button"
            aria-label="View details"
            title="View details"
            className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
            onClick={() => setViewRow(params.data)}
          >
            <MdOutlineRemoveRedEye size={20} />
          </button>
        );
        if (selectedKind === "subscription") return viewButton;
        const canEdit = Boolean(params.data?._id || isWebsiteRow(params.data));
        return (
          <div className="flex h-full items-center gap-1">
            {viewButton}
            {canEdit && (
              <button
                type="button"
                aria-label="View edit history"
                title="View Edit History"
                className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
                onClick={() => setHistoryRow(params.data)}
              >
                <MdHistory size={21} />
              </button>
            )}
            <button
              type="button"
              aria-label="Edit enquiry"
              title={canEdit ? "Edit enquiry" : "Website edit API is not available"}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canEdit}
              onClick={() => openEditForm(params.data)}
            >
              <HiPencilSquare size={24} />
            </button>
          </div>
        );
      },
    },
  ], [fields, tableFields, selectedKind]);

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
    setFormErrors((previous) => ({ ...previous, [field]: undefined }));
  };
  const submit = (event) => {
    event.preventDefault();
    const errors = validatePartnerForm(
      form,
      selectedKind,
      editingRow ? rows.filter((row) => row.id !== editingRow.id) : rows,
      editingRow,
    );
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    const payload = new FormData();
    payload.append("kind", selectedKind);
    const formFields = selectedKind === "partnership"
      ? ["name", "email", "mobile", "message"]
      : selectedKind === "startup"
        ? ["name", "email", "phone", "startupName", "websiteUrl", "linkedinProfileUrl", "message"]
        : selectedKind === "contact"
          ? ["name", "email", "phone", "subject", "message"]
          : ["email"];
    if (isWebsiteRow(editingRow)) {
      const kind = String(editingRow.kind || editingRow.source || selectedKind).toLowerCase();
      const changes = Object.fromEntries(
        (WEBSITE_EDIT_FIELDS[kind] || [])
          .filter((field) => field in form
            && String(form[field] ?? "").trim() !== String(editingRow[field] ?? "").trim())
          .map((field) => [field, String(form[field] ?? "").trim()]),
      );
      if (!Object.keys(changes).length) {
        setFormOpen(false);
        setEditingRow(null);
        return;
      }
      if (kind === "partnership") {
        editWebsitePartner.mutate({ id: editingRow.id, changes });
      } else {
        editWebsiteSubmission.mutate({ kind, id: editingRow.id, changes });
      }
      return;
    }
    formFields.forEach((field) => payload.append(field, form[field].trim()));
    if (selectedKind === "startup" && form.presentation instanceof File) payload.append("presentation", form.presentation);
    if (editingRow) {
      if (selectedKind === "startup" && editingRow.presentation?.key && !form.presentation) payload.append("removePresentation", "true");
      payload.append("status", form.status);
      editPartner.mutate({ id: editingRow._id, values: payload });
      return;
    }
    savePartner.mutate(payload);
  };

  return (
    <div className="p-4">
      <Tabs
        value={selectedKind}
        onChange={(_, kind) => {
          setViewRow(null);
          closeHistory();
          setFormOpen(false);
          setEditingRow(null);
          setForm(blankPartner);
          setFormErrors({});
          setSearchParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set("kind", kind);
            return next;
          });
        }}
        variant="scrollable"
        scrollButtons="auto"
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          mb: 2,
          border: "1px solid #d1d5db",
          borderRadius: 2,
          "& .MuiTab-root": {
            flex: 1,
            fontSize: "1rem",
            fontWeight: 500,
            padding: "12px 16px",
            textTransform: "none",
            color: "#1E3D73",
            borderRight: "1px solid #d1d5db",
          },
          "& .MuiTab-root:last-of-type": { borderRight: 0 },
          "& .Mui-selected": { backgroundColor: "#1E3D73", color: "white !important" },
        }}
      >
        {submissionTabs.map((tab) => <Tab key={tab.kind} value={tab.kind} label={tab.label} />)}
      </Tabs>
      {websiteError && (
        <p role="alert" className="mb-3 text-red-600">
          {websiteRequestError?.response?.data?.message || "Unable to load website submissions."} Local entries remain available.
        </p>
      )}
      {(websitePartners?.pagination?.filteredTotal ?? 0) > (websitePartners?.data?.length ?? 0) && (
        <p className="mb-3 text-sm text-gray-600">
          Showing the first {websitePartners.data.length} website submissions. More pages require additional API query parameters.
        </p>
      )}
      <WidgetTable
        tableTitle={selectedLabel}
        titleAmountOverride=""
        data={rows}
        columns={columns}
        search
        dateColumn="createdAt"
        exportData
        processExportCell={formatEnquiryExportCell}
        buttonTitle={`Add ${selectedLabel}`}
        handleSubmit={() => {
          setEditingRow(null);
          setForm(blankPartner);
          setFormErrors({});
          setFormOpen(true);
        }}
        loading={localPending || websitePending}
        tableHeight={450}
      />

      <MuiModal open={formOpen} onClose={() => { setFormOpen(false); setEditingRow(null); }} title={`${editingRow ? "Edit" : "Add"} ${selectedLabel}`} widthClass="w-4/5 lg:w-2/5">
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          {selectedKind !== "subscription" && <TextField label="Name" value={form.name} onChange={updateField("name")} required size="small" error={Boolean(formErrors.name)} helperText={formErrors.name} />}
          {selectedKind === "startup" && <TextField label="Startup Name" value={form.startupName} onChange={updateField("startupName")} required size="small" error={Boolean(formErrors.startupName)} helperText={formErrors.startupName} />}
          <TextField label="Email" type="email" value={form.email} onChange={updateField("email")} required size="small" error={Boolean(formErrors.email)} helperText={formErrors.email} />
          {selectedKind === "partnership" && <TextField label="Mobile" type="tel" value={form.mobile} onChange={updateField("mobile")} required size="small" error={Boolean(formErrors.mobile)} helperText={formErrors.mobile} slotProps={{ htmlInput: { maxLength: 10, inputMode: "numeric" } }} />}
          {(selectedKind === "startup" || selectedKind === "contact") && <TextField label="Phone" type="tel" value={form.phone} onChange={updateField("phone")} size="small" error={Boolean(formErrors.phone)} helperText={formErrors.phone} slotProps={{ htmlInput: { maxLength: 13, inputMode: "tel" } }} />}
          {selectedKind === "contact" && <TextField label="Subject" value={form.subject} onChange={updateField("subject")} required size="small" error={Boolean(formErrors.subject)} helperText={formErrors.subject} />}
          {selectedKind === "startup" && <>
            <TextField label="Website URL" value={form.websiteUrl} onChange={updateField("websiteUrl")} size="small" error={Boolean(formErrors.websiteUrl)} helperText={formErrors.websiteUrl} />
            <TextField label="LinkedIn Profile URL" value={form.linkedinProfileUrl} onChange={updateField("linkedinProfileUrl")} size="small" error={Boolean(formErrors.linkedinProfileUrl)} helperText={formErrors.linkedinProfileUrl} />
            {!isWebsiteRow(editingRow) && <div>
              <UploadMultipleFilesInput
                id="startup-presentation"
                label="Upload Files"
                value={form.presentation ? [form.presentation] : []}
                onChange={(files) => {
                  setForm((previous) => ({ ...previous, presentation: files[0] || null }));
                  setFormErrors((previous) => ({ ...previous, presentation: undefined }));
                }}
                allowedExtensions={["pdf", "ppt", "pptx"]}
                maxFiles={1}
                maxSizeMb={10}
                showMaxInLabel={false}
                displayCount
                showPreviews={false}
                showClearAll={false}
                helperText={formErrors.presentation || "Maximum 1 file, 10 MB. PDF or PowerPoint."}
              />
            </div>}
          </>}
          {selectedKind !== "subscription" && <TextField label="Message" value={form.message} onChange={updateField("message")} multiline minRows={3} required size="small" error={Boolean(formErrors.message)} helperText={formErrors.message || `${form.message.length}/${MESSAGE_LIMIT} characters`} slotProps={{ htmlInput: { maxLength: MESSAGE_LIMIT } }} />}
          {editingRow && (
            <TextField select label="Status" value={form.status} onChange={updateField("status")} required size="small" error={Boolean(formErrors.status)} helperText={formErrors.status}>
              <MenuItem value="" disabled>Select status</MenuItem>
              {PARTNERSHIP_STATUSES.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>
          )}
          <div className="flex justify-end gap-3">
            <PrimaryButton title="Cancel" type="button" handleSubmit={() => { setFormOpen(false); setEditingRow(null); }} />
            <PrimaryButton title={editingRow ? "Save Changes" : `Add ${selectedLabel}`} type="submit" isLoading={savePartner.isPending || editPartner.isPending || editWebsitePartner.isPending || editWebsiteSubmission.isPending} />
          </div>
        </form>
      </MuiModal>

      <MuiModal open={Boolean(viewRow)} onClose={() => setViewRow(null)} title={`${selectedLabel} Details`} widthClass="w-4/5 lg:w-2/5">
        <div className="flex flex-col gap-3">
          {fields.map(([field, label]) => (
            <DetalisFormatted key={field} title={label} detail={selectedKind === "startup"
              && ["websiteUrl", "linkedinProfileUrl"].includes(field)
              && safeExternalUrl(viewRow?.[field])
              ? <a href={safeExternalUrl(viewRow[field])} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{viewRow[field]}</a>
              : field === "presentation" && viewRow?.presentation?.url
                ? <a href={viewRow.presentation.url} target="_blank" rel="noreferrer" className="text-primary underline">{viewRow.presentation.filename}</a>
                : formatValue(field, viewRow?.[field])} />
          ))}
        </div>
      </MuiModal>

      {historyRow && <SalesEditHistory
        title={`${selectedLabel} Edit History`}
        editHistory={editHistory}
        historyPending={historyPending}
        historyError={historyError}
        onClose={closeHistory}
      />}
    </div>
  );
};

export default SalesPartners;
