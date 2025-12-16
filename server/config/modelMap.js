//To populate reference ids add keys that are being passed in the body/query/params as these are what being stored as payload

const modelKeyGroups = {
  Department: [
    "raisedToDepartment",
    "toDepartment",
    "fromDepartment",
    "departmentId",
    "department",
    "dept",
    "departmentIds",
    "id",
  ],
  UserData: [
    "user",
    "userId",
    "takenBy",
    "assignedBy",
    "assignee",
    "raisedBy",
    "assignees",
    "closedBy",
    "acceptedBy",
    "rejectedBy",
    "completedBy",
    "bookedBy",
    "internalParticipants",
    "assigned",
    "toMeet",
    "adminId",
  ],
  Unit: ["locationId", "location", "unitId", "unit"],

  //Agreement Ids
  agreements: ["agreementId"],

  //Asset IDs
  Asset: ["assetId"],
  AssignAsset: ["assigneddAssetId"],
  AssetCategory: ["categoryId"],
  SubCategory: ["subCategoryId"],

  //Attendance IDs
  Attendance: ["attendanceId"],
  AttendanceCorrection: [""],

  //Budget IDs
  Budget: ["budgetId"],

  //Budget IDs
  Building: ["buildingId"],

  //Company IDs
  Company: ["departmentId"],

  //Event IDs
  Event: ["id"],

  //Housekeepingstaff IDs
  Housekeepingstaff: ["id", "memberId"],

  //Inventory IDs
  Inventory: ["id"],

  //Invoice IDs
  Invoice: ["invoiceId"],

  //Landlord IDs
  Landlord: ["landLordId"],

  //Meeting IDs
  Meeting: ["meetingId"],
  Room: ["bookedRoom", "roomId", "id"],

  //Sales IDs
  CoworkingClient: [
    "toMeetCompany",
    "client",
    "clientId",
    "id",
    "coworkingclientid",
  ],
  CoworkingMember: ["clientToMeet", "clientParticipants", "memberId"],
  ClientService: ["serviceId"],
  MeetingClientRevenue: ["id"],
  VirtualOfficeClient: ["virtualOfficeClientId", "id"],

  //Administration Ids
  ClientEvent: ["id"],
  WeeklySchedule: ["weeklyScheduleId"],

  //Review Ids
  Review: ["reviewId"],

  //Ticket IDs
  Ticket: ["ticketId", "id"],

  //Task IDs
  Task: ["id", "taskIds"],

  //Performance IDs
  kraKpaRole: ["taskId", "task"],

  //Visitor IDs
  Visitor: ["visitorId", "externalCompany"],

  //Vendor IDs
  Vendor: ["vendorId"],

  // Add more models as needed
};

// Flatten into a key → model map
const keyToModelMap = {};

for (const [model, keys] of Object.entries(modelKeyGroups)) {
  keys.forEach((key) => {
    keyToModelMap[key] = model;
  });
}

module.exports = keyToModelMap;
