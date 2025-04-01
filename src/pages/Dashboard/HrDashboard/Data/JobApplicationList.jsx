import React from 'react'
import AgTable from '../../../../components/AgTable'
import { width } from '@mui/system';


const JobApplicationList = () => {

    const leavesColumn = [
        { field:"srno", headerName:"SR No",width:"100"},
        { field: "jobposition", headerName: "Job Position"},
        { field: "name", headerName: "Name",  width:"200" },
        { field: "email", headerName: "Email", width:200},
        { field: "dateofbirth", headerName: "Date Of Birth",flex:1, width:"200" },
        { field: "mobilenumber", headerName: "Mobile Number",width:"200"},
        { field: "location", headerName: "Location", flex: 1, width:200 },
        { field: "submissiondate", headerName: "Submission Date", flex: 1 },
        { field: "SubmissionTime", headerName: "Submission Time", flex: 1 },
        { field: "ResumeLink", headerName: "Resume Link", flex: 1, cellRenderer: (params) => {
            const pdfPath = params.value; // Assuming `link` field has the folder URL
            return ( <a href={pdfPath}  target="blank" style={{color:"blue", textDecoration:"underline"}}>Resume Link</a>);
          },
        },
      ];
    
      const rows = [
        {
          srno:"1",
          jobposition: "Jr Network Engineer",
          name: "vivek parte",
          email: "vivekparte43@gmail.com",
          dateofbirth: "1989-08-26",
          mobilenumber: "1234523678",
          location: "Maharashtra",
          submissiondate:"03-01-2024",
          SubmissionTime:"17.35.56",
          ResumeLink:"/_Resume_Anushri Bhagat.pdf"


        },
        {
            srno:"2",
            jobposition: "Jr Network Engineer",
            name: "Vivek Bhartu",
            email: "vivekparte43@gmail.com",
            dateofbirth: "1989-08-26",
            mobilenumber: "1234523678",
            location: "Maharashtra",
            submissiondate:"03-01-2024",
            SubmissionTime:"17.35.56",
            ResumeLink:"/_Resume_Anushri Bhagat.pdf"
            
        },
        {
            srno:"3",
            jobposition: "Jr Network Engineer",
            name: "Parth Negi",
            email: "vivekparte43@gmail.com",
            dateofbirth: "1989-08-26",
            mobilenumber: "1234523678",
            location: "Maharashtra",
            submissiondate:"03-01-2024",
            SubmissionTime:"17.35.56",
            ResumeLink:"/_Resume_Anushri Bhagat.pdf"
        },
        {
            srno:"4",
            jobposition: "Jr Network Engineer",
            name: "karan Mehra",
            email: "vivekparte43@gmail.com",
            dateofbirth: "1989-08-26",
            mobilenumber: "1234523678",
            location: "Maharashtra",
            submissiondate:"03-01-2024",
            SubmissionTime:"17.35.56",
            ResumeLink:"/_Resume_Anushri Bhagat.pdf"
        },
        {
            srno:"5",
            jobposition: "Jr Network Engineer",
            name: "Siddhesh Bhagat",
            email: "vivekparte43@gmail.com",
            dateofbirth: "1989-08-26",
            mobilenumber: "1234523678",
            location: "Maharashtra",
            submissiondate:"03-01-2024",
            SubmissionTime:"17.35.56",
            ResumeLink:"/_Resume_Anushri Bhagat.pdf"
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
  )
}

export default JobApplicationList