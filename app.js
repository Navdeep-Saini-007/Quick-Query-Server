require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dateObject = new Date();
const date = dateObject.getDate();
const Month = dateObject.getMonth();
const Year = dateObject.getFullYear();
const finalDate = month[Month] + " " + date.toString() + ", " + Year.toString();

/////////////////////////////PASSPORT//////////////////////////////////////////////////

// const session = require("express-session");
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const findOrCreate = require("mongoose-findorcreate");

////////////////////////////////////////////////////////////////////////////////////////

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// const corsOptions = {
//     origin: 'http://localhost:3000',
//     optionsSuccessStatus: 200,
//     credentials: true
// }
// app.use(cors(corsOptions));

///////////////////////////////PASSPORT/////////////////////////////////////////////////

// app.use(
//   session({
//     secret: "My project secret.",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

////////////////////////////////////////////////////////////////////////////////////////////

mongoose.connect("mongodb://localhost:27017/QuickQueryDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  userName: String,
  bio:String,
  branch:String,
  startYear:String,
  endYear:String,
  password: String,
  timeCreated: String,
});

////////////////////////////////////////MONGOOSE ENCRYPTION TRIAL.//////////////////////////////////

// userSchema.plugin(encrypt,{secret:process.env.LEVEL2,encryptedFields:["password"]});

////////////////////////////////////////////////////////////////////////////////////////////////////

// userSchema.plugin(passportLocalMongoose, { usernameField: "email" }); //email
// userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

// passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function (id, done) {
//   User.findById(id, function (err, user) {
//     done(err, user);
//   });
// });

///////////////////////////////////GOOGLE/////////////////////////////////

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:2900/auth/google/quick-query",
//     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       console.log(profile);
//       return cb(err, user);
//     });
//   }
// ));

//   app.get("/auth/google",passport.authenticate("google", {scope: ["profile"]}));

//   app.get('/auth/google/quick-query',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     // res.redirect('/');
//     console.log("auth/google/quick-query");
//   });

//////////////////////////////////////////////////////BCRYPT///////////////////////////////////////////////////////////////

