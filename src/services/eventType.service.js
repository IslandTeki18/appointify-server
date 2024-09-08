import EventType from "../models/eventType.model";
import { AppError } from "../utils/AppError";

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
    const eventTypes = await EventType.find({ user: req.user.id });
    res.json(eventTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventType = async (req, res, next) => {
  try {
    const eventType = await EventType.findOne({
      _id: req.params.id,
      user: req.user.id,
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
    res.status(204).json(null);
  } catch (error) {
    next(error);
  }
};

export {
  createEventType,
  getEventTypes,
  getEventType,
  updateEventType,
  deleteEventType,
};
