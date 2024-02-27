require('dotenv').config()
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const crypto = require("crypto")
const app = express()
const port = 3000

app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("static"))

//Create Crypto Function  Here
const IV_LENGTH = 16; //Initisalation Vector for AES-256-CBC
//the secret key of user desired consists 32characters i.e combination of alphabets and numbers like below
//secret key="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
const secret_key = Buffer.from(process.env.SECRET,'utf-8') //here SECRET is a env varible of 32byte length situated in .env file
const aesKey = secret_key.slice(0,32)

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(aesKey), iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
  }
  
  function decrypt(text) {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts[0], 'hex')
    const encryptedText = Buffer.from(textParts[1], 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(aesKey), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  }

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
.post((req,res)=>{
   let name=req.body.username
   let encryptedPassword = encrypt(req.body.password)
   //
   try {
    User.find({email:name}).then(results=>{
        if(results.length===0)
        {
            const user = new User({
                email:name,
                password:encryptedPassword
            })
            user.save()
            res.redirect("/")
        }
        else
        {
            res.redirect("/login")
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
.post((req,res)=>{
    let userName = req.body.username
    let userPassword = req.body.password

    User.findOne({email:userName}).then(results=>{
        let decryptedPassword = decrypt(results.password)
        if(decryptedPassword===userPassword){
            res.redirect("/secrets")
        }
        else{
            res.send("<h2>Uh oh!☹ User Not Found!. Please Check your Deatils and Try Again</h2>")
        }
    }).catch(err=>{})
})

app.get("/secrets",(req,res)=>{
    res.render("secrets")
})

app.get("/submit",(req,res)=>{
    res.render("submit")
})
//WhispersWeb is  Listenning PORT
}
app.listen(process.env.PORT || port,()=>{
    console.log("WhispersWeb is Listening on PORT : "+port)
})