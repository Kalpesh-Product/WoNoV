const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    unique: true,
  },
  companyLogo: {
    logoId: {
      type: String,
      required: true,
      unique: true,
    },
    logoUrl: {
      type: String,
      required: true,
      unique: true,
    },
  },
  selectedDepartments: [
    {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
      assetCategories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },

      ticketIssues: [
        {
          title: {
            type: String,
            required: true,
          },

          priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Low",
          },
          // resolveTime: {
          //   type: Number,
          //   default: 0, //minutes
          // },
        },
      ],
      policies: [
        {
          name: {
            type: String,
            required: true,
          },
          documentLink: {
            type: String,
            required: true,
          },
          documentId: {
            type: String,
            required: true,
          },
          isActive: {
            type: Boolean,
            default: true,
          },
          isDeleted: {
            type: Boolean,
            default: false,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: {
            type: Date,
            default: null,
          },
        },
      ],
      sop: [
        {
          name: {
            type: String,
            required: true,
          },
          documentLink: {
            type: String,
            required: true,
          },
          documentId: {
            type: String,
            required: true,
          },
          isActive: {
            type: Boolean,
            default: true,
          },
          isDeleted: {
            type: Boolean,
            default: false,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: {
            type: Date,
            default: null,
          },
        },
      ],
      assetCategories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AssetCategory",
        },
      ],
    },
  ],

  kycDetails: {
    companyKyc: [
      {
        name: String,
        documentLink: String,
        documentId: String,
        createdDate: Date,
        updatedDate: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    directorKyc: [
      {
        nameOfDirector: String,
        documents: [
          {
            name: String,
            documentLink: String,
            documentId: String,
            createdDate: Date,
            updatedDate: Date,
          },
        ],
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  companyName: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  companySize: {
    type: String,
    required: true,
  },

  companyWebsite: [
    {
      id: String,
      components: Object,
      style: Object,
      assets: Array,
    },
  ],
  companyCity: {
    type: String,
    required: true,
  },
  companyState: {
    type: String,
    required: true,
  },
  websiteURL: {
    type: String,
  },
  linkedinURL: {
    type: String,
  },
  employeeTypes: [
    {
      name: {
        type: String,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
      leavesCount: [
        {
          leaveType: {
            name: {
              type: String,
            },
            count: {
              type: Number,
              default: 0,
            },
          },
        },
      ],
    },
  ],
  workLocations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
    },
  ],
  leaveTypes: [
    {
      name: {
        type: String,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  ],
  shifts: [
    {
      name: {
        type: String,
      },
      startTime: {
        type: Date,
      },
      endTime: {
        type: Date,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  ],
  templates: [
    {
      name: {
        type: String,
        required: true,
      },
      documentLink: {
        type: String,
        required: true,
      },
      documentId: {
        type: String,
        required: true,
      },
    },
  ],
  policies: [
    {
      name: {
        type: String,
        required: true,
      },
      documentLink: {
        type: String,
        required: true,
      },
      documentId: {
        type: String,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  ],
  sop: [
    {
      name: {
        type: String,
        required: true,
      },
      documentLink: {
        type: String,
        required: true,
      },
      documentId: {
        type: String,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  ],
  agreements: [
    {
      name: {
        type: String,
        required: true,
      },
      documentLink: {
        type: String,
        required: true,
      },
      documentId: {
        type: String,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  ],
  totalMeetingCredits: {
    type: Number,
    default: 0,
  },
  meetingCreditBalance: {
    type: Number,
    default: 0,
  },
  complianceDocuments: [
    {
      name: String,
      documentLink: String,
      documentId: String,
      createdDate: Date,
      updatedDate: Date,
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

// Define the Company model
const Company = mongoose.model("Company", companySchema);

module.exports = Company;
