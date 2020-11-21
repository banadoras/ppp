//const extractImageList = require("./helper")
const fs = require("fs")
require("dotenv").config();
const express = require("express");
const app = express();
const formidable = require("formidable");
const mongoose = require("mongoose");
const passport = require("passport")
const session = require("express-session")
const bcrypt = require("bcrypt")
const LocalStrategy = require("passport-local").Strategy
const bodyParser = require("body-parser")
const passportLocalMongoose = require("passport-local-mongoose")
const multer = require("multer")
const upload = multer({ dest: "assets/" })
const form = formidable({
    multiples: true
});

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


const uri = "mongodb+srv://banadoras:" + process.env.DB_PASSWORD + "@cluster0.bocrh.mongodb.net/" + process.env.DATABASE + "?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}, error => {
    if (!error) {
        console.log("connected to Database");
    } else {
        console.log(error);
    }
})



const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    date: {
        type: String
    },
    image: Object
})
userSchema.plugin(passportLocalMongoose)
const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


const caseSchema = mongoose.Schema({
    title: String,
    description: String,
    images: Array,
    comments: [{
        user: userSchema,
        post: String,
        date: String
    }],
    user: userSchema,
    date: String
})
const Case = mongoose.model("Case", caseSchema);



app.get("/", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/admin", (req, res) => {
    User.find({}, (error, users) => {
        Case.find({}, (error, cases) => {
            res.render("admin", {
                users: users,
                cases: cases
            })
        })

    })
})

app.post("/uploadcase", (req, res) => {
    const form = formidable({
        multiples: true
    });
    form.parse(req, (error, fields, files) => {
        if (error) {
            console.log(error)
        } else {
            var images = extractImageList(files.images)
            User.findById(fields.currentUserID, (error, currentUser) => {
                const date = new Date()
                const addedCase = new Case({
                    title: fields.title,
                    description: fields.description,
                    images: images,
                    user: currentUser,
                    date: date.toLocaleString()
                })
                addedCase.save();
                res.redirect("/cases")
            })

        }
    })
})

app.get("/cases", (req, res) => {
    if (req.isAuthenticated()) {
        Case.find({}, (error, cases) => {
            if (!error) {
                Case.find({
                    user: req.user
                }, (error, userCases) => {
                    res.render("cases", {
                        cases: cases,
                        userCases: userCases,
                        user: req.user
                    });
                })

            } else {
                res.send(error);
            }
        })
    } else {
        res.send("Hello, sorry you are not authenticated")
    }

})


app.get("/cases/:id", (req, res) => {
    if (req.isAuthenticated()) {
        Case.findById(req.params.id, (error, selectedCase) => {
            if (!error) {
                res.render("caseDetails", {
                    selectedCase: selectedCase,
                    user: req.user
                })
            } else {
                res.send(error)
            }
        })
    } else {
        res.send("not authenticated")
    }
})

app.get("/cases/deleteCase/:id", (req, res) => {
    if (req.isAuthenticated()) {
        Case.findByIdAndDelete(req.params.id, (error, selectedCase) => {
            if (!error) {
                res.redirect("/cases")
            } else {
                res.send(error)
            }
        })
    } else {
        res.send("not authenticated")
    }
})

app.post("/register",upload.single("userImageFile"), (req, res) => {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const date = new Date()
    console.log(req.file)
     const userImages = extractImageList(req.file)

     User.register({
         username: req.body.username,
         date: date.toLocaleString(),
         name: req.body.name,
         email: req.body.email,
         image: userImages[0]
     }, req.body.password, (error, user) => {
         error ? console.log(error) : console.log(user.username)

         passport.authenticate("local")(req, res, () => {
             req.user = user;
             res.redirect("/cases")
         })

     })




})



app.post("/login", (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, (error) => {
        if (!error) {
            passport.authenticate("local")(req, res, () => {
                req.user = user;
                res.redirect("/cases")
            })
        }
    })
})

app.post("/comment", (req, res) => {
    Case.findById(req.body.currentCaseID, (error, currentCase) => {
        User.findById(req.body.currentUserID, (error, currentUser) => {
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const date = new Date()
            const comments = currentCase.comments.push({
                user: currentUser,
                post: req.body.post,
                date: date.toLocaleDateString(undefined, options) + ", " + date.toLocaleTimeString("en-us")
            })
            Case.updateOne({
                id: req.body.currentCaseID
            }, {
                comments: comments
            })
            currentCase.save()
            res.redirect("/cases/" + req.body.currentCaseID)
        })
    })
})

app.post("/updateUser", (req, res) => {
    User.findByIdAndUpdate({
        _id: req.body.currentUserID
    }, {
        username: req.body.username
    }, (error, result) => {
        if (!error) {
            req.logout()
            result ? res.redirect("/") : res.send("could not update information!")
        } else {
            res.send(error)
        }
    })
})


app.post("/delete", (req, res) => {
    User.findByIdAndDelete(req.body.userID, (error, deletedUser) => {
        if (!error) {
            if (req.body.deleteUserCases === "on") {
                Case.deleteMany({
                    user: deletedUser
                }, (error, result) => {
                    if (!error) {

                        res.redirect("/")
                    } else {
                        res.send(error)
                    }
                })
            } else {
                res.redirect("/login")
            }
        } else {
            res.send(error)
        }
    })
})

app.post("/logout", (req, res) => {
    req.logout()
    res.redirect("/")
})

app.listen(process.env.PORT || process.env.MY_PORT, () => {
    console.log("Listening to PORT 3000")
})


function extractImageList(files) {
    var finalList = [];
    if (Array.isArray(files)) {
        files.forEach(file => {
            const data = fs.readFileSync(file.path)
            const src = "data:" + file.type + ";base64," + Buffer.from(data).toString("base64");
            finalList.push({
                name: file.name,
                type: file.type,
                path: file.path,
                size: file.size,
                src: src
            })
        })
        console.log("Muliptle files extracted")

    } else {
        const data = fs.readFileSync(files.path)
        const src = "data:" + files.type + ";base64," + Buffer.from(data).toString("base64");
        finalList.push({
            name: files.name,
            type: files.type,
            path: files.path,
            size: files.size,
            src: src
        })
        console.log("Single file extracted")

    }

    return finalList;
}