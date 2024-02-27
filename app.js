const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
const port = 3000

app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("static"))

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
   let userPassword = req.body.password
   //
   try {
    User.find({email:name}).then(results=>{
        if(results.length===0)
        {
            const user = new User({
                email:name,
                password:userPassword
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
        if(results.password===userPassword){
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