app.route("/signup").post((req, res) => {
  try {
    console.log(req.body);
    const timeCreated = new Date();
    User.findOne({ email: req.body.email }, (err, foundUser) => {
      if (err) {
        res.send(err);
      } else if (foundUser) {
        res.send({already:true, ack: "User already registered." });
      } else {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
          const newUser = User({
            email: req.body.email,
            userName: req.body.fullName,
            password: hash,
            timeCreated: timeCreated,
          });
          newUser.save((err) => {
            if (err) {
              res.send(err);
            } else {
              res.send({
                userExisted: true,
                ok: "data added.",
                user:newUser
              });
            }
          });
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.send({ack:"Something went wrong"});
  }
});

/////////////////////////PASSPORT//////////////////////////////////////////////////////////

// app.route("/signup").post((req, res) => {
//   const timeCreated = new Date();
//   console.log(req.body);
//   User.findOne({ email: req.body.email }, (err, foundUser) => {
//     if (err) {
//       res.send(err);
//     } else if (foundUser) {
//       res.send({ already:true,acknowledgement: "User already registered." });
//     } else {
//       User.register(
//         {
//           email: req.body.email,
//           userName: req.body.fullName,
//           timeCreated: timeCreated,
//         },
//         req.body.password,
//         (err, user) => {
//           if (err) {
//             console.log(err);
//           } else {
//             passport.authenticate("local")(req, res, () => {
//               res.send({
//                 ok: "data added",
//                 user: req.user,
//                 userExisted: true,
//               });
//             });
//           }
//         }
//       );
//     }
//   });
// });

/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.route("/login").post((req, res) => {
  try{
    console.log(req.body);
    User.findOne({ email: req.body.email }, (err, foundUser) => {
      if (err) {
        res.send(err);
      } else if (foundUser) {
        bcrypt.compare(
          req.body.password,
          foundUser.password,
          function (err, result) {
            if (result === true) {
              res.send({ userExisted: true, user:foundUser });
            } else {
              res.send({ wrongPass: false, notUser:false, ack:"Wrong Password." });
            }
          }
        );
      } else {
        res.send({ notUser: true, wrongPass:true, ack: "User not registered." });
      }
    });
  }catch(err){
    console.log(err);
    res.send({ack:"Something went wrong."});
  }
});

////////////////////////////PASSPORT////////////////////////////////////////////////////////////

// app.route("/login").post((req, res, next) => {
//   console.log(req.body);
//   User.findOne({ email: req.body.email }, (err, foundUser) => {
//     if (err) {
//       console.log(err);
//     } else if (foundUser) {
//       const user = new User({
//         email: req.body.email,
//         password: req.body.password,
//       });
//       passport.authenticate("local", (err, user, info) => {
//         if (err) {
//           console.log(err);
//         }
//         if (!user) {
//           return res.send({ userExisted: false, ack: "Wrong password" });
//         }
//         req.logIn(user, (err) => {
//           if (err) {
//             console.log(err);
//           }
//           return res.send({ userExisted: true, user: req.user, oneMore: info });
//         });
//       })(req, res, next);
//     } else {
//       return res.send({ notUser: false, ack: "User not registered." });
//     }
//   });
// });

////////////////////////////////////////////////////////////////////////////////////////////////

app.route("/forgot")
  .post((req,res)=>{
    console.log(req.body);
    User.findOne({email:req.body.email},(err,foundUser)=>{
      if(err){
        console.log(err);
      }else if(foundUser){
         res.send({user:true,serverEmail:req.body.email});
      }else{
         res.send({user:false});
      }
    })
  })

  app.route("/newPassword")
    .patch((req,res)=>{
      console.log(req.body);
      User.findOne({email:req.body.storeEmail},(err,foundUser)=>{
        if(err){
          console.log(err);
        }else if(foundUser){
          bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            User.findByIdAndUpdate({_id:foundUser._id},{$set:{password:hash}},(err)=>{
              if(err){
                res.send({done:false,ack:"Something went wrong.",error:err});
              }else{
                res.send({done:true,ack:"got it"});
              }
            })
          })
        }else{
          res.send({done:false,ack:"User not found."});
        }
      })
    });

  app.route("/updateUser")
    .patch((req,res)=>{
      console.log(req.body);
      if(req.body.email=="" || req.body.fullName==""){
        req.body.email=req.body.userEmail,
        req.body.fullName=req.body.previousName
      }
      User.findOneAndUpdate(
        { email:req.body.userEmail },
        {
          $set: {
            email:req.body.email,
            userName:req.body.fullName,
            bio:req.body.bio,
            branch:req.body.branch,
            startYear:req.body.startYear,
            endYear:req.body.endYear
          },
        },
        (err) => {
          if (err) {
            console.log(err);
          } else {
            res.send({updated:true, ack: "userSchema updated." });
          }
        }
      );
    });

const questionSchema = new mongoose.Schema({
  questions: String,
  userName: String,
  // userID:Schema.Types.ObectId,
  branch:String,
  timeAsked: String,
  answers: [
    {
      answerByuser: String,
      userAnswered: String,
      userAnsweredid:String,
      timeAnswered: String,
      upVotes: Number,
      downVotes: Number,
    },
  ],
});

const Question = mongoose.model("Question", questionSchema);

app
  .route("/home")
  .get((req, res) => {
    Question.find({}, (err, foundData) => {
      if (err) {
        res.send(err);
      } else {
        res.send({ process: foundData, ack: "User authenticated" });
      }
    });
  })

  .post((req, res) => {
    console.log(req.body);
    const homeData = Question({
      questions: req.body.questions,
      userName: req.body.user,
      branch:req.body.branch,
      userId:req.body.userId,
      timeAsked: finalDate,
    });
    homeData.save((err) => {
      if (err) {
        res.send(err);
      } else {
        res.send({ ok: "data added." });
      }
    });
  })

  .patch((req, res) => {
    console.log(req.body);
    Question.findByIdAndUpdate(
      { _id: req.body.serverQuestionid },
      {
        $push: {
          answers: [
            {
              answerByuser: req.body.answers,
              userAnswered: req.body.userAnswered,
              userAnsweredid:req.body.userAnsweredid,
              timeAnswered: finalDate,
              upVotes: 0,
              downVotes: 0,
            },
          ],
        },
      },
      (err) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ ok: "answer added.", answerAdded: true });
        }
      }
    );
  });

  app.route("/homeOptions").post((req,res)=>{
    console.log(req.body);
    if(req.body.branch===""){
      Question.find({}, (err, foundData) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ process: foundData, ack: "User authenticated" });
        }
      });
    }else{
      Question.find({branch:req.body.branch}, (err, foundData) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ process: foundData, ack: "User authenticated" });
        }
      });
    }
  })

app.route("/answers").patch((req, res) => {
  console.log(req.body);
  Question.findOneAndUpdate(
    { "answers._id": req.body.answerId },
    {
      $set: {
        "answers.$.upVotes": req.body.upVotes,
        "answers.$.downVotes": req.body.downVotes,
      },
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ ack: "answer found." });
      }
    }
  );
});

const postSchema = new mongoose.Schema({
  post: String,
  user: String,
  userPostedid:String,
  timePosted: String,
  upVotes: Number,
  downVotes:Number,
  comments:[{
    comment:String,
    commentedBy:String
  }]
});

