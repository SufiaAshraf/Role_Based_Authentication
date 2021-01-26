const bcrypt      = require("bcryptjs"),
      jwt         = require("jsonwebtoken"),
      User        = require("../models/user"),
      bodyParser  = require("body-parser"),
      passport    = require("passport"),
      { SECRET }  = require("../config");

//To register the user Manager,Admin,Super_Admin
const userRegister = async( userDet, role, res)=>{
    try{
        //Validate the username
        let usernameNotTaken = await validateUserName(userDet.username);
        if(!usernameNotTaken){
            return res.status(400).json({
                message:`Username is already taken`,
                success: false
            });
        }

        //validate phone
        let phoneNotRegistered = await validatePhone(userDet.phone);
        if(!phoneNotRegistered){
            return res.status(400).json({
                message:`This phone number is already registered`,
                success: false
            });
        }

        //Get the hashed password to register user
        const password = await bcrypt.hash(userDet.password, 12);
        //create new user
        const newUser = new User({
            ...userDet,
            password,
            role
        });
        await newUser.save();
        return res.status(201).json({
            message: "New user has been successfully registered.Please Login now",
            success: true
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Unable to create account",
            success: false
        });
    }
};

//FUNCTION FOR LOGIN LOGIC
const userLogin = async (UserCreds,role,res)=>{
    let {username , password }=UserCreds;
    const user = await User.findOne({ username });
    if(!user){
        return res.status(404).json({
            message: "Username is not found, invalid credentials",
            success: false
        });
    }

    //Check the role
    if(user.role!==role){
        return res.status(403).json({
            message: "Please make sure you are logging in from right portal",
            success: false
        });
    }
    let isMatch = await bcrypt.compare(password,user.password);
    if(isMatch){
        let token = jwt.sign(
            {
                user_id: user._id,
                role: user.role,
                username: user.username,
                phone: user.phone
            },
            SECRET,
            {expiresIn:"7 days"}
        );
        let result = {
            username: user.username,
            role: user.role,
            phone: user.phone,
            token: `Bearer ${token}`,
            expiresIn: 168
        };
        return res.status(200).json({
            ...result,
            message: "You have been Successfully logged in",
            success: true
        });
    }else{
        return res.status(403).json({
            message: "Incorrect password",
            success: false
        });
    }
};

const validateUserName = async username => {
    let user = await User.findOne({username});
    return user?false:true;
};

//Passport middle ware to maintain hirerarchy 
const userAuth = passport.authenticate("jwt", { session: false});

//CHECK ROLE BASED AUTHENTICATION
const checkRole = roles =>(req,res,next)=>
    !roles.includes(req.user.role)
        ?res.status(401).json("Unauthorized")
        :next();

    
const validatePhone = async phone => {
    let user = await User.findOne({ phone });
    return user?false:true;
};

const serializeUser = user =>{
    return{
        username: user.username,
        phone : user.phone,
        name: user.name,
        role: user.role,
        _id: user._id,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt
    };
};

module.exports={
    userRegister,
    userLogin,
    userAuth,
    serializeUser,
    checkRole
};