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
  ],
  UserData: [
    "user",
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
  ],
  Unit: ["locationId"],

  //Asset IDs
  Asset: ["assetId"],
  AssignAsset: ["assigneddAssetId"],
  AssetCategory: ["categoryId"],
  SubCategory: ["subCategoryId"],

  //Meeting IDs
  Meeting: ["meetingId"],
  Room: ["bookedRoom", "roomId", "id"],

  //Sales IDs
  CoworkingClient: ["toMeetCompany", "client"],
  CoworkingMember: ["clientToMeet", "clientParticipants"],

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
