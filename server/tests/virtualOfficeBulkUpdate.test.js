const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Unit = require("../models/locations/Unit");
const VirtualOfficeClient = require("../models/sales/VirtualOfficeClient");
const VirtualOfficeRevenue = require("../models/sales/VirtualOfficeRevenue");
const { bulkUpdateVirtualOfficeClients } = require("../controllers/salesControllers/virtualOfficeClientControllers");

const clientId = new mongoose.Types.ObjectId();
const company = new mongoose.Types.ObjectId();

test("virtual-office client stores desk rate and monthly fee as nonnegative numbers", () => {
  assert.equal(VirtualOfficeClient.schema.path("deskRate").instance, "Number");
  assert.equal(VirtualOfficeClient.schema.path("monthlyFee").instance, "Number");
  const invalid = new VirtualOfficeClient({ deskRate: -1, monthlyFee: -1 });
  const errors = invalid.validateSync().errors;
  assert.ok(errors.deskRate);
  assert.ok(errors.monthlyFee);
});

const runUpload = async ({ csv, clients, revenueIds }) => {
  const originals = {
    findUnits: Unit.find,
    findClients: VirtualOfficeClient.find,
    distinctRevenue: VirtualOfficeRevenue.distinct,
    writeClients: VirtualOfficeClient.bulkWrite,
    writeRevenue: VirtualOfficeRevenue.bulkWrite,
  };
  const writes = { clients: null, revenue: null };
  Unit.find = () => ({ select: () => ({ lean: async () => [] }) });
  VirtualOfficeClient.find = () => ({ lean: async () => clients });
  VirtualOfficeRevenue.distinct = async () => revenueIds;
  VirtualOfficeClient.bulkWrite = async (operations) => {
    writes.clients = operations;
    return { modifiedCount: operations.length, matchedCount: operations.length };
  };
  VirtualOfficeRevenue.bulkWrite = async (operations) => {
    writes.revenue = operations;
    return { modifiedCount: operations.length, matchedCount: operations.length };
  };

  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  try {
    await bulkUpdateVirtualOfficeClients(
      { company, file: { originalname: "clients.csv", buffer: Buffer.from(csv) } },
      response,
      (error) => { throw error; },
    );
    return { response, writes };
  } finally {
    Unit.find = originals.findUnits;
    VirtualOfficeClient.find = originals.findClients;
    VirtualOfficeRevenue.distinct = originals.distinctRevenue;
    VirtualOfficeClient.bulkWrite = originals.writeClients;
    VirtualOfficeRevenue.bulkWrite = originals.writeRevenue;
  }
};

test("bulk update mirrors the four supplied fields to linked virtual-office revenues", async () => {
  const { response, writes } = await runUpload({
    csv: "Client Name,Total Term,Rent Date,Annual Increment,Next Increment Date,Phone,Desk Rate,Monthly Fee,POC Name,POC Number\nAcme,12,01-Nov-2026,5,01-Nov-2027,12345,2500,75000,Alex,0987654321",
    clients: [{ _id: clientId, clientName: "Acme" }],
    revenueIds: [clientId],
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.updatedRevenueCount, 1);
  assert.deepEqual(writes.revenue[0].updateMany.filter, { client: clientId, company });
  const revenueSet = writes.revenue[0].updateMany.update.$set;
  assert.deepEqual(Object.keys(revenueSet).sort(), [
    "annualIncrement", "nextIncrementDate", "rentDate", "totalTerm",
  ]);
  assert.equal(revenueSet.totalTerm, 12);
  assert.equal(revenueSet.annualIncrement, 5);
  assert.equal(revenueSet.rentDate.toISOString(), "2026-11-01T00:00:00.000Z");
  assert.equal(revenueSet.nextIncrementDate.toISOString(), "2027-11-01T00:00:00.000Z");
  assert.equal(writes.clients[0].updateOne.update.$set.phone, "12345");
  assert.equal(writes.clients[0].updateOne.update.$set.deskRate, 2500);
  assert.equal(writes.clients[0].updateOne.update.$set.monthlyFee, 75000);
  assert.equal(writes.clients[0].updateOne.update.$set["localPoc.name"], "Alex");
  assert.equal(writes.clients[0].updateOne.update.$set["localPoc.phone"], "0987654321");
  assert.equal(writes.clients[0].updateOne.update.$set["hoPoc.name"], "Alex");
  assert.equal(writes.clients[0].updateOne.update.$set["hoPoc.phone"], "0987654321");
});

test("bulk update reports a CSV client missing from VirtualOfficeClient", async () => {
  const { response, writes } = await runUpload({
    csv: "Client Name,Total Term\nMissing,12",
    clients: [],
    revenueIds: [],
  });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /VirtualOfficeClient/);
  assert.equal(response.body.notFoundClients[0].row, 2);
  assert.equal(writes.clients, null);
  assert.equal(writes.revenue, null);
});

test("bulk update rejects a negative desk rate or monthly fee", async () => {
  const { response, writes } = await runUpload({
    csv: "Client Name,Desk Rate,Monthly Fee\nAcme,-1,-5",
    clients: [{ _id: clientId, clientName: "Acme" }],
    revenueIds: [clientId],
  });
  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body.validationErrors.map(({ field }) => field), [
    "Desk Rate", "Monthly Fee",
  ]);
  assert.equal(writes.clients, null);
  assert.equal(writes.revenue, null);
});

test("bulk update skips a client without a matching VirtualOfficeRevenue", async () => {
  const { response, writes } = await runUpload({
    csv: "Client Name,Total Term\nAcme,12",
    clients: [{ _id: clientId, clientName: "Acme" }],
    revenueIds: [],
  });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /VirtualOfficeRevenue/);
  assert.equal(response.body.notFoundRevenueClients[0].row, 2);
  assert.equal(writes.clients, null);
  assert.equal(writes.revenue, null);
});

test("bulk update cancels every write when one CSV client is unmatched", async () => {
  const { response, writes } = await runUpload({
    csv: "Client Name,Total Term\nAcme,18\nMissing,12",
    clients: [{ _id: clientId, clientName: "Acme" }],
    revenueIds: [clientId],
  });
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /No records were changed/);
  assert.equal(response.body.skippedCount, 1);
  assert.match(response.body.message, /VirtualOfficeClient/);
  assert.equal(response.body.updatedCount, 0);
  assert.equal(response.body.updatedRevenueCount, 0);
  assert.equal(writes.clients, null);
  assert.equal(writes.revenue, null);
});
