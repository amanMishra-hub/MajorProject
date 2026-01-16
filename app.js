if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");





const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");  
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
const dburl = process.env.ATLAS_DB_URL;

const store = MongoStore.create({
        mongoUrl: dburl,
        touchAfter: 24 * 3600,
        crypto: {
            secret : process.env.SECRET,
        } });

const sessionOption = {
    store : store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
    };

    

    store.on("error", function(e){
        console.log("Session store error", e);
    });

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.get('/', (req, res) => {
    res.render('home.ejs');
});

main()
.then(() => {
    console.log("MongoDB connection successful");
    
    app.listen(8080, () => {
        console.log('Server is running on port 8080');
    });
})
.catch(err => {
    console.error("MongoDB connection failed. Please start MongoDB service.");
    console.log("App will continue running without database functionality.");
    
    app.listen(8080, () => {
        console.log('Server is running on port 8080 (without database)');
    });
});

async function main() {
    try {
        await mongoose.connect(dburl, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Connected to MongoDB Atlas");
        console.log("Database:", mongoose.connection.name);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        throw error;
    }
}

app.use((req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    console.error("Error caught:", err);
    res.status(statusCode).render("error", { message });
});

