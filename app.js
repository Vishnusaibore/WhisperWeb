require('dotenv').config()
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const crypto = require("crypto")
const bcrypt = require('bcrypt')
var saltRounds = 10
const app = express()
const port = 3000
var error_type =""
var error_desc =""
var button_val =""

app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("static"))

//Create Crypto Function  Here
//the secret key of user desired consists 32characters i.e combination of alphabets and numbers like below
//secret key="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"

//const secret_key = Buffer.from(process.env.SECRET,'utf-8') //here SECRET is a env varible of 32byte length situated in .env file
//const aesKey = secret_key.slice(0,32)
//const IV_LENGTH = 16 //Initisalation Vector for AES-256-CBC

// function encrypt(text) {
//     const iv = crypto.randomBytes(IV_LENGTH)
//     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(aesKey), iv)
//     let encrypted = cipher.update(text)
//     encrypted = Buffer.concat([encrypted, cipher.final()])
//     return iv.toString('hex') + ':' + encrypted.toString('hex')
//   }
  
//   function decrypt(text) {
//     const textParts = text.split(':')
//     const iv = Buffer.from(textParts[0], 'hex')
//     const encryptedText = Buffer.from(textParts[1], 'hex')
//     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(aesKey), iv)
//     let decrypted = decipher.update(encryptedText)
//     decrypted = Buffer.concat([decrypted, decipher.final()])
//     return decrypted.toString()
//   }

//Database connection
main().catch(err=>console.log(err))
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/userDB")
    //user Schema
    const userSchema=  mongoose.Schema({
        email:String,
        password:String
    })
    const User = mongoose.model("User",userSchema)

//Home Route
app.get("/",(req,res)=>{
    res.render("home")
})

//Register Route
app.route("/register")
.get((req,res)=>{
    res.render("register")
})
.post(async(req,res)=>{
   let name=req.body.username
   let Password =(req.body.password)
   let hashedPassword = await bcrypt.hash(Password,saltRounds)
   //
   try {
    User.find({email:name}).then(results=>{
        if(results.length===0)
        {
            const user = new User({
                email:name,
                password:hashedPassword
            })
            user.save()
            res.redirect("/")
        }
        else
        {
            error_type="Account Already Exists!"
            error_desc="Please try to Login Using the Valid Credentials."
            button_val = "Login"
            res.redirect("/failure")
        }
    })  
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
   //
})

//Login Route
app.route("/login")
.get((req,res)=>{
    res.render("login")
})
.post(async(req,res)=>{
    var userName = req.body.username
    var userPassword = req.body.password
    //here find will try to serach if the user is registerd or not
    User.find({email:userName}).then(resul=>{
        if(resul.length===0)
        {
            error_type = "User Not Registerd!"
            error_desc="Uh-oh! It appears that the username or email you entered does not correspond to a registered account in our system. Please make sure you have entered the correct information or consider signing up for a new account if you haven't registered yet."
            button_val ="Register"
            res.redirect("/failure")
        }
        else{
            User.findOne({email:userName}).then(results=>{
                bcrypt.compare(userPassword, results.password).then(isValid=>{
                    if(isValid){
                        res.redirect("/secrets")
                    }
                    else{
                        error_type = "Incorrect Password!"
                        error_desc = "Oops! It seems like the password you entered is incorrect. Please double-check your password and try again."
                        button_val = "Try Again"
                        res.redirect("/failure")
                    } 
                }).catch(err=>{})   
            }).catch(err=>{})

        }
    })
})


app.get("/secrets",(req,res)=>{
    res.render("secrets")
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