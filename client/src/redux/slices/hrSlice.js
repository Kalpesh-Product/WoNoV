import { createSlice } from "@reduxjs/toolkit";

const initialTasksRawData = [
  {
    department: "Tech",
    total: 40,
    achieved: 35,
    tasks: [
      // May - mix of completed and pending
      {
        taskName: "Complete sales module",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Aiwinraj",
        assignedDate: "13-05-2025",
        dueDate: "14-05-2025",
        status: "Completed",
      },
      {
        taskName: "Deploy chat feature",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Priya Shah",
        assignedDate: "12-05-2025",
        dueDate: "15-05-2025",
        status: "Completed",
      },
      {
        taskName: "Fix API bugs",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Ravi Mehta",
        assignedDate: "11-05-2025",
        dueDate: "13-05-2025",
        status: "Pending",
      },

      // April - completed tasks
      {
        taskName: "Build HR dashboard",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Sanya Dutta",
        assignedDate: "10-04-2025",
        dueDate: "15-04-2025",
        status: "Completed",
      },
      {
        taskName: "Refactor login module",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Vikram Chauhan",
        assignedDate: "12-04-2025",
        dueDate: "14-04-2025",
        status: "Completed",
      },

      // June - pending
      {
        taskName: "Implement OTP system",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Riya Kapoor",
        assignedDate: "10-06-2025",
        dueDate: "15-06-2025",
        status: "Pending",
      },

      // July - pending
      {
        taskName: "Enhance analytics view",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Ajay Singh",
        assignedDate: "08-07-2025",
        dueDate: "12-07-2025",
        status: "Pending",
      },

      // August - pending
      {
        taskName: "Create marketing dashboard",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Sneha Joshi",
        assignedDate: "05-08-2025",
        dueDate: "10-08-2025",
        status: "Pending",
      },

      // September - pending
      {
        taskName: "Add notification center",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Manav Patel",
        assignedDate: "03-09-2025",
        dueDate: "08-09-2025",
        status: "Pending",
      },

      // October - pending
      {
        taskName: "Security audit fixes",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Divya Ramesh",
        assignedDate: "10-10-2025",
        dueDate: "14-10-2025",
        status: "Pending",
      },

      // November - pending
      {
        taskName: "Upgrade DB schema",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Shivani Jain",
        assignedDate: "15-11-2025",
        dueDate: "20-11-2025",
        status: "Pending",
      },

      // December - pending
      {
        taskName: "Integrate payment logs",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Yash Malhotra",
        assignedDate: "01-12-2025",
        dueDate: "05-12-2025",
        status: "Pending",
      },

      // January - pending
      {
        taskName: "Optimize frontend loading",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Pooja Shah",
        assignedDate: "06-01-2026",
        dueDate: "10-01-2026",
        status: "Pending",
      },

      // February - pending
      {
        taskName: "Migrate to Vite",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Arjun Nair",
        assignedDate: "09-02-2026",
        dueDate: "14-02-2026",
        status: "Pending",
      },

      // March - pending
      {
        taskName: "Create yearly summary page",
        assignedBy: "Kalpesh Naik",
        assignedTo: "Mehul Patel",
        assignedDate: "05-03-2026",
        dueDate: "10-03-2026",
        status: "Pending",
      },
    ],
  },

  {
    department: "HR",
    total: 30,
    achieved: 28,
    tasks: [
      {
        taskName: "Finalize payroll structure",
        assignedBy: "Nisha Patel",
        assignedTo: "Ritika Sharma",
        assignedDate: "10-05-2025",
        dueDate: "13-05-2025",
        status: "Completed",
      },
      {
        taskName: "Schedule employee training",
        assignedBy: "Nisha Patel",
        assignedTo: "Amit Desai",
        assignedDate: "12-05-2025",
        dueDate: "16-05-2025",
        status: "Pending",
      },
      {
        taskName: "Update leave policy",
        assignedBy: "Nisha Patel",
        assignedTo: "Meera Rao",
        assignedDate: "13-05-2025",
        dueDate: "18-05-2025",
        status: "Pending",
      },
    ],
  },
  {
    department: "Sales",
    total: 50,
    achieved: 47,
    tasks: [
      {
        taskName: "Follow up with client leads",
        assignedBy: "Suresh Menon",
        assignedTo: "Deepak Verma",
        assignedDate: "11-05-2025",
        dueDate: "14-05-2025",
        status: "Completed",
      },
      {
        taskName: "Update CRM with new data",
        assignedBy: "Suresh Menon",
        assignedTo: "Neha Joshi",
        assignedDate: "12-05-2025",
        dueDate: "13-05-2025",
        status: "Pending",
      },
      {
        taskName: "Prepare Q2 sales report",
        assignedBy: "Suresh Menon",
        assignedTo: "Vikram Chauhan",
        assignedDate: "13-05-2025",
        dueDate: "15-05-2025",
        status: "Pending",
      },
    ],
  },
  {
    department: "Finance",
    total: 35,
    achieved: 33,
    tasks: [
      {
        taskName: "Reconcile April transactions",
        assignedBy: "Anita Rao",
        assignedTo: "Rahul Sengupta",
        assignedDate: "10-05-2025",
        dueDate: "12-05-2025",
        status: "Completed",
      },
      {
        taskName: "Review expense claims",
        assignedBy: "Anita Rao",
        assignedTo: "Sneha Kulkarni",
        assignedDate: "13-05-2025",
        dueDate: "14-05-2025",
        status: "Pending",
      },
      {
        taskName: "Prepare audit documents",
        assignedBy: "Anita Rao",
        assignedTo: "Manoj Iyer",
        assignedDate: "11-05-2025",
        dueDate: "16-05-2025",
        status: "Pending",
      },
    ],
  },
];

const hrSlice = createSlice({
  name: "hr",
  initialState: {
    selectedMonth: null,
    tasksRawData: initialTasksRawData, // ✅ Inject here
  },
  reducers: {
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
    setTasksData: (state, action) => {
      state.tasksRawData = action.payload;
    },
  },
});

export const { setSelectedMonth, setTasksData } = hrSlice.actions;
export default hrSlice.reducer;
