const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
    required: true,
  },
  deptWisePermissions: [
    {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
      modules: [
        {
          moduleName: { type: String, required: true },
          submodules: [
            {
              submoduleName: { type: String, required: true },
              actions: [
                {
                  type: String,
                  enum: ["View", "Edit"],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

const Permission = mongoose.model("Permission", permissionSchema);
module.exports = Permission;
