const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

//! User Registration

const usersController = {
  //! Register
  register: expressAsyncHandler(async (req, res) => {
    const {username, email, password} = req.body;
    console.log(req.body);
  // validate
  if (!username || !email || !password) {
    throw new Error("Please all fields are required")
  }
  // Check if user already exit
  const userExists = await User.findOne({ email }); // This should be await to do find elemnts in collection
  if (userExists) {
  throw new Error("User already exists");
}
  // Hash User password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // Create user and Save info
  const userCreated = await User.create({
    email,
    username,
    password : hashedPassword,
  });

    res.json({
      username: userCreated.username,
      email: userCreated.email,
      id: userCreated._id
    });
  }),
  // Login Controller
  //! Register
  login: expressAsyncHandler(async (req, res) => {
    // Get user Data
    // res.json({
    //   mess:"success"
    // })
    const {email, password} = req.body;
    // check if email is valid
    const user = await User.findOne({email});
    if (!user){
      throw new Error("Invalid login credentials");
    };
    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid login credentials");
    };
    // Generate token
    const token = jwt.sign({id: user._id}, "Phucjun",{expiresIn:"30d"});

    res.json({
      message: "Success login",
      token,
      id: user._id,
      email: user.email,
      username: user.username,
    })                                                         
  }),
  // Profile user
  profile : expressAsyncHandler(async(req, res) => {
    //Check user
    const user = await User.findById(req.user);
    if (!user){
      throw new Error("User not Found")
    };
    // Send response
    res.json({
      username: user.username,
      email: user.email,
    })
  }),
  //Update password
  changeUserPassword: expressAsyncHandler(async(req, res) =>{
    const {newPassword} = req.body
    //Find the Users
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error("User not Found");
    }
    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    user.password = newPasswordHash;
    // resave
    await user.save() // very important, we usually miss this one
    // Update Db
    //await User.updateOne()
    // send response
    res.json({message: "Password change successfully"})
  }),

  //Update profile
  changeUserProfile: expressAsyncHandler(async(req, res) =>{
    const {email, username} = req.body;
    //Find the Users and Update Db
    const userUpdated = await User.findByIdAndUpdate(req.user,
      {
      email, username
    }, 
    {
      new: true,
    });
    // send response
    res.json({message: "Profile change successfully", userUpdated });
  }),
    
};



module.exports = usersController;
