const mongoose = require("mongoose");
const { DependentPhoneNumberInstance } = require("twilio/lib/rest/api/v2010/account/address/dependentPhoneNumber");

const userSchema = mongoose.Schema({
  name: {
    required: true,
    type: String,
    trim: true,
  },
  email: {
    required: true,
    type: String,
    trim: true,
    validate: {
      validator: (value) => {
        const re =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(re);
      },
      message: "Please enter a valid email address",
    },
  },
  password: {
    required: false,
    type: String,
  },
  phone: {
    required: false,
    type: String,
  },
  type: {
    type: String,
    default: "user",
  },
  googleId:{
type:String,
allowNull:true,
  },
 otpreceived:{
  type:String
 },

 otpSecret: { // New field for storing OTP secret
  type: String,
},

review:{
  type:String,
  allowNull:true,
},
timeRate:
{
type: Number
},
SkillExperienceRate:
{
  type: Number
},
CommunicationRate:
{
type: Number
},
ProfessionalismRate:
{
type: Number
},
qualityRate:
{
type: Number
},
coin:
{
  type:Number,
  default:0
},
purchasedCoin:
{
  type:Number,
  default:0
}
});

const User = mongoose.model("User", userSchema);
module.exports = User;
