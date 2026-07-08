const mongoose = require("mongoose");
const Inventory = require("../../models/inventory/Inventory");

const buildInventoryMatch = ({ company, department }) => ({
  company: new mongoose.Types.ObjectId(company),
  ...(department && {
    department: new mongoose.Types.ObjectId(department),
  }),
});

const fetchInventoryService = async ({ company, department }) => {
  const inventories = await Inventory.aggregate([
    {
      $match: buildInventoryMatch({ company, department }),
    },
    {
      $sort: { createdAt: 1 },
    },
    {
      $addFields: {
        totalConsumed: {
          $sum: "$consumptions.quantity",
        },
      },
    },
    {
      $setWindowFields: {
        partitionBy: {
          itemName: "$itemName",
          unit: "$unit",
          department: "$department",
        },
        sortBy: { createdAt: 1 },
        output: {
          prevUnits: {
            $shift: { output: "$newPurchaseUnits", by: -1 },
          },
          prevPrice: {
            $shift: { output: "$newPurchasePerUnitPrice", by: -1 },
          },
          prevValue: {
            $shift: { output: "$newPurchaseInventoryValue", by: -1 },
          },
          prevRemaining: {
            $shift: { output: "$remainingUnits", by: -1 },
          },
          prevConsumed: {
            $shift: { output: "$totalConsumed", by: -1 },
          },
        },
      },
    },
    {
      $addFields: {
        openingInventoryUnits: { $ifNull: ["$prevUnits", 0] },
        openingPerUnitPrice: { $ifNull: ["$prevPrice", 0] },
        openingInventoryValue: { $ifNull: ["$prevValue", 0] },
        remainingOpeningInventoryUnits: {
          $ifNull: ["$prevRemaining", 0],
        },
        lastConsumed: { $ifNull: ["$prevConsumed", 0] },
        remainingNewPurchaseInventoryUnits: "$remainingUnits",
      },
    },
    {
      $lookup: {
        from: "items",
        localField: "itemName",
        foreignField: "_id",
        as: "item",
      },
    },
    { $unwind: { path: "$item", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "item.category",
        foreignField: "_id",
        as: "itemCategory",
      },
    },
    {
      $unwind: {
        path: "$itemCategory",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "units",
        localField: "unit",
        foreignField: "_id",
        as: "unit",
      },
    },
    { $unwind: { path: "$unit", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "department",
      },
    },
    { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "buildings",
        localField: "unit.building",
        foreignField: "_id",
        as: "building",
      },
    },
    { $unwind: { path: "$building", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "userdatas",
        localField: "consumptions.addedBy",
        foreignField: "_id",
        as: "consumptionUsers",
      },
    },

    {
      $addFields: {
        consumptions: {
          $map: {
            input: "$consumptions",
            as: "consumption",
            in: {
              quantity: "$$consumption.quantity",
              source: "$$consumption.source",
              date: "$$consumption.date",
              addedBy: {
                $let: {
                  vars: {
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$consumptionUsers",
                            cond: {
                              $eq: ["$$this._id", "$$consumption.addedBy"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    firstName: "$$user.firstName",
                    lastName: "$$user.lastName",
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        itemNamee: "$item.name",
        categoryName: "$itemCategory.categoryName",
        category: "$itemCategory.categoryName",

        department: "$department.name",

        unit: {
          unitNo: "$unit.unitNo",
          unitName: "$unit.unitName",
          buildingName: "$unit.buildingName",
        },

        addedBy: {
          firstName: "$addedBy.firstName",
          lastName: "$addedBy.lastName",
        },
      },
    },
    {
      $project: {
        company: 0,
        item: 0,
        itemCategory: 0,
        consumptionUsers: 0,
        prevUnits: 0,
        prevPrice: 0,
        prevValue: 0,
        prevRemaining: 0,
        prevConsumed: 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return inventories;
};

module.exports = {
  fetchInventoryService,
};
