const express = require('express');
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchuser');
require('dotenv').config()


const JWT_SECRET = `${process.env.REACT_APP_JWT_SECRET}`;

//  Route 1: Create a user using: POST "/api/createUser" Doesn't require Auth

router.post('/createUser', [
    body('name', 'Name should be atleast 3 characters').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

    // If there are errors --> return Bad request  + errors
    let success = false;
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success, errors: errors.array() });

    try {

        // Check whether user with this email already exists.

        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ success, error: "User with same email already exists" });
        }

        const salt = await bcrypt.genSalt(10);

        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);

        success = true
        // return res.json(user);
        return res.json({ success, authToken });

    } catch (err) {

        console.log(err.message);
        return res.status(500).json("Internal Server Error");
    }

})

// Route 2: Authenticate a user using: POST "/api/login" Requires auth

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {


    let success = false;
    // If there are errors --> return Bad request  + errors

    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ success, errors: errors.array() });

    const { email, password } = req.body;

    try {

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Incorrect credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password)

        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Incorrect credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        success = true
        return res.json({ success, authToken });

    } catch (err) {

        console.log(err.message);
        return res.status(500).json("Internal Server Error");

    }
})

// Route 3: Get loggedIn user details using POST "/api/auth/getuser" --> Login required

router.post('/getuser', fetchUser, async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (err) {

        console.log(err.message);
        return res.status(500).json("Internal Server Error");

    }

});


// Route 4: Update name
// PUT route to update user's name by ID
router.put('/updatename/:id', fetchUser, async (req, res) => {
    try {
        // Extract the new name from the request body
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name cannot be empty' });
        }

        // console.log(req.body);
        const userId = req.user.id;

        // Create a new user object with the updated name
        const updatedUser = {
            name: name
        };

        // Update user's data in the database using async/await
        const updatedDoc = await User.findByIdAndUpdate(userId, updatedUser, { new: true });

        if (!updatedDoc) {
            return res.status(500).json({ error: 'Update failed' });
        }

        updatedDoc.password = null

        // console.log('Updated User:', updatedDoc);
        return res.status(200).json({ message: 'User name updated successfully', user: updatedDoc });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;