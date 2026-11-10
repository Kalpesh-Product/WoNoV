/* eslint-disable react-refresh/only-export-components */
import DetalisFormatted from "../../components/DetalisFormatted";
import humanDate from "../../utils/humanDateForamt";
import { inrFormat } from "../../utils/currencyFormat";

const text = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  return typeof value === "string" || typeof value === "number" ? String(value) : "N/A";
};
const name = (value, ...keys) => {
  if (typeof value === "string") return text(value);
  for (const key of keys) {
    if (value?.[key]) return text(value[key]);
  }
  return "N/A";
};
const person = (value) => {
  if (typeof value === "string") return text(value);
  return text([value?.firstName, value?.lastName].filter(Boolean).join(" "));
};
const yesNo = (value) => value === undefined || value === null ? "N/A" : value ? "Yes" : "No";
const date = (value) => value ? humanDate(value) : "N/A";
const dateTime = (value) => value && !Number.isNaN(new Date(value).getTime())
  ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
  : "N/A";
const money = (value) => value === undefined || value === null ? "N/A" : `INR ${inrFormat(value)}`;

// A row can be an Asset, a flattened table row, or an AssignAsset with a populated asset.
export const getAssetDetails = (row, { assignment = false, deletion = false } = {}) => {
  const asset = row?.asset && typeof row.asset === "object" ? row.asset : row || {};
  const assignmentRecord = assignment
    ? (row?.asset ? row : asset.assignedAsset || null)
    : asset.assignedAsset;
  const revocationRecord = row?.asset
    ? assignmentRecord
    : asset.latestRevocation || assignmentRecord;
  const assetLocation = row?.assetLocation || asset.location;
  const assignedLocation = row?.assignedLocation || assignmentRecord?.location;
  const category = row?.category && row.category !== "N/A"
    ? row.category : asset.Category || asset.category || asset.subCategory?.category;
  const subCategory = row?.subCategoryName || row?.subCategory || asset.subCategory;
  const vendor = asset.vendor;

  const fields = {
    "Asset ID": text(row?.assetNumber || asset.assetId),
    "Secondary ID": text(asset.secondaryId),
    "Department Asset ID": text(asset.departmentAssetId),
    "Asset Name": text(asset.name),
    "Serial Number": text(asset.serialNumber),
    "Description": text(asset.description),
    "Asset Type": text(asset.assetType),
    Brand: text(asset.brand),
    Department: name(row?.department || asset.department, "name"),
    Company: name(asset.company, "companyId", "name"),
    Vendor: name(vendor, "name", "vendorName", "companyName"),
    Category: name(category, "categoryName", "name"),
    "Sub Category": name(subCategory, "subCategoryName", "name"),
    Building: name(assetLocation?.building || row?.building, "buildingName", "name"),
    Unit: name(assetLocation?.unitNo || row?.unit, "unitNo", "unitName"),
    Quantity: text(asset.quantity ?? 1),
    "Ownership Type": text(asset.ownershipType),
    Tangible: yesNo(asset.tangable),
    "Rented Months": text(asset.rentedMonths),
    "Rental Expiry Date": date(asset.rentedExpirationDate),
    Price: money(asset.price),
    "Purchase Date": date(asset.purchaseDate),
    "Warranty (Months)": text(asset.warranty),
    "Warranty Expiry Date": date(asset.warrantyExpiryDate),
    [assignment ? "Asset Status" : "Status"]: text(asset.status),
    Damaged: yesNo(asset.isDamaged),
    "Under Maintenance": yesNo(asset.isUnderMaintenance),
    Extra: yesNo(asset.isExtra),
    Assigned: yesNo(asset.isAssigned),
    "Assignment State": text(asset.assignmentState),
    "Asset Image": text(asset.assetImage?.url),
    "Warranty Document": text(asset.warrantyDocument?.link),
    "Added At": dateTime(asset.createdAt),
    "Updated At": dateTime(asset.updatedAt),
  };

  if (assignment) {
    Object.assign(fields, {
      Assignee: person(assignmentRecord?.assignee),
      "From Department": name(assignmentRecord?.fromDepartment, "name"),
      "To Department": name(assignmentRecord?.toDepartment, "name"),
      "Assignment Status": text(assignmentRecord?.status),
      "Assigned By": person(assignmentRecord?.assignedBy),
      "Approved By": person(assignmentRecord?.approvedBy),
      "Rejected By": person(assignmentRecord?.rejectededBy),
      "Assigned At": dateTime(assignmentRecord?.createdAt),
      "Approved/Rejected At": dateTime(assignmentRecord?.updatedAt),
      "Assigned Building": name(assignedLocation?.building || row?.assignedBuilding, "buildingName", "name"),
      "Assigned Unit": name(assignedLocation?.unitNo || row?.assignedUnit, "unitNo", "unitName"),
      Revoked: yesNo(revocationRecord?.isRevoked),
      "Revoked By": person(revocationRecord?.revokedBy),
      "Revoked At": dateTime(revocationRecord?.revokedAt),
    });
  }

  if (deletion) {
    Object.assign(fields, {
      Deleted: yesNo(asset.isDeleted),
      "Deleted At": dateTime(asset.deletedAt),
      "Deleted By": person(asset.deletedBy),
    });
  }
  return fields;
};

export const assetExportColumns = (columns, options) => {
  const existing = new Set(columns.map((column) => column.headerName?.trim().toLowerCase()));
  return [
    ...columns,
    ...Object.keys(getAssetDetails({}, options))
      .filter((label) => !existing.has(label.toLowerCase()))
      .map((label) => ({
        field: `assetExport_${label.replace(/\W+/g, "_")}`,
        headerName: label,
        hide: true,
      })),
  ];
};

export const assetExportValues = (row, options) => Object.fromEntries(
  Object.entries(getAssetDetails(row, options)).map(([label, value]) =>
    [`assetExport_${label.replace(/\W+/g, "_")}`, value === "N/A" ? "" : value],
  ),
);

const AssetDetailsView = ({ asset, assignment = false, deletion = false }) => (
  <div className="grid grid-cols-1 gap-4">
    {Object.entries(getAssetDetails(asset, { assignment, deletion })).map(([label, value]) => (
      <DetalisFormatted
        key={label}
        title={label}
        detail={value.startsWith?.("http") ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            {label}
          </a>
        ) : value}
      />
    ))}
  </div>
);

export default AssetDetailsView;
