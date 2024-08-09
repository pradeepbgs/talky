import {User} from '../model/user.model.js'

const registerUser = async (req,res) => {
    const {email, username, password } = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(409).json({ message: "User already exists with this username or email" });
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url ?? "",
    coverImage: coverImage?.url ?? "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    return res.status(400).json({ message: "User not created, something went wrong while creating user" });
  }

  return res.status(200).json(new apiResponse(200, createdUser, "User created successfully"));

}

const loginUser = async () => {

    const {username, email, password} = req.body
    if(!(username || email)){
      res.status(400).json({message: "Username or email is required"})
      throw new apiError(400,"Username or email is required")
    }

    const user = await User.findOne({
      $or: [{email}, {username}]
    })

    if(!user){
      res.status(404).json({message: "User not found"})
      throw new apiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
      return res
      .status(401)
      .json({
        message: "invalid user password"
    })
    }

   const {accesToken, refreshToken} =  await generateAccessAndRefreshToken(user?._id)

   const loggedInUser = await User.findById(user._id)
   .select("-password -refreshToken")

   const options = {
     httpOnly: true,
     secure: true,
     sameSite: "none",  
   }

   return res.status(200)
   .cookie("accessToken", accesToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new apiResponse(
      200, 
      {
        user: loggedInUser,
        accessToken: accesToken,
        refreshToken: refreshToken,
      },
      "User logged in successfully"
    )
   )
}


export {
    registerUser,
    loginUser,
}