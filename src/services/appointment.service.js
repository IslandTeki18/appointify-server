import { Appointment } from "../models/Appointment.js";
import { EventType } from "../models/EventType.js";
import { AppError } from "../utils/AppError.js";

const createAppointment = async (req, res, next) => {
  try {
    const { eventTypeId, startTime, attendee } = req.body;
    console.log("Received startTime:", startTime); // Debug log

    const eventType = await EventType.findById(eventTypeId);
    if (!eventType) {
      return next(new AppError("Event type not found", 404));
    }

    // Ensure startTime is treated as UTC
    const startDate = new Date(startTime);
    console.log("Parsed startDate:", startDate); // Debug log

    const endDate = new Date(startDate.getTime() + eventType.duration * 60000);
    console.log("Calculated endDate:", endDate); // Debug log

    // Check if the slot is still available
    const conflictingAppointment = await Appointment.findOne({
      eventType: eventTypeId,
      $or: [
        { startTime: { $lt: endDate, $gte: startDate } },
        { endTime: { $gt: startDate, $lte: endDate } },
      ],
      status: "scheduled",
    });

    if (conflictingAppointment) {
      return next(new AppError("This time slot is no longer available", 400));
    }

    const appointment = await Appointment.create({
      eventType: eventTypeId,
      host: eventType.user,
      attendee,
      startTime: startDate,
      endTime: endDate,
    });

    console.log("Created appointment:", appointment); // Debug log

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error in createAppointment:", error); // Debug log
    next(error);
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ host: req.user.id }).populate(
      "eventType"
    );
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, host: req.user.id },
      { status: "cancelled" },
      { new: true }
    );
    if (!appointment) {
      return next(new AppError("Appointment not found", 404));
    }
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

export { createAppointment, getAppointments, cancelAppointment };
