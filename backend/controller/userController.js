import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";

export const userRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, dob, gender, password, role, latitude, longitude } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !dob ||
    !gender ||
    !password ||
    !role ||
    !latitude ||
    !longitude
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User Already Registered!", 400));
  }
  user = await User.create({
    firstName,
    lastName,
    email,
    dob,
    gender,
    password,
    role,
    latitude,
    longitude
  });
  res.status(200).json({
    success: true,
    message: "User Registered!",
  })
});
