import { EventType } from "../models/EventType.js";
import { Appointment } from "../models/Appointment.js";
import { AppError } from "../utils/AppError.js";

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

  let startDate;
  let endDate;

  // Parse start date
  if (req.query.start && typeof req.query.start === "string") {
    startDate = new Date(req.query.start);
    if (isNaN(startDate.getTime())) {
      return next(new AppError("Invalid start date", 400));
    }
  } else {
    startDate = new Date(); // Default to current date if not provided
  }

  // Parse end date
  if (req.query.end && typeof req.query.end === "string") {
    endDate = new Date(req.query.end);
    if (isNaN(endDate.getTime())) {
      return next(new AppError("Invalid end date", 400));
    }
  } else {
    // Default to 30 days from start date if not provided
    endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  // Ensure startDate is not after endDate
  if (startDate > endDate) {
    return next(new AppError("Start date cannot be after end date", 400));
  }

  const availabilityData = await generateAvailabilityData(
    eventType,
    startDate,
    endDate
  );
  res.json(availabilityData);
};

const getAvailableSlotsForDate = async (req, res, next) => {
  const eventType = await EventType.findById(req.params.id);
  if (!eventType) {
    return next(new AppError("Event type not found", 404));
  }
  // Parse the date string and create a Date object in UTC
  const dateString = req.query.date; // Expecting format: "YYYY-MM-DD"
  const [year, month, day] = dateString.split("-").map(Number);

  // Create date object (Note: month is 0-indexed in JavaScript Date)
  const date = new Date(Date.UTC(year, month - 1, day));

  console.log(date); // This should now log the correct date

  if (isNaN(date.getTime())) {
    return next(new AppError("Invalid date", 400));
  }

  const availableSlots = await generateAvailableSlotsForDate(eventType, date);
  res.json(availableSlots);
};

async function generateAvailabilityData(eventType, startDate, endDate) {
  const availableDates = [];
  const scheduledTimes = [];

  const appointments = await Appointment.find({
    eventType: eventType._id,
    startTime: { $gte: startDate, $lt: endDate },
    status: "scheduled",
  });

  for (
    let date = new Date(startDate);
    date < endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const currentDate = new Date(date); // Create a new Date object to avoid modifying the loop variable
    const dayOfWeek = currentDate.getDay();
    if (eventType.availability.days.includes(dayOfWeek)) {
      const slots = await generateAvailableSlotsForDate(
        eventType,
        currentDate,
        appointments
      );
      if (slots.length > 0) {
        availableDates.push(currentDate.toISOString().split("T")[0]);
      }
    }

    // Add scheduled times for this date
    const dateScheduled = appointments.filter(
      (apt) =>
        apt.startTime.toISOString().split("T")[0] ===
        currentDate.toISOString().split("T")[0]
    );
    if (dateScheduled.length > 0) {
      scheduledTimes.push({
        date: currentDate.toISOString().split("T")[0],
        times: dateScheduled.map((apt) => ({
          start: apt.startTime.toISOString(),
          end: apt.endTime.toISOString(),
        })),
      });
    }
  }

  return { availableDates, scheduledTimes };
}

async function generateAvailableSlotsForDate(eventType, date) {
  const availableSlots = [];
  const dayStart = new Date(date);
  const dayEnd = new Date(date);

  const [startHour, startMinute] = eventType.availability.startTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = eventType.availability.endTime
    .split(":")
    .map(Number);

  dayStart.setHours(startHour, startMinute, 0, 0);
  dayEnd.setHours(endHour, endMinute, 0, 0);

  const bookedAppointments = await Appointment.find({
    eventType: eventType._id,
    startTime: { $gte: dayStart, $lt: dayEnd },
    status: "scheduled",
  });

  for (
    let time = new Date(dayStart);
    time < dayEnd;
    time.setMinutes(time.getMinutes() + eventType.duration)
  ) {
    const slotEnd = new Date(time.getTime() + eventType.duration * 60000);
    const isBooked = bookedAppointments.some(
      (apt) =>
        (apt.startTime <= time && apt.endTime > time) ||
        (apt.startTime < slotEnd && apt.endTime >= slotEnd)
    );

    if (!isBooked) {
      availableSlots.push({
        start: time.toISOString(),
        end: slotEnd.toISOString(),
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
