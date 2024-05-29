import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First Name Is Required!"],
    minLength: [3, "First Name Must Contain At Least 3 Characters!"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name Is Required!"],
    minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Email Is Required!"],
    validate: [validator.isEmail, "Provide A Valid Email!"],
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: [true, "Gender Is Required!"],
    enum: ["Male", "Female"],
  },
  password: {
    type: String,
    required: [true, "Password Is Required!"],
    minLength: [8, "Password Must Contain At Least 8 Characters!"],
    select: false,
  },
  role: {
    type: String,
    required: [true, "User Role Required!"],
    enum: ["Client", "Freelancer"],
  },
  latitude: { 
    type: Number, 
    required: true 
  },
  longitude: { 
    type: Number, 
    required: true 
  },
  profilePic: {
    public_id: { type: String, default: "default_profile" },
    url: { type: String, default: "https://example.com/default-profile.jpg" },
  },
  following: {
    type: Number,
    default: 0,
  },
  connections: {
    type: Number,
    default: 0,
  },
  recc: {
    type: Number,
    default: 0,
  },
  followersList: {
    type: Array,
    default: [],
  },
  followingList: {
    type: Array,
    default: [],
  },
  reccForList: {
    type: Array,
    default: [],
  },
  expenditure: {
    type: Array,
    default: [],
  },
  ratedBy: {
    type: Array,
    default: [],
  },
  reviews: {
    type: Array,
    default: [],
  },
  reviewsFor: {
    type: Array,
    default: [],
  },
  followersIDs: {
    type: Array,
    default: [],
  },
  followingIDs: {
    type: Array,
    default: [],
  },
  profileCompletion: {
    type: Number,
    default: 0,
  },
  numProjects: {
    type: Number,
    default: 0,
  },
  badges: {
    type: Array,
    default: [],
  },
  numBadges: {
    type: Number,
    default: 0,
  },
  coins: {
    type: Number,
    default: 0,
  },
  transactions: {
    type: Array,
    default: [],
  },
  spents: {
    type: Array,
    default: [],
  },
  earns: {
    type: Array,
    default: [],
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  totalEarned: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  workingProjects: {
    type: Array,
    default: [],
  },
  appliedProjects: {
    type: Array,
    default: [],
  },
  savedJobs: {
    type: Array,
    default: [],
  },
  reccByList: {
    type: Array,
    default: [],
  },
  notifications: {
    type: Array,
    default: [],
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  numRated: {
    type: Number,
    default: 0,
  },
  savedFreelancers: {
    type: Array,
    default: [],
  },
  jobs: {
    type: Array,
    default: [],
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export const User = mongoose.model("User", userSchema);
