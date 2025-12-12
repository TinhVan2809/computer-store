require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
const arangojs = require('arangojs');
const aqlQuery = arangojs.aqlQuery;
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());


app.use(cors({
  origin: 'http://localhost:5173', // Adjust this to your frontend's origin
  credentials: true
}));
app.use(cookieParser());



// REGISTER
app.post("/register", (req, res) => {
    const {username, email, password, avata, phone, address, gender} = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
        "INSERT INTO users (username, email, password, phone, address, gender) VALUES (?, ?, ?, ?, ?, ?) ",
        [username, email, hashedPassword, avata, phone, address, gender],
        (err, result) => {
            if(err) return res.status(400).json({error: err});
            res.json({message: "User registered successfully!"});
        }
    );
});


// LOGIN 
app.post("/login", (req, res) => {
    const {email, password} = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, users) => {
            if(err) return res.status(500).json({error: err});

            if(users.length === 0) return res.status(400).json({message: "User not found"});

            const user = users[0];

            // check password
            const isMatch = bcrypt.compareSync(password, user.password);
            if(!isMatch) return res.status(400).json({ message: "Invalid password"});
            
            //creatd token
            const token = jwt.sign(
                {
                    id: user.user_id, 
                    username: user.username,
                    email: user.email,
                    avata: user.avata,
                    phone: user.phone,
                    role: user.role,
                    address: user.address
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            }).json({
                message: "Login success"
            });
        }
    );
})

// MIDDLEWARE AUTH 
function auth(req, res, next) {
    const token = req.cookies.token;

    if(!token) return res.status(401).json({message: "No token provided"});

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(401).json({message: "Invalid token"});

        req.user = decoded; // Save user infomation after decode
        next();
    });
}

// ROUTH 
app.get("/userData", auth, (req, res) => {
    res.json({
        message: "Access granted",
        user: req.user
    });
});

app.post("/logout", (req, res) => {
    res.clearCookie("token").json({ message: "Logout successful" });
});




app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);