
const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/auth/register", async (req, res) => {
    console.log("Request register Body:", req.body);
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPass,
        });

        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});


//LOGIN
router.post("/auth/login", async (req, res) => {
    console.log("Request login Body:", req.body);
    const inputPassword = req.body.password;
    // console.log("user password ", inputPassword)

    try {
        const email = await User.findOne({ email: req.body.email });
        // console.log("email ", email)

        if (!email) {
            console.log("User not found");
            res.status(400).json("Wrong credentials!");
            return;
        }

        const storedHashedPassword = email.password;
        // console.log("stored hashed password:", email.password);

        // Use bcrypt.compare to compare the plain text password with the stored hashed password
        bcrypt.compare(inputPassword, storedHashedPassword, (err, result) => {
            if (err) {
                console.error("Error during password validation:", err);
                res.status(500).json("Internal Server Error");
                return;
            }

            if (!result) {
                console.log("Invalid password");
                res.status(400).json("Wrong credentials!");
                return;
            }

            const { password, ...others } = email._doc;
            console.log("Login successful");
            res.status(200).json(others);
        });

    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json("Internal Server Error");
    }

});



module.exports = router;

