import mongoose, { Schema } from "mongoose";

const eventTypeSchema = new Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  description: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  availability: {
    days: [{ type: Number, enum: [0, 1, 2, 3, 4, 5, 6] }],
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
});

const EventType = mongoose.model("EventType", eventTypeSchema);

export { EventType };