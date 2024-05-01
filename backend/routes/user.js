const express = require("express");
const router = express.Router();
const { z } = require("zod");
const { User } = require("../db.js");
const { Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const signupSchema = z.object({
  username: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(6),
});

/*------------------------------- signup route --------------------------------*/

router.post("/signup", async (req, res) => {
  // Validate input
  console.log(req.body);
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(411).json({
      message: "Incorrect inputs / Email already taken ",
    });
  }
  // check if user exists
  const ExistingUser = await User.findOne({ username: result.data.username });
  if (ExistingUser) {
    return res.status(411).json({
      message: "Email already taken",
    });
  }

  //create new user
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });
  const userId = user._id;

	/// ----- Create new account ------

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

		/// -----  ------

  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  res.json({
    message: "User created successfully",
    token: token,
  });
});

/*------------------------------- signin route --------------------------------*/

const signinBody = z.object({
  username: z.string().email(),
  password: z.string().min(6),
});

router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );

    res.json({
      token: token,
    });
    return;
  }

  res.status(411).json({
    message: "Error while logging in",
  });
});

/*------------------------------- update route --------------------------------*/

// Update user information route

const updateBody = z.object({
 // username: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(6).optional(),
});

router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Error while authentication",
    });
  }
  // Find the user by userId (attached by authMiddleware)
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(411).json({
      message: "Error while updating information",
    });
  }
  // Update the user's information
  if (req.body.password) {
    // Note: In a real application, you should hash the password before storing it
    user.password = req.body.password;
  }
  if (req.body.firstName) {
    user.firstName = req.body.firstName;
  }
  if (req.body.lastName) {
    user.lastName = req.body.lastName;
  }

  // Save the updated user information
  await user.save();

  // Send response
  res.status(200).json({
    message: "Updated successfully",
  });
});

/*------------------------------- get route --------------------------------*/

// Route to get users in bulk, filterable by firstName/lastName
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

// Perform a search in the database for users whose first name or last name matches the filter
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;
