import User from "../models/user.model";
import { AppError } from "../utils/AppError";

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export { getUserProfile, updateUserProfile };
