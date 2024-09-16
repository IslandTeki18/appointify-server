import Joi from "joi";
import { AppError } from "../utils/AppError.js";

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return next(new AppError(errorMessage, 400));
    }
    next();
  };
};

export const validateRegistration = validateRequest(
  Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    timezone: Joi.string().required(),
  })
);

export const validateLogin = validateRequest(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
);

export const validateEventType = validateRequest(
  Joi.object({
    title: Joi.string().required(),
    duration: Joi.number().required(),
    description: Joi.string(),
    availability: Joi.object({
      days: Joi.array().items(Joi.number().min(0).max(6)).required(),
      startTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
      endTime: Joi.string()
        .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .required(),
    }).required(),
  })
);

export const validateAppointment = validateRequest(
  Joi.object({
    eventTypeId: Joi.string().required(),
    startTime: Joi.date().iso().required(),
    timezone: Joi.string().required(),
    attendee: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
    }).required(),
  })
);

export const validateUserUpdate = validateRequest(
  Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    timezone: Joi.string(),
  })
);
