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


// Configure CORS using environment variables (FRONTEND_URL, ADMIN_URL)
// Fall back to common localhost origins for development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // allow non-browser tools or same-origin requests with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());



// REGISTER
app.post("/register", (req, res) => {

    const {username, email, password, phone, address, gender, birthday} = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
        "INSERT INTO users (username, email, password, phone, address, gender, birthday) VALUES (?, ?, ?, ?, ?, ?, ?) ",
        [username, email, hashedPassword, phone, address, gender, birthday],
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
        "SELECT u.*, COUNT(c.product_id) AS total_product FROM users u LEFT JOIN carts c ON c.user_id = u.user_id WHERE u.email = ? GROUP BY u.user_id",
        [email],
        (err, users) => {
            if(err) return res.status(500).json({error: err});

            if(users.length === 0) return res.status(400).json({message: "User not found"});

            const user = users[0];

            // check password
            const isMatch = bcrypt.compareSync(password, user.password);
            if(!isMatch) return res.status(400).json({ message: "Invalid password"});
                        
            //created token
            const token = jwt.sign(
                {
                    id: user.user_id, 
                    username: user.username,
                    email: user.email,
                    avata: user.avata,
                    phone: user.phone,
                    role: user.role,
                    address: user.address,
                    birthday: user.birthday,
                    total_product: user.total_product
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            // cookie options can be configured via env vars: COOKIE_DOMAIN and COOKIE_SAMESITE
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.COOKIE_SAMESITE || 'strict', // set 'none' for cross-site (must have secure=true)
                domain: process.env.COOKIE_DOMAIN || undefined,
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            };

            res.cookie("token", token, cookieOptions).json({
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
        user: req.user,
        product: req.product,
        env: req.env,
    });
});

app.post("/logout", (req, res) => {
    res.clearCookie("token", { domain: process.env.COOKIE_DOMAIN || undefined, path: '/' }).json({ message: "Logout successful" });
});

// API for provinces, districts, wards
app.get("/api/provinces", async (req, res) => {
    try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching provinces", error: error.message });
    }
});

app.get("/api/districts/:province_code", async (req, res) => {
    try {
        const { province_code } = req.params;
        const response = await fetch(`https://provinces.open-api.vn/api/p/${province_code}?depth=2`);
        const data = await response.json();
        res.json(data.districts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching districts", error: error.message });
    }
});

app.get("/api/wards/:district_code", async (req, res) => {
    try {
        const { district_code } = req.params;
        const response = await fetch(`https://provinces.open-api.vn/api/d/${district_code}?depth=2`);
        const data = await response.json();
        res.json(data.wards);
    } catch (error) {
        res.status(500).json({ message: "Error fetching wards", error: error.message });
    }
});


app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);