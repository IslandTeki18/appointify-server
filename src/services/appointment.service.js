import { Appointment } from "../models/Appointment.js";
import { EventType } from "../models/EventType.js";
import { AppError } from "../utils/AppError.js";

const createAppointment = async (req, res, next) => {
  try {
    const { eventTypeId, startTime, attendee } = req.body;
    const eventType = await EventType.findById(eventTypeId);
    if (!eventType) {
      return next(new AppError("Event type not found", 404));
    }
    const endTime = new Date(
      new Date(startTime).getTime() + eventType.duration * 60000
    );

    // Check if the slot is still available
    const conflictingAppointment = await Appointment.findOne({
      eventType: eventTypeId,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
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
      startTime,
      endTime,
    });
    res.status(201).json(appointment);
  } catch (error) {
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
