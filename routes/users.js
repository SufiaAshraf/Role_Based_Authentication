const router = require("express").Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json());

//Bring in user registration function
const { userRegister,userLogin,userAuth,serializeUser,checkRole } = require("../utils/auth");

//User creation
router.post("/register-user",async(req,res)=>{
    await userRegister(req.body,"user",res);
});

//Admin creation
router.post("/register-admin", async(req,res)=>{
    await userRegister(req.body,"admin",res);
});


//SuperAdmin creation
router.post("/register-superadmin", async(req,res)=>{
    await userRegister(req.body,"superadmin",res);
});


//Users login route
router.post("/login-user", async(req,res)=>{
    await userLogin(req.body,"user",res);
});


//Admin login route
router.post("/login-admin", async(req,res)=>{
    await userLogin(req.body,"admin",res);
});


//super admin login route
router.post("/login-superadmin", async(req,res)=>{
    await userLogin(req.body,"superadmin",res);
});


//Profile Route
router.get("/profile",userAuth, async(req,res)=>{
    return res.json(serializeUser(req.user));
});


//Users protected route(By users,admin,superadmin)
router.get(
    "/user-protected", 
    userAuth,
    checkRole(["user","admin","superadmin"]),
    async(req,res)=>{
        return res.json("hello User, you are accessible by admin and superadmin");
    }
);

//Admin protected route
router.get(
    "/admin-protected",
    userAuth,
    checkRole(["admin","superadmin"]), 
    async(req,res)=>{
        return res.json("Hello admin,you are also accessible by Superadmin");
    }
);


//super admin protected route
router.get(
    "/super-admin-protected",
    userAuth,
    checkRole(["superadmin"]) ,async(req,res)=>{
    return res.json("Hello superadmin, no one else can access you");
});



module.exports=router;