import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanDate from "../../../../utils/humanDateForamt";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { CircularProgress } from "@mui/material";
import PageFrame from "../../../../components/Pages/PageFrame";

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
    { field: "srno", headerName: "SR No", width: 100 },
    { field: "dateOfBirth", headerName: "Date" },
    { field: "name", headerName: "Name" },
    { field: "jobPosition", headerName: "Job Position" },
    { field: "location", headerName: "Location" },
    { field: "mobileNumber", headerName: "Mobile" },
    { field: "email", headerName: "Email" },
    // { field: "submissiondate", headerName: "Submit Date" },
    {
      field: "resumeLink",
      headerName: "View Resume",
      cellRenderer: (params) => {
        const pdfPath = params.value;
        return (
          <a
            href={pdfPath}
            target="blank"
            style={{ color: "blue", textDecoration: "underline" }}>
            View Resume
          </a>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      width: 100,
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewApplicationDetails(params.data)}>
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  const rows = [
    {
      srno: "1",
      jobposition: "Jr Network Engineer",
      name: "vivek parte",
      email: "vivekparte43@gmail.com",
      dateofbirth: "20/03/2025",
      mobilenumber: "1234523678",
      location: "Maharashtra",
      submissiondate: "03-01-2024",
      SubmissionTime: "17.35.56",
      ResumeLink: "/aiwin_resume.pdf",
    },
    {
      srno: "2",
      jobposition: "Jr Network Engineer",
      name: "Vivek Bhartu",
      email: "vivekparte43@gmail.com",
      dateofbirth: "20/03/2025",
      mobilenumber: "1234523678",
      location: "Maharashtra",
      submissiondate: "03-01-2024",
      SubmissionTime: "17.35.56",
      ResumeLink: "/aiwin_resume.pdf",
    },
    {
      srno: "3",
      jobposition: "Jr Network Engineer",
      name: "Parth Negi",
      email: "vivekparte43@gmail.com",
      dateofbirth: "20/03/2025",
      mobilenumber: "1234523678",
      location: "Maharashtra",
      submissiondate: "03-01-2024",
      SubmissionTime: "17.35.56",
      ResumeLink: "/aiwin_resume.pdf",
    },
    {
      srno: "4",
      jobposition: "Jr Network Engineer",
      name: "karan Mehra",
      email: "vivekparte43@gmail.com",
      dateofbirth: "10/02/2025",
      mobilenumber: "1234523678",
      location: "Maharashtra",
      submissiondate: "03-01-2024",
      SubmissionTime: "17.35.56",
      ResumeLink: "/aiwin_resume.pdf",
    },
    {
      srno: "5",
      jobposition: "Jr Network Engineer",
      name: "Siddhesh Bhagat",
      email: "vivekparte43@gmail.com",
      dateofbirth: "08/02/2025",
      mobilenumber: "1234523678",
      location: "Maharashtra",
      submissiondate: "03-01-2024",
      SubmissionTime: "17.35.56",
      ResumeLink: "/aiwin_resume.pdf",
    },
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
    <PageFrame>
      <div>
        <AgTable
          search={true}
          searchColumn={"Job Position"}
          tableTitle={"Job Applications"}
          data={
            isJobApplicationPending
              ? []
              : jobApplications.map((job, index) => ({
                  ...job,
                  srno: index + 1,
                  dateOfBirth: humanDate(job.dateOfBirth),
                  jobPosition: job.jobPosition == "" ? "-" : job.jobPosition,
                }))
          }
          columns={leavesColumn}
        />
        <MuiModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title={"View Job Application Details"}>
          {!isJobApplicationPending && jobApplications ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
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
              <DetalisFormatted
                title="Experience (Years)"
                detail={viewApplicationDetails?.experienceInYears}
              />
              <DetalisFormatted
                title="LinkedIn Profile"
                detail={
                  !isValidURL(viewApplicationDetails.linkedInProfileUrl) ? (
                    "Not Provided"
                  ) : (
                    <div>
                      <a
                        href={formatURL(
                          viewApplicationDetails.linkedInProfileUrl
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "underline" }}>
                        LinkedIn Profile
                      </a>
                    </div>
                  )
                }
              />
              <DetalisFormatted
                title="Current Monthly Salary"
                detail={viewApplicationDetails?.currentMonthlySalary}
              />
              <DetalisFormatted
                title="Expected Monthly Salary"
                detail={viewApplicationDetails?.expectedMonthlySalary}
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
                title="Who Are You As a Person?"
                detail={viewApplicationDetails?.whoAreYouAsPerson}
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
                title="Willing to Bootstrap"
                detail={viewApplicationDetails?.willingToBootstrap}
              />
              <DetalisFormatted
                title="Message"
                detail={viewApplicationDetails?.message}
              />
              <DetalisFormatted
                title="Resume Link"
                detail={
                  !isValidURL(viewApplicationDetails.resumeLink) ? (
                    "Not Provided"
                  ) : (
                    <div>
                      <a
                        href={formatURL(viewApplicationDetails.resumeLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "underline" }}>
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
    </PageFrame>
  );
};

export default JobApplicationList;
