import { useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import MuiModal from "../../../components/MuiModal";
import PrimaryButton from "../../../components/PrimaryButton";

import { LEAD_STATUSES } from "./leadStatuses";
const fields = [
  { name: "name", label: "Name", maxLength: 200 },
  { name: "email", label: "Email", maxLength: 254, type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "status", label: "Lead Status" },
];

export default function WebsiteLeadEditForm({ lead, onClose, onSave, saving, serverErrors }) {
  const initial = {
    name: lead.pocName ?? "", email: lead.emailAddress ?? "",
    phone: lead.contactNumber ?? "", status: lead.leadStatus ?? "",
  };
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  function submit(event) {
    event.preventDefault();
    const changes = Object.fromEntries(Object.entries(form)
      .map(([field, value]) => [field, String(value).trim()])
      .filter(([field, value]) => value !== String(initial[field]).trim()));
    if (!Object.keys(changes).length) return onClose();

    const nextErrors = {};
    if ("name" in changes && (!changes.name || changes.name.length > 200)) nextErrors.name = "Enter a name within 200 characters.";
    if ("email" in changes && (changes.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(changes.email))) nextErrors.email = "Enter a valid email address.";
    if ("phone" in changes && !/^[1-9]\d{9}$/.test(changes.phone)) {
      nextErrors.phone = "Enter a valid 10-digit mobile number.";
    }
    if ("status" in changes && !LEAD_STATUSES.includes(changes.status)) nextErrors.status = "Select a lead status.";
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) onSave(changes);
  }

  return (
    <MuiModal open onClose={saving ? () => {} : onClose} title="Edit Website Lead" widthClass="w-4/5 lg:w-2/5">
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        {fields.map(({ name, label, type, maxLength }) => {
          const error = errors[name] || serverErrors[name];
          const select = name === "status";
          return (
            <TextField key={name} label={label} size="small" type={type} select={select}
              value={select && !LEAD_STATUSES.includes(form.status) ? "" : form[name]}
              error={Boolean(error)} helperText={error} disabled={saving}
              slotProps={{ htmlInput: { maxLength: name === "phone" ? 10 : maxLength } }}
              onChange={(event) => {
                setForm((previous) => ({ ...previous, [name]: event.target.value }));
                setErrors((previous) => ({ ...previous, [name]: "" }));
              }}>
              {select && LEAD_STATUSES.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
            </TextField>
          );
        })}
        <div className="flex justify-end gap-3">
          <PrimaryButton title="Cancel" type="button" handleSubmit={onClose} disabled={saving} />
          <PrimaryButton title="Save Changes" type="submit" isLoading={saving} disabled={saving} />
        </div>
      </form>
    </MuiModal>
  );
}
