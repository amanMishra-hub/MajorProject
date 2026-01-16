const express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user.js");
const passport = require("passport");
const userController = require("../controllers/user.js");
const user = require("../models/user.js");



router
.route("/signup")
// GET signup form
.get(userController.signupForm)
// POST signup - register new user
.post( userController.registerNewUser);



router
.route("/login")
// GET login form
.get( userController.loginForm)

// POST login
.post( passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
}),userController.postLoginForm);

router.get("/logout", userController.logout);

module.exports = router;