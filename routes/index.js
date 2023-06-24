var express = require("express");
const passport = require("passport");
var router = express.Router();
const userModel = require("./users");
const sendMail = require("../nodemailer");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", redirecttoprofile, function (req, res, next) {
  res.render("index");
});

router.get("/profile", isloggedIn, async function (req, res, next) {
  const loggedinuser = await userModel
    .findOne({ username: req.session.passport.user })
    .then(function (founduser) {
      res.render("profile", { founduser });
    });
});

router.get("/reg", function (req, res) {
  res.render("register");
});

router.get("/forgot", function (req, res) {
  res.render("forgot");
});

router.get("/reset/password/:id/:otp", function (req, res) {
  userModel.findOne({ _id: req.params.id })
  .then(function(user) {
    if (user.expiresAt < Date.now()) {
      res.send("sorry your otp is expired");
    } else {
      if (user.otp === req.params.otp) {
        res.render("resetpage", { user });
      }
    }
  });
});

router.post("/setpassword/:id", async function (req, res) {
  let user = await userModel.findOne({ _id: req.params.id });
  if (req.body.password === req.body.confpassword) {
    user.setPassword(req.body.password, async function (err, userr) {
      await user.save();
      res.send("password changed!");
    });
  }
});

router.post("/reg", async function (req, res) {
  let userData = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });
  userModel
    .register(userData, req.body.password)
    .then(function (createduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(function (err) {
      res.send(err);
    });
});

router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  }),
  function (req, res, next) {}
);

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) throw err;
    res.redirect("/");
  });
});

router.post("/reset", async function (req, res) {
  let user = await userModel.findOne({ email: req.body.email });
  if (user) {
    let rn = Math.floor(Math.random() * 10000000);
    sendMail(user.email, rn, user._id).then(async function () {
      user.otp = rn;
      user.expiresAt = Date.now() + 24*60*60*1000;
      await user.save();
      res.send("Please check your email and spam for further directions");
    });
  } else {
    res.send("nahi hai");
  }
});

function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}
function redirecttoprofile(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/profile");
  } else {
    return next();
  }
}

module.exports = router;
