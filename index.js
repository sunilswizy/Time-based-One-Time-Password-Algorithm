const express = require("express");
const speakeasy = require("speakeasy");

const app = express();
app.use(express.json())

const users = {}

app.post('/register', (req, res) => {
    const { email } = req.body;

    if(!email || users[email]) return res.send("Invalid Email or Email already found");

    const secret = speakeasy.generateSecret(20);
    users[email] = secret.base32; 

    res.send("User Registered");
});

app.post("/get/otp", (req, res) => {
    const { email } = req.body;
    if (!email || !users[email]) return res.send("Invalid Email or Email not found");

    const otp = speakeasy.totp({
        secret: users[email],
        encoding: 'base32',
        step: 30
    });

    res.json({
        email,
        otp
    });
});

app.post("/verify/otp", (req, res) => {
    const { email, otp } = req.body;
    if (!email || !users[email]) return res.send("Invalid Email or Email already found");
    if(!otp) return res.send("OTP Required")
    
    const isValid = speakeasy.totp.verify({
        secret: users[email],
        encoding: 'base32',
        token: otp,
        window: 1
    });

    if(!isValid) return res.status(400).json({ message: "Invalid or Expired OTP" });

    res.json("OTP Verified successfully");
});


app.listen(3000, () => {
    console.log("App is running on 3000")
});