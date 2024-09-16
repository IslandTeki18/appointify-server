import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema({
  eventType: {
    type: Schema.Types.ObjectId,
    ref: "EventType",
    required: true,
  },
  host: { type: Schema.Types.ObjectId, ref: "User", required: true },
  attendee: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  timezone: { type: String, required: true },
  status: {
    type: String,
    enum: ["scheduled", "cancelled"],
    default: "scheduled",
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export { Appointment };
