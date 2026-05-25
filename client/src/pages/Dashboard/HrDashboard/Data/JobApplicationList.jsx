import React, { useState } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanDate from "../../../../utils/humanDateForamt";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { CircularProgress } from "@mui/material";
import PageFrame from "../../../../components/Pages/PageFrame";
import { inrFormat } from "../../../../utils/currencyFormat";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import WidgetTable from "../../../../components/Tables/WidgetTable";
import StatusChip from "../../../../components/StatusChip";

const JobApplicationList = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [viewApplicationDetails, setViewApplicationDetails] = useState({});
  const {
    data: jobApplications,
    isPending: isJobApplicationPending,
    error,
  } = useQuery({
    queryKey: ["jobApplications"],
    queryFn: async function () {
      const response = await axios.get("/api/company/get-job-applications");
      return response.data;
    },
  });

  const leavesColumn = [
    { field: "srNo", headerName: "SR No", width: 300 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          className="text-primary underline cursor-pointer"
          onClick={() => handleViewApplicationDetails(params.data)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "email", headerName: "Email", flex: 1 ,hide:true},
    { field: "dateOfBirth", headerName: "Date of Birth", flex:1,hide:true },
    { field: "mobileNumber", headerName: "Mobile Number", flex: 1,hide:true },
    { field: "location", headerName: "Location", flex: 1,hide:true },
    { field: "experienceInYears", headerName: "Experience (Years)", flex: 1 ,hide:true},
    {
      field: "currentMonthlySalary",
      headerName: "Current Monthly Salary",
      flex: 1,
      hide:true,
      valueFormatter: (params) => inrFormat(params.value),
    },
    { field: "expectedMonthlySalary",
      headerName: "Expected Monthly Salary",
      flex: 1,
      hide:true,
      valueFormatter: (params) => inrFormat(params.value),
    },
    { field: "howSoonYouCanJoinInDays", headerName: "Joining Time (Days)", flex: 1 ,hide:true},
    { field: "willRelocateToGoa", headerName: "Willing to Relocate to Goa", flex: 1 ,hide:true},
    { field: "willingToBootstrap", headerName: "Willing to Bootstrap", flex: 1 ,hide:true},   
    {field: "linkedInProfileUrl", headerName: "LinkedIn Profile", flex: 1, hide:true},
    { field: "skillSetsForJob", headerName: "Skill Sets for Job", flex: 1, hide:true },
    { field: "whyShouldWeConsiderYou", headerName: "Why Should We Consider You?", flex: 1, hide:true },
    { field: "whoAreYouAsPerson", headerName: "Who Are You As a Person?", flex: 1, hide:true },
    { field: "message", headerName: "Message", flex: 1, hide:true },
    { field: "resumeLink", headerName: "Resume Link", flex: 1, hide:true },
    { field: "remarks", headerName: "Remarks", flex: 1, hide:true },
    { field: "finalSubmissionDate", headerName: "Submission Date" ,flex:1},
    { field: "jobPosition", headerName: "Job Position", flex: 1 },
    { field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => <StatusChip status={params.value} />
    }
  ];

  const handleViewApplicationDetails = (job) => {
    setViewApplicationDetails(job);
    setOpenModal(true);
  };

  function isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  const formatURL = (url) => {
    if (!url) return "";

    let formattedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    // Ensure LinkedIn profile URLs have a trailing slash
    if (
      formattedUrl.includes("linkedin.com/in") &&
      !formattedUrl.endsWith("/")
    ) {
      formattedUrl += "/";
    }

    return formattedUrl;
  };

  return (
    <div>
      <WidgetTable
        dateColumn={"finalSubmissionDate"}
        search
        totalKey="count"
        totalText="TOTAL : "
        searchColumn={"Job Position"}
        tableTitle={"Job Applications"}
        data={
          isJobApplicationPending
            ? []
            : jobApplications
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.finalSubmissionDate) -
                    new Date(b.finalSubmissionDate)
                )
                .map((job) => ({
                  ...job,
                  count: 1,
                  finalSubmissionDate: job.finalSubmissionDate,
                  jobPosition: job.jobPosition == "" ? "-" : job.jobPosition,
                }))
        }
        columns={leavesColumn}
        exportData
      />
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Job Application Details"}
      >
        {!isJobApplicationPending && jobApplications ? (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
            <div className="font-bold">Personal Details</div>
            <DetalisFormatted
              title="Name"
              detail={viewApplicationDetails?.name}
            />
            <DetalisFormatted
              title="Email"
              detail={viewApplicationDetails?.email}
            />
            <DetalisFormatted
              title="Date of Birth"
              detail={humanDate(viewApplicationDetails?.dateOfBirth)}
            />
            <DetalisFormatted
              title="Mobile Number"
              detail={viewApplicationDetails?.mobileNumber}
            />
            <DetalisFormatted
              title="Location"
              detail={viewApplicationDetails?.location}
            />
            <br />
            <div className="font-bold">Experience & Availability</div>
            <DetalisFormatted
              title="Experience (Years)"
              detail={viewApplicationDetails?.experienceInYears}
            />

            <DetalisFormatted
              title="Current Monthly Salary"
              detail={inrFormat(viewApplicationDetails?.currentMonthlySalary)}
            />
            <DetalisFormatted
              title="Expected Monthly Salary"
              detail={inrFormat(viewApplicationDetails?.expectedMonthlySalary)}
            />
            <DetalisFormatted
              title="Joining Time (Days)"
              detail={viewApplicationDetails?.howSoonYouCanJoinInDays}
            />
            <DetalisFormatted
              title="Willing to Relocate to Goa"
              detail={viewApplicationDetails?.willRelocateToGoa}
            />
            <DetalisFormatted
              title="Willing to Bootstrap"
              detail={viewApplicationDetails?.willingToBootstrap}
            />
            <br />
            <div className="font-bold">Professional Details</div>
            <DetalisFormatted
              title="LinkedIn Profile"
              detail={
                !isValidURL(viewApplicationDetails.linkedInProfileUrl) ? (
                  "Not Provided"
                ) : (
                  <div>
                    <a
                      className="text-primary underline cursor-pointer"
                      href={formatURL(
                        viewApplicationDetails.linkedInProfileUrl
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )
              }
            />
            <DetalisFormatted
              title="Skill Sets for Job"
              detail={viewApplicationDetails?.skillSetsForJob}
            />
            <DetalisFormatted
              title="Why Should We Consider You?"
              detail={viewApplicationDetails?.whyShouldWeConsiderYou}
            />
            <DetalisFormatted
              title="Who Are You As a Person?"
              detail={viewApplicationDetails?.whoAreYouAsPerson}
            />

            <DetalisFormatted
              title="Message"
              detail={viewApplicationDetails?.message}
            />
            <br />
            <div className="font-bold">Application Info</div>
            <DetalisFormatted
              title="Resume Link"
              detail={
                !isValidURL(viewApplicationDetails.resumeLink) ? (
                  "Not Provided"
                ) : (
                  <div>
                    <a
                      className="text-primary underline cursor-pointer"
                      href={formatURL(viewApplicationDetails.resumeLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      Resume
                    </a>
                  </div>
                )
              }
            />
            <DetalisFormatted
              title="Status"
              detail={viewApplicationDetails?.status}
            />
            <DetalisFormatted
              title="Remarks"
              detail={viewApplicationDetails?.remarks || "Not specified"}
            />
            <DetalisFormatted
              title="Job Position"
              detail={viewApplicationDetails?.jobPosition || "Not specified"}
            />
            <DetalisFormatted
              title="Final Submission Date"
              detail={humanDate(viewApplicationDetails?.finalSubmissionDate)}
            />
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default JobApplicationList;
