const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Unit = require("../models/locations/Unit");
const VirtualOfficeClient = require("../models/sales/VirtualOfficeClient");
const {
  bulkUpdateVirtualOfficeClients,
} = require("../controllers/salesControllers/virtualOfficeClientControllers");

const company = new mongoose.Types.ObjectId();
const clientId = new mongoose.Types.ObjectId();

async function upload(csv) {
  const originalFindUnits = Unit.find;
  const originalFindClients = VirtualOfficeClient.find;
  const originalBulkWrite = VirtualOfficeClient.bulkWrite;
  let operations;

  Unit.find = () => ({ select: () => ({ lean: async () => [] }) });
  VirtualOfficeClient.find = () => ({
    lean: async () => [{ _id: clientId, clientName: "Acme" }],
  });
  VirtualOfficeClient.bulkWrite = async (ops) => {
    operations = ops;
    return { modifiedCount: ops.length, matchedCount: ops.length };
  };

  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  try {
    await bulkUpdateVirtualOfficeClients(
      { company, file: { originalname: "clients.csv", buffer: Buffer.from(csv) } },
      response,
      (error) => { throw error; },
    );
    return { response, operations };
  } finally {
    Unit.find = originalFindUnits;
    VirtualOfficeClient.find = originalFindClients;
    VirtualOfficeClient.bulkWrite = originalBulkWrite;
  }
}

test("source and alternate admin fields exist in the client schema", () => {
  assert.equal(VirtualOfficeClient.schema.path("source").instance, "String");
  assert.equal(VirtualOfficeClient.schema.path("alternateAdmin.name").instance, "String");
  assert.equal(VirtualOfficeClient.schema.path("alternateAdmin.phone").instance, "String");
});

test("bulk update maps new CSV fields and retains phone leading zero", async () => {
  const { response, operations } = await upload(
    "Client Name,Source,Desk Rate,Monthly Fee,Alternate Admin Name,Alternate Admin Phone Number\nAcme,Referral,2500,75000,Asha,0987654321",
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(operations[0].updateOne.update.$set, {
    source: "Referral",
    deskRate: 2500,
    monthlyFee: 75000,
    "alternateAdmin.name": "Asha",
    "alternateAdmin.phone": "0987654321",
  });
});

test("bulk update accepts legacy alternate-admin CSV headers", async () => {
  const { response, operations } = await upload(
    "Client Name,Alt/Admin Name,Alt/Admin No\nAcme,Asha,0987654321",
  );

  assert.equal(response.statusCode, 200);
  assert.equal(operations[0].updateOne.update.$set["alternateAdmin.name"], "Asha");
  assert.equal(operations[0].updateOne.update.$set["alternateAdmin.phone"], "0987654321");
});

test("negative rate or fee cancels the whole bulk update", async () => {
  const { response, operations } = await upload(
    "Client Name,Desk Rate,Monthly Fee\nAcme,-1,-5",
  );

  assert.equal(response.statusCode, 400);
  assert.equal(operations, undefined);
  assert.deepEqual(response.body.validationErrors.map(({ field }) => field), [
    "Desk Rate",
    "Monthly Fee",
  ]);
});
