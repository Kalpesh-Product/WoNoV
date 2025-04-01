import AgTable from '../../components/AgTable';
import { Chip } from '@mui/material';

const MeetingReports = () => {
  const meetingReportsColumn = [
    { field: 'name', headerName: 'Name' },
    { field: 'department', headerName: 'Department' },
    { field: 'date', headerName: 'Date' },
    { field: 'startTime', headerName: 'Start TIme' },
    { field: 'endTime', headerName: 'End Time' },
    { field: 'duration', headerName: 'Duration' },
    { field: 'creditsUsed', headerName: 'Credits Used' },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: (params) => {
        const statusColorMap = {
          Ongoing: { backgroundColor: '#d9e8fe', color: '#385391' }, // Light blue bg, dark blue font
          Cancelled: { backgroundColor: '#f7e1e1', color: '#a5333e' }, // Light red bg, dark red font
          Upcoming: { backgroundColor: '#fcf7be', color: '#b87e33' },
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: 'gray',
          color: 'white',
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
  ];

  const rows = [
    {
      name: 'Sam',
      department: 'IT',
      date: '2024-01-29',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      duration: '1h',
      creditsUsed: 20,
      status: 'Ongoing',
    },
    {
      name: 'Alice',
      department: 'Admin',
      date: '2024-01-29',
      startTime: '11:30 AM',
      endTime: '12:15 PM',
      duration: '45m',
      creditsUsed: 50,
      status: 'Cancelled',
    },
    {
      name: 'Bob',
      department: 'HR',
      date: '2024-01-29',
      startTime: '2:00 PM',
      endTime: '3:00 PM',
      duration: '1h',
      creditsUsed: 30,
      status: 'Upcoming',
    },
    {
      name: 'Emma',
      department: 'Finance',
      date: '2024-01-29',
      startTime: '3:30 PM',
      endTime: '4:15 PM',
      duration: '45m',
      creditsUsed: 10,
      status: 'Cancelled',
    },
    {
      name: 'John',
      department: 'IT',
      date: '2024-01-29',
      startTime: '4:30 PM',
      endTime: '6:00 PM',
      duration: '1h 30m',
      creditsUsed: 40,
      status: 'Upcoming',
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <AgTable
          search={true}
          searchColumn={'Name'}
          buttonTitle={'Export'}
          data={rows}
          columns={meetingReportsColumn}
        />
      </div>
    </div>
  );
};

export default MeetingReports;
