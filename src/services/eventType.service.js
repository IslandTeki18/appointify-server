import { EventType } from "../models/EventType.js";
import { Appointment } from "../models/Appointment.js";
import { AppError } from "../utils/AppError.js";
import moment from "moment-timezone";

const createEventType = async (req, res) => {
  try {
    const eventType = await EventType.create({
      ...req.body,
      user: req.user.id,
    });
    res.status(201).json(eventType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getEventTypes = async (req, res) => {
  try {
    const eventTypes = await EventType.find({});
    res.json(eventTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventType = async (req, res, next) => {
  try {
    const eventType = await EventType.findOne({
      _id: req.params.id,
    });
    if (!eventType) {
      return next(new AppError("Event type not found", 404));
    }
    res.json(eventType);
  } catch (error) {
    next(error);
  }
};

const updateEventType = async (req, res, next) => {
  try {
    const eventType = await EventType.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!eventType) {
      return next(new AppError("Event type not found", 404));
    }
    res.json(eventType);
  } catch (error) {
    next(error);
  }
};

const deleteEventType = async (req, res, next) => {
  try {
    const eventType = await EventType.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!eventType) {
      return next(new AppError("Event type not found", 404));
    }
    res.status(204).json({ message: "Event type deleted" });
  } catch (error) {
    next(error);
  }
};

const getAvailableDates = async (req, res, next) => {
  const eventType = await EventType.findById(req.params.id);
  if (!eventType) {
    return next(new AppError("Event type not found", 404));
  }

  const timezone = req.query.timezone || "UTC";
  let startDate, endDate;

  // Parse start date
  if (req.query.start && typeof req.query.start === "string") {
    startDate = moment.tz(req.query.start, timezone);
    if (!startDate.isValid()) {
      return next(new AppError("Invalid start date", 400));
    }
  } else {
    startDate = moment.tz(timezone); // Default to current date in the given timezone
  }

  // Parse end date
  if (req.query.end && typeof req.query.end === "string") {
    endDate = moment.tz(req.query.end, timezone);
    if (!endDate.isValid()) {
      return next(new AppError("Invalid end date", 400));
    }
  } else {
    // Default to 30 days from start date if not provided
    endDate = startDate.clone().add(30, "days");
  }

  // Ensure startDate is not after endDate
  if (startDate.isAfter(endDate)) {
    return next(new AppError("Start date cannot be after end date", 400));
  }

  const availabilityData = await generateAvailabilityData(
    eventType,
    startDate.toDate(),
    endDate.toDate(),
    timezone
  );
  res.json(availabilityData);
};

const getAvailableSlotsForDate = async (req, res, next) => {
  const eventType = await EventType.findById(req.params.id);
  if (!eventType) {
    return next(new AppError("Event type not found", 404));
  }
  const dateString = req.query.date;
  const timezone = req.query.timezone || "UTC";

  // Create a moment object in the user's timezone
  const userDate = moment.tz(dateString, timezone).startOf("day");

  if (!userDate.isValid()) {
    return next(new AppError("Invalid date or timezone", 400));
  }

  const availableSlots = await generateAvailableSlotsForDate(
    eventType,
    userDate,
    timezone
  );
  res.json(availableSlots);
};

async function generateAvailabilityData(
  eventType,
  startDate,
  endDate,
  timezone
) {
  const availableDates = [];
  const scheduledTimes = [];

  const appointments = await Appointment.find({
    eventType: eventType._id,
    startTime: { $gte: startDate, $lt: endDate },
    status: "scheduled",
  });

  for (
    let date = moment(startDate).tz(timezone);
    date.isBefore(moment(endDate).tz(timezone));
    date.add(1, "days")
  ) {
    const dayOfWeek = date.day();
    if (eventType.availability.days.includes(dayOfWeek)) {
      const slots = await generateAvailableSlotsForDate(
        eventType,
        date.clone(),
        timezone
      );
      if (slots.length > 0) {
        availableDates.push(date.format("YYYY-MM-DD"));
      }
    }

    const dateScheduled = appointments.filter(
      (apt) =>
        moment(apt.startTime).tz(timezone).format("YYYY-MM-DD") ===
        date.format("YYYY-MM-DD")
    );
    if (dateScheduled.length > 0) {
      scheduledTimes.push({
        date: date.format("YYYY-MM-DD"),
        times: dateScheduled.map((apt) => ({
          start: moment(apt.startTime).tz(timezone).format(),
          end: moment(apt.endTime).tz(timezone).format(),
        })),
      });
    }
  }

  return { availableDates, scheduledTimes };
}

async function generateAvailableSlotsForDate(eventType, userDate, timezone) {
  const availableSlots = [];

  const [startHour, startMinute] = eventType.availability.startTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = eventType.availability.endTime
    .split(":")
    .map(Number);

  // Set start and end times in the user's timezone
  const userDayStart = userDate
    .clone()
    .set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
  const userDayEnd = userDate
    .clone()
    .set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

  // Convert to UTC for database queries
  const utcDayStart = userDayStart.clone().tz("UTC");
  const utcDayEnd = userDayEnd.clone().tz("UTC");

  const bookedAppointments = await Appointment.find({
    eventType: eventType._id,
    startTime: { $gte: utcDayStart.toDate(), $lt: utcDayEnd.toDate() },
    status: "scheduled",
  });

  for (
    let time = moment(userDayStart);
    time.isBefore(userDayEnd);
    time.add(eventType.duration, "minutes")
  ) {
    const slotEnd = time.clone().add(eventType.duration, "minutes");
    const isBooked = bookedAppointments.some(
      (apt) =>
        (moment(apt.startTime).tz(timezone).isSameOrBefore(time) &&
          moment(apt.endTime).tz(timezone).isAfter(time)) ||
        (moment(apt.startTime).tz(timezone).isBefore(slotEnd) &&
          moment(apt.endTime).tz(timezone).isSameOrAfter(slotEnd))
    );

    if (!isBooked) {
      availableSlots.push({
        start: time.format(),
        end: slotEnd.format(),
      });
    }
  }

  return availableSlots;
}

export {
  createEventType,
  getEventTypes,
  getEventType,
  getAvailableDates,
  getAvailableSlotsForDate,
  updateEventType,
  deleteEventType,
};
