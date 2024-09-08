import Appointment from "../models/appointment.model";
import EventType from "../models/eventType.model";
import { AppError } from "../utils/AppError";

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
