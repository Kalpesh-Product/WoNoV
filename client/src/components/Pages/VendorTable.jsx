import React, { useState } from "react";
import PageFrame from "./PageFrame";
import MuiModal from "../MuiModal";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AgTable from "../AgTable";
import DetalisFormatted from "../DetalisFormatted";
import { useNavigate } from "react-router-dom";
import usePageDepartment from "../../hooks/usePageDepartment";
import { Chip } from "@mui/material";
import humanDate from "../../utils/humanDateForamt";

const VendorTable = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const department = usePageDepartment();
  const navigate = useNavigate();
  let departmentName = department?.name || "";

  if (department?.name === "Administration") {
    departmentName = "Admin";
  }
  if (department?.name === "Tech") {
    departmentName = "Frontend";
  }
  const axios = useAxiosPrivate();

  const {
    data,
    isPending: isVendorFetchingPending,
    error,
  } = useQuery({
    queryKey: ["vendors", department?._id],
    enabled: !!department?._id,
    queryFn: async function () {
      const response = await axios.get(
        `/api/vendors/get-vendors/${department._id}`
      );

      return response.data;
    },
  });

  const vendorColumns = [
    {
      headerName: "Sr No",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 80,
    },
    { field: "vendorID", headerName: "Vendor ID", width: 120 },
    {
      field: "vendorName",
      headerName: "Vendor Name",
      flex: 2,
      cellRenderer: (params) => {
        const isEmpty = params.value === "N/A";

        return !isEmpty ? (
          <span
            style={{
              color: "#1E3D73",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() =>
              navigate(
                `/app/dashboard/${departmentName}-dashboard/data/vendor/${params.data.vendorName}`,
                { state: params.data }
              )
            }
          >
            {params.value}
          </span>
        ) : (
          <span>{params.value}</span>
        );
      },
    },

    {
      field: "status",
      headerName: "Status",
      width: 130,
      cellRenderer: (params) => (
        <Chip
          label={params.value === "Inactive" ? "Inactive" : "Active"}
          color={params.value === "Inactive" ? "default" : "success"}
          size="small"
        />
      ),
    },
  ];

  const rows = isVendorFetchingPending
    ? []
    : data?.map((vendor, index) => ({
        id: index + 1,
        vendorMongoId: vendor._id,
        vendorID: vendor._id.slice(-4).toUpperCase(),
        vendorName: vendor.name
          ? vendor.name.includes("/")
            ? vendor.name.split("/").join("-")
            : vendor.name
          : "N/A",

        address: vendor.address,
        state: vendor.state,
        country: vendor.country,
        partyType: vendor?.partyType,
        status: vendor.status,
        departmentId: vendor.departmentId,
        company: vendor.company,
        email: vendor.email,
        mobile: vendor.mobile,
        companyName: vendor.companyName,
        onboardingDate: humanDate(vendor.onboardingDate),
        city: vendor.city,
        pinCode: vendor.pinCode,
        panIdNo: vendor.panIdNo,
        gstIn: vendor.gstIn,
        ifscCode: vendor.ifscCode,
        bankName: vendor.bankName,
        branchName: vendor.branchName,
        nameOnAccount: vendor.nameOnAccount,
        accountNumber: vendor.accountNumber,
      })) || [];

  return (
    <div>
      <PageFrame>
        <AgTable
          search={true}
          searchColumn={"Vendor"}
          tableTitle={"List of Vendors"}
          data={rows}
          columns={vendorColumns}
          buttonTitle={"Add Vendor"}
          handleClick={() => navigate("vendor-onboard")}
        />
      </PageFrame>
      <MuiModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedVendor(null);
        }}
        title="Vendor Details"
      >
        <div className="flex flex-col gap-3">
          <>
            <DetalisFormatted
              title="Vendor ID"
              detail={selectedVendor?.vendorID}
            />
            <DetalisFormatted
              title="Vendor Name"
              detail={selectedVendor?.vendorName}
            />
            <DetalisFormatted
              title="Address"
              detail={selectedVendor?.address}
            />
            <DetalisFormatted title="City" detail={selectedVendor?.city} />
            <DetalisFormatted title="State" detail={selectedVendor?.state} />
            <DetalisFormatted
              title="Country"
              detail={selectedVendor?.country}
            />
            <DetalisFormatted
              title="Pin Code"
              detail={selectedVendor?.pinCode}
            />
            <DetalisFormatted
              title="Party Type"
              detail={selectedVendor?.partyType}
            />
            <DetalisFormatted title="Status" detail={selectedVendor?.status} />
            {/* <DetalisFormatted
              title="Department ID"
              detail={selectedVendor?.departmentId}
            />
            <DetalisFormatted
              title="Company ID"
              detail={selectedVendor?.company}
            /> */}
            <DetalisFormatted
              title="Company Name"
              detail={selectedVendor?.companyName}
            />
            <DetalisFormatted title="Email" detail={selectedVendor?.email} />
            <DetalisFormatted title="Mobile" detail={selectedVendor?.mobile} />
            <DetalisFormatted
              title="Onboarding Date"
              detail={selectedVendor?.onboardingDate}
            />
            <DetalisFormatted
              title="PAN ID No"
              detail={selectedVendor?.panIdNo}
            />
            <DetalisFormatted title="GSTIN" detail={selectedVendor?.gstIn} />
            <DetalisFormatted
              title="IFSC Code"
              detail={selectedVendor?.ifscCode}
            />
            <DetalisFormatted
              title="Bank Name"
              detail={selectedVendor?.bankName}
            />
            <DetalisFormatted
              title="Branch Name"
              detail={selectedVendor?.branchName}
            />
            <DetalisFormatted
              title="Name on Account"
              detail={selectedVendor?.nameOnAccount}
            />
            <DetalisFormatted
              title="Account Number"
              detail={selectedVendor?.accountNumber}
            />
          </>
        </div>
      </MuiModal>
    </div>
  );
};

export default VendorTable;
