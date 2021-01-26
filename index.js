const express       = require('express'),
    app             = express();
    cors            = require('cors'),
    bodyParser      = require('body-parser'),
    passport        = require('passport'),
    http            = require('http'),
    mongoose        = require('mongoose'),
    { DB, PORT }    = require("./config"),
    {success,error} = require("consola");

//Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(passport.initialize());

require("./middleware/passport")(passport);


//Use Router Middleware
app.use('/api/users',require("./routes/users"));


//function to start my application
const startApp=async()=>{
    //Connect my application to database
    mongoose.connect(DB,{
        useNewUrlParser: true, 
        useUnifiedTopology: true , 
        useFindAndModify: true
    }).then(()=>
        success({
            message: `Database Connected \n${DB}`
        })
    ).catch((err)=>
        error({
            message: `Unable to connect with database\n${err}`
        })
    );   
    //Connect to server. 
    app.listen(PORT, ()=> 
        success({message: `Server running on PORT ${PORT}`})
    );
};
startApp();


