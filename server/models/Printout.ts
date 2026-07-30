import { Schema, model, type Types } from "mongoose";

export interface IPrintout {
  takenBy: Types.ObjectId;
  takenAt: Date;
  location?: Types.ObjectId | null;
  unit: Types.ObjectId;
  clientModel: "CoworkingClient" | "Company";
  client: Types.ObjectId;
  requestedByModel: "CoworkingMember" | "UserData";
  requestedBy: Types.ObjectId;
  department?: Types.ObjectId | null;
  printoutCount: number;
  remark?: string;
}

const printoutSchema = new Schema<IPrintout>(
  {
    takenBy: {
      type: Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    takenAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Building",
      default: null,
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    clientModel: {
      type: String,
      enum: ["CoworkingClient", "Company"],
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      refPath: "clientModel",
      required: true,
    },
    requestedByModel: {
      type: String,
      enum: ["CoworkingMember", "UserData"],
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      refPath: "requestedByModel",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    printoutCount: {
      type: Number,
      required: true,
      min: 1,
    },
    remark: {
      type: String,
    },
  },
  { timestamps: true },
);

printoutSchema.index({ takenAt: -1 });
printoutSchema.index({ location: 1, takenAt: -1 });
printoutSchema.index({ unit: 1, takenAt: -1 });
printoutSchema.index({ client: 1, takenAt: -1 });
printoutSchema.index({ requestedBy: 1, takenAt: -1 });

export default model<IPrintout>("Printout", printoutSchema);
