import React from "react";
import AgTable from "../../../../components/AgTable";

const JobApplicationList = () => {
  const leavesColumn = [
    { field: "srno", headerName: "SR No", width: 100 },
    { field: "dateofbirth", headerName: "Date", width: 150 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "jobposition", headerName: "Job Position" },
    { field: "location", headerName: "Department", width: 150 },
    { field: "mobilenumber", headerName: "Mobile", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "submissiondate", headerName: "Submit Date", flex: 1 },
    {
      field: "ResumeLink",
      headerName: "View Resume",
      flex: 1,
      cellRenderer: (params) => {
        const pdfPath = params.value;
        return (
          <a
            href={pdfPath}
            target="blank"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            View Resume
          </a>
        );
      },
    },
  ];

  const rows = [
    {
      srno: "1",
      jobposition: "Jr Network Engineer",
      name: "vivek parte",
      email: "vivekparte43@gmail.com",
      dateofbirth: "1989-08-26",
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
      dateofbirth: "1989-08-26",
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
      dateofbirth: "1989-08-26",
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
      dateofbirth: "1989-08-26",
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
      dateofbirth: "1989-08-26",
      mobilenumber: "1234523678",
      location: "Maharashtra",
      submissiondate: "03-01-2024",
      SubmissionTime: "17.35.56",
      ResumeLink: "/aiwin_resume.pdf",
    },
  ];

  return (
    <div>
      <AgTable
        search={true}
        searchColumn={"Job Position"}
        tableTitle={"Job Applications"}
        data={rows}
        columns={leavesColumn}
      />
    </div>
  );
};

export default JobApplicationList;
