import AgTable from "../../components/AgTable";
import { Chip } from "@mui/material";
import PrimaryButton from "../../components/PrimaryButton";
import { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanTime from "../../utils/humanTime";
import humanDate from "../../utils/humanDateForamt";
import MuiModal from "../../components/MuiModal";
import DetalisFormatted from "../../components/DetalisFormatted";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import formatDateTime, {
  formatDateTimeFields,
} from "../../utils/formatDateTime";

const VisitorReports = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const axios = useAxiosPrivate();

  const { data: visitorsData = [], isPending: isVisitorsData } = useQuery({
    queryKey: ["visitor-reports"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return response.data;
    },
  });

  const handleDetailsClick = (visitor) => {
    setSelectedVisitor(formatDateTimeFields(visitor));
    setIsModalOpen(true);
  };

  const meetingReportsColumn = [
    { field: "srNo", headerName: "Sr No" },
    { field: "visitorType", headerName: "Type" },
    {
      field: "name",
      headerName: "Name",
      cellRenderer: (params) => (
        <div role="button" onClick={() => handleDetailsClick(params.data)}>
          <span className="underline text-primary cursor-pointer">
            {params.value}
          </span>
        </div>
      ),
    },
    { field: "gender", headerName: "Gender", hide: true },
    { field: "visitorCompany", headerName: "Visitor Company", hide: true },
    { field: "toMeetCompany", headerName: "Company To Meet", hide: true },
    { field: "department", headerName: "Department", hide: true },
    { field: "idProofType", headerName: "ID Type", hide: true },
    { field: "idProofNumber", headerName: "ID Number", hide: true },
    { field: "gstNumber", headerName: "GST Number", hide: true },
    { field: "gstFile", headerName: "GST File", hide: true },
    { field: "panNumber", headerName: "PAN Number", hide: true },
    { field: "panFile", headerName: "Pan File", hide: true },
    { field: "otherFile", headerName: "Other File", hide: true },
    { field: "email", headerName: "Email" },
    { field: "phone", headerName: "Phone No" },
    { field: "purpose", headerName: "Purpose" },
    { field: "toMeet", headerName: "To Meet" },
    {
      field: "dateOfVisit",
      headerName: "Date Of Visit",
    },
    {
      field: "scheduledDate",
      headerName: "Scheduled Date",
      hide: true,
    },

    {
      field: "checkInTime",
      headerName: "Check In Time",
    },

    {
      field: "checkOutTime",
      headerName: "Check Out Time",
    },

    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   cellRenderer: (params) => (
    //     <div className="p-2">
    //       <PrimaryButton
    //         title={"View Details"}
    //         handleSubmit={() => handleDetailsClick(params.data)}
    //       />
    //     </div>
    //   ),
    // },
  ];

  // Format table rows for AgTable

  // const rows = visitorsData.map((visitor, index) => ({
  //   srNo: index + 1,
  //   name: `${visitor.firstName || ""} ${visitor.lastName || ""}`,
  //   address: visitor.address || "-",
  //   email: visitor.email || "-",
  //   phone: visitor.phoneNumber || "-",
  //   purpose: visitor.purposeOfVisit || "-",
  //   toMeet: visitor.toMeet
  //     ? `${visitor.toMeet?.firstName} ${visitor.toMeet?.lastName}`
  //     : visitor.clientToMeet
  //     ? visitor?.clientToMeet?.employeeName
  //     : "",
  //   checkIn: visitor.checkIn,
  //   checkInTime: humanTime(visitor.checkIn),
  //   checkOut: visitor.checkOut,
  //   checkOutTime: humanTime(visitor.checkOut),
  //   rawData: visitor, // Pass full object for modal
  //   visitorType: visitor.visitorFlag || "-",
  //   date: visitor.checkIn,
  //   dateOfVisit: visitor.checkIn,
  // }));

  const rows = visitorsData.map((visitor, index) => {
    const toMeetName = visitor.toMeet
      ? `${visitor.toMeet?.firstName} ${visitor.toMeet?.lastName}`
      : visitor.clientToMeet
      ? visitor?.clientToMeet?.employeeName
      : "-";

    const toMeetCompany =
      visitor.toMeetCompany === "6799f0cd6a01edbe1bc3fcea"
        ? "BIZNest"
        : visitor?.toMeetCompany?.clientName ||
          visitor?.toMeetCompany?.companyName ||
          visitor?.toMeetCompany?.name ||
          visitor?.toMeetCompany ||
          "-";

    return {
      srNo: index + 1,
      name:
        `${visitor.firstName || ""} ${visitor.lastName || ""}`.trim() || "-",
      gender: visitor.gender || "-",
      email: visitor.email || "-",
      phone: visitor.phoneNumber || "-",
      purpose: visitor.purposeOfVisit || "-",
      toMeet: toMeetName,
      toMeetCompany,
      visitorCompany: visitor.visitorCompany || "-",
      department: visitor.department?.name || "-",
      idProofType: visitor.idProof?.idType || "-",
      idProofNumber: visitor.idProof?.idNumber || "-",
      panNumber: visitor.panNumber || "-",
      gstNumber: visitor.gstNumber || "-",
      checkIn: visitor.checkIn,
      checkInDate: visitor.checkIn,
      checkInTime: visitor.checkIn,
      checkOut: visitor.checkOut,
      checkOutDate: visitor.checkOut,
      checkOutTime: visitor.checkOut,
      rawData: visitor, // Pass full object for modal
      visitorFlag: visitor.visitorFlag || "-",
      visitorType: visitor.visitorType || "-",
      date: visitor.dateOfVisit || visitor.checkIn,
      dateOfVisit: visitor.dateOfVisit || visitor.checkInDate,
      scheduledDate: visitor.scheduledDate,
      gstFile: visitor?.gstFile?.link,
      otherFile: visitor?.otherFile?.link,
      panFile: visitor?.panFile?.link,
      brandName: visitor?.brandName,
      registeredClientCompany: visitor?.registeredClientCompany,
    };
  });

  return (
    <div className="flex flex-col gap-8 p-4">
      <PageFrame>
        <div>
          <YearWiseTable
            exportData
            dateColumn={"date"}
            search={true}
            searchColumn={"name"}
            tableTitle={"Visitor Reports"}
            data={rows}
            columns={meetingReportsColumn}
            loading={isVisitorsData}
          />
        </div>
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Visitor Details"
      >
        {selectedVisitor && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <div className="font-bold">Personal Information</div>
            <DetalisFormatted title="Name" detail={selectedVisitor.name} />
            <DetalisFormatted
              title="Visitor Type"
              detail={selectedVisitor.visitorType}
            />
            <DetalisFormatted title="Gender" detail={selectedVisitor.gender} />
            <DetalisFormatted title="Phone" detail={selectedVisitor.phone} />
            <DetalisFormatted title="Email" detail={selectedVisitor.email} />
            {selectedVisitor.visitorFlag !== "Client" && (
              <DetalisFormatted
                title="Visitor Company"
                detail={selectedVisitor.visitorCompany}
              />
            )}
            <br />
            <div className="font-bold">Visit Details</div>

            {selectedVisitor.visitorFlag !== "Client" && (
              <>
                <DetalisFormatted
                  title="To Meet"
                  detail={selectedVisitor.toMeet}
                />
                <DetalisFormatted
                  title="Company To Meet"
                  detail={selectedVisitor.toMeetCompany}
                />
                {selectedVisitor.toMeetCompany === "BIZNest" && (
                  <DetalisFormatted
                    title="Department"
                    detail={selectedVisitor.department}
                  />
                )}
              </>
            )}

            <DetalisFormatted
              title="Purpose"
              detail={selectedVisitor.purpose}
            />
            {selectedVisitor.visitorFlag === "Client" && (
              <>
                <DetalisFormatted
                  title="ID Type"
                  detail={selectedVisitor.idProofType}
                />

                <DetalisFormatted
                  title="ID Number"
                  detail={selectedVisitor.idProofNumber}
                />

                <DetalisFormatted
                  title="GST Number"
                  detail={selectedVisitor.gstNumber}
                />

                <DetalisFormatted
                  title="GST File"
                  detail={
                    selectedVisitor.gstFile ? (
                      <a
                        href={selectedVisitor.gstFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        File
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                <DetalisFormatted
                  title="PAN Number"
                  detail={selectedVisitor.panNumber}
                />

                <DetalisFormatted
                  title="PAN File"
                  detail={
                    selectedVisitor.panFile ? (
                      <a
                        href={selectedVisitor.panFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        File
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />

                <DetalisFormatted
                  title="Other File"
                  detail={
                    selectedVisitor.otherFile ? (
                      <a
                        href={selectedVisitor.otherFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        File
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
              </>
            )}
            <DetalisFormatted
              title="Check In"
              detail={selectedVisitor.checkInTime}
            />
            <DetalisFormatted
              title="Check Out"
              detail={selectedVisitor.checkOutTime}
            />
            <DetalisFormatted
              title="Date of Visit"
              detail={selectedVisitor.dateOfVisit}
            />
            <DetalisFormatted
              title="Scheduled Date"
              detail={selectedVisitor.scheduledDate}
            />
            {selectedVisitor.rawData?.image?.url && (
              <div className="lg:col-span-2">
                <img
                  src={selectedVisitor.rawData.image.url}
                  alt="Visitor Attachment"
                  className="max-w-full max-h-96 rounded border"
                />
              </div>
            )}
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default VisitorReports;
