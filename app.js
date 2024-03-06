require('dotenv').config()
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
// const crypto = require("crypto")
// const bcrypt = require('bcrypt')
// var saltRounds = 10
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const LocalStrategy = require('passport-local').Strategy

const app = express()
const port = 3000
var error_type =""
var error_desc =""
var button_val =""

app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("static"))

//cookie seesion code
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(session({
    secret: 'my liitle secret.',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true } 
}))

app.use(passport.initialize());
app.use(passport.session());
//

//Database connection
main().catch(err=>console.log(err))
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/userDB")
    //user Schema
    const userSchema= new mongoose.Schema({
        email:String,
        password:String
    })

    userSchema.plugin(passportLocalMongoose)

    const User = mongoose.model("User",userSchema)

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

//Home Route
app.get("/",(req,res)=>{
    res.render("home")
})

//Register Route
app.route("/register")
.get((req,res)=>{
    res.render("register")
})
.post((req,res)=>{
   let name=req.body.username
   let Password =req.body.password
   User.register(new User({username:name}),Password,(err,user)=>{
    if(err){
        // console.error(err)
        error_type="Account Already Exists!"
        error_desc="Please try to Login Using the Valid Credentials."
        button_val = "Login"
        res.redirect("/failure")
    }
    else{
        passport.authenticate("local")(req,res,()=>{
            // console.log("Registerd")
            res.redirect("/secrets")
        })
    }
   })
//    let hashedPassword = await bcrypt.hash(Password,saltRounds)
//    //
//    try {
//     User.find({email:name}).then(results=>{
//         if(results.length===0)
//         {
//             const user = new User({
//                 email:name,
//                 password:hashedPassword
//             })
//             user.save()
//             res.redirect("/")
//         }
//         else
//         {
//             error_type="Account Already Exists!"
//             error_desc="Please try to Login Using the Valid Credentials."
//             button_val = "Login"
//             res.redirect("/failure")
//         }
//     })  
//   } catch (error) {
//     // Handle any errors that occur during the database query
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
   //
})

//Login Route
app.route("/login")
.get((req,res)=>{
    res.render("login")
})
.post((req,res)=>{
    let userName = req.body.username
    let userPassword = req.body.password

    const user = new User({
        username:userName,
        password:userPassword
    })
    req.login(user,(err)=>{
        if(err){
            error_type = "Incorrect Password!"
            error_desc = "Oops! It seems like the password you entered is incorrect. Please double-check your password and try again."
            button_val = "Try Again"
            res.redirect("/failure")
        }else{
            passport.authenticate("local")(req,res,()=>{
            // console.log("LoggedIn")
            res.redirect("/secrets")
        })
     }
    })
    //here find will try to serach if the user is registerd or not
    // User.find({email:userName}).then(resul=>{
    //     if(resul.length===0)
    //     {
    //         error_type = "User Not Registerd!"
    //         error_desc="Uh-oh! It appears that the username or email you entered does not correspond to a registered account in our system. Please make sure you have entered the correct information or consider signing up for a new account if you haven't registered yet."
    //         button_val ="Register"
    //         res.redirect("/failure")
    //     }
    //     else{
    //         User.findOne({email:userName}).then(results=>{
    //             bcrypt.compare(userPassword, results.password).then(isValid=>{
    //                 if(isValid){
    //                     res.redirect("/secrets")
    //                 }
    //                 else{
    //                     error_type = "Incorrect Password!"
    //                     error_desc = "Oops! It seems like the password you entered is incorrect. Please double-check your password and try again."
    //                     button_val = "Try Again"
    //                     res.redirect("/failure")
    //                 } 
    //             }).catch(err=>{})   
    //         }).catch(err=>{})

    //     }
    // })
})

app.get('/logout',(req, res)=>{
    req.logout((err)=>{
        if (err) { return next(err); }
        // Redirect or respond after successful logout
        res.redirect('/');
    })
})


app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/login")
    }
})

app.get("/submit",(req,res)=>{
    res.render("submit")
})

app.get("/failure",(req,res)=>{
    res.render("failure",{errorType:error_type,error_msg:error_desc,buttonVal:button_val})
})
//WhispersWeb is  Listenning PORT
}
app.listen(process.env.PORT || port,()=>{
    console.log("WhispersWeb is Listening on PORT : "+port)
})