const Post = new mongoose.model("post", postSchema);

app
  .route("/post")
  .get((req, res) => {
    Post.find({}, (err, foundData) => {
      if (err) {
        res.send(err);
      } else {
        res.send({ process: foundData, ack: "User authenticated" });
      }
    });
  })

  .post((req, res) => {
    console.log(req.body);
    const postData = Post({
      post: req.body.post,
      user: req.body.user,
      timePosted: finalDate,
      upVotes:0,
      downVotes:0
    });
    postData.save((err) => {
      if (err) {
        console.log(err);
      } else {
        res.send({ ok: "data added." });
      }
    });
  })

  .patch((req, res) => {
    console.log(req.body);
    Post.findOneAndUpdate(
      { _id: req.body.postId },
      {
        $set: {
          upVotes: req.body.upVotes,
          downVotes: req.body.downVotes,
        },
      },
      (err) => {
        if (err) {
          console.log(err);
        } else {
          res.send({ ack: "like/dislike done." });
        }
      }
    );
  });

  app.route("/comment")
  .post((req, res) => {
    console.log(req.body);
    Post.find({_id:req.body.postId}, (err, foundData) => {
      if (err) {
        res.send(err);
      } else {
        res.send({ process: foundData, ack: "comments." });
      }
    });
  })

  .patch((req, res) => {
    console.log(req.body);
    Post.findByIdAndUpdate(
      { _id: req.body.postId },
      {
        $push: {
          comments: [
            {
              comment:req.body.comment,
              commentedBy:req.body.commentedBy
            },
          ],
        },
      },
      (err) => {
        if (err) {
          res.send(err);
        } else {
          res.send({ ok: "comment added.", commentAdded: true });
        }
      }
    );
  });

const contactSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  userMessage: String,
});

const Contact = mongoose.model("contactus", contactSchema);

app.route("/contact").post((req, res) => {
  console.log(req.body);
  const contactData = new Contact(req.body);
  contactData.save((err) => {
    if (err) {
      res.send(err);
    } else {
      res.send({ ok: "data added." });
    }
  });
});

app.route("/completeInfo")
  .post((req,res)=>{
    let questionsCount;
    let answersCount;
    let postsCount;
    console.log(req.body);
    Question.countDocuments({userName:req.body.profilePage},(err,totalCount)=>{
      if(err){
        console.log(err);
      }else if(totalCount){
        questionsCount=totalCount;
      }else{
        questionsCount=0;
      }
    })
    Question.countDocuments({"answers.userAnswered":req.body.profilePage},(err,answersTotalcount)=>{
      if(err){
        console.log(err);
      }else if(answersTotalcount){
        answersCount=answersTotalcount;
      }else{
        answersCount=0;
      }
    })
    Post.countDocuments({user:req.body.profilePage},(err,postsTotalcount)=>{
      if(err){
        console.log(err);
      }else if(postsTotalcount){
        postsCount=postsTotalcount;
        res.send({questions:questionsCount,answers:answersCount,posts:postsCount});
      }else{
        postsCount=0;
        res.send({questions:questionsCount,answers:answersCount,posts:postsCount});
      }
    })
  });

app.route("/questionInfo")
  .post((req,res)=>{
    console.log(req.body);
    Question.find({userName:req.body.profilePage},(err,foundDocs)=>{
      if(err){
        console.log(err);
      }else if(foundDocs){
        res.send({questionInfo:foundDocs});
      }else{
        res.send({questionInfo:"No questions asked."});
      }
    })
  });

  app.route("/answerInfo")
  .post((req,res)=>{
    console.log(req.body);
    Question.find({"answers.userAnswered":req.body.profilePage},(err,foundDocs)=>{
      if(err){
        console.log(err);
      }else if(foundDocs){
        res.send({answerInfo:foundDocs});
      }else{
        res.send({answerInfo:"No answers given."});
      }
    })
  });

  app.route("/postInfo")
  .post((req,res)=>{
    console.log(req.body);
    Post.find({user:req.body.profilePage},(err,foundDocs)=>{
      if(err){
        console.log(err);
      }else if(foundDocs){
        res.send({postInfo:foundDocs});
      }else{
        res.send({postInfo:"No posts."});
      }
    })
  });

// app.route("/logout").get((req, res) => {
//   req.logout();
//   res.send({ ack: req.user });
// });

app
  .route("/")
  .get((req, res) => {
    res.send("Hello.");
  })

  .post((req, res) => {
    console.log("Connected to React.");
    res.redirect("/");
  });

app.listen(process.env.PORT || 2900, () => {
  console.log("Backend running on port 2900.");
});
