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
            if(!isMatch) return res.status(400).json({ message: "Invalid password! Check your password of contact Administrator."});
                        
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

// ============ ORDER APIS ============

// CREATE ORDER
app.post("/orders", auth, (req, res) => {
    const { items, totalAmount, shippingFee, voucherId, recipientName, recipientPhone, provinceName, districtName, wardName, specificAddress, userAddressId } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "Order must have at least one item" });
    }

    // Create order
    db.query(
        "INSERT INTO orders (user_id, status, shipping_fee, total_amount, voucher_id, recipient_name, recipient_phone, province_name, district_name, ward_name, specific_address, user_address_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, "pending", shippingFee, totalAmount, voucherId || null, recipientName, recipientPhone, provinceName, districtName, wardName, specificAddress, userAddressId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const orderId = result.insertId;
            let itemsProcessed = 0;

            // Helper function to send final response
            const sendFinalResponse = () => {
                const notificationContent = "Bạn đã đặt hàng thành công.";
                db.query(
                    "INSERT INTO notifications (user_id, order_id, content) VALUES (?, ?, ?)",
                    [userId, orderId, notificationContent],
                    (notificationErr) => {
                        if (notificationErr) {
                            console.error("Error inserting notification:", notificationErr);
                            // Even if notification fails, the order was created.
                            // Send a success response for the order but log the notification error.
                            // A more robust system might try to re-queue this notification.
                            res.status(201).json({
                                message: "Order created, but notification failed.",
                                order_id: orderId,
                                status: "pending"
                            });
                        } else {
                            // All good, send the final success response
                            res.status(201).json({
                                message: "Order created successfully",
                                order_id: orderId,
                                status: "pending"
                            });
                        }
                    }
                );
            };

            // If there are no items, which is checked before, but as a safeguard
            if (items.length === 0) {
                sendFinalResponse();
                return;
            }
            
            // Insert order items
            items.forEach((item) => {
                db.query(
                    "INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)",
                    [orderId, item.product_id, item.product_name, item.quantity, item.price],
                    (itemErr) => {
                        if (itemErr) {
                            // If an item fails, we should ideally roll back the transaction.
                            // Since we aren't using transactions here, we'll log the error.
                            // And we will stop further processing for this request.
                            console.error("Error inserting order item:", itemErr);
                            // Avoid sending multiple error responses
                            if (!res.headersSent) {
                                return res.status(500).json({ error: "Failed to save order items." });
                            }
                        }
                        
                        itemsProcessed++;

                        // When all items have been processed
                        if (itemsProcessed === items.length) {
                           sendFinalResponse();
                        }
                    }
                );
            });
        }
    );
});

// GET USER ORDERS
app.get("/orders", auth, (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    db.query(
        "SELECT COUNT(*) as total FROM orders WHERE user_id = ?",
        [userId],
        (err, countResult) => {
            if (err) return res.status(500).json({ error: err.message });

            const total = countResult[0].total;

            // Get orders with pagination
            db.query(
                "SELECT o.*, p.* FROM orders o LEFT JOIN payments p ON o.order_id = p.order_id WHERE o.user_id = ? ORDER BY o.created_at DESC LIMIT ? OFFSET ?",
                [userId, limit, offset],
                (err, orders) => {
                    if (err) return res.status(500).json({ error: err.message });

                    if (orders.length === 0) {
                        return res.json({
                            orders: [],
                            pagination: {
                                total,
                                page,
                                limit,
                                pages: Math.ceil(total / limit)
                            }
                        });
                    }

                    // For each order, fetch order-items with product details and images
                    let completed = 0;
                    const ordersWithDetails = [];

                    orders.forEach((order, idx) => {
                        db.query(
                            "SELECT oi.*, p.* FROM order_items oi INNER JOIN products p ON p.product_id = oi.product_id WHERE oi.order_id = ?",
                            [order.order_id],
                            (err, items) => {
                                if (err) {
                                    ordersWithDetails[idx] = { ...order, items: [] };
                                } else {
                                    ordersWithDetails[idx] = { ...order, items };
                                }
                                completed++;

                                if (completed === orders.length) {
                                    res.json({
                                        orders: ordersWithDetails,
                                        pagination: {
                                            total,
                                            page,
                                            limit,
                                            pages: Math.ceil(total / limit)
                                        }
                                    });
                                }
                            }
                        );
                    });
                }
            );
        }
    );
});

// GET ORDER DETAIL
app.get("/orders/:order_id", auth, (req, res) => {
    const { order_id } = req.params;
    const userId = req.user.id;

    db.query(
        "SELECT * FROM orders WHERE order_id = ? AND user_id = ?",
        [order_id, userId],
        (err, orders) => {
            if (err) return res.status(500).json({ error: err.message });
            if (orders.length === 0) return res.status(404).json({ error: "Order not found" });

            const order = orders[0];

            // Get order items with product details and images
            db.query(
                "SELECT oi.*, p.* FROM order_items oi INNER JOIN products p ON p.product_id = oi.product_id WHERE oi.order_id = ?",
                [order_id],
                (err, items) => {
                    if (err) return res.status(500).json({ error: err.message });

                    db.query(
                        "SELECT * FROM payments WHERE order_id = ?",
                        [order_id],
                        (err, payments) => {
                            if (err) return res.status(500).json({ error: err.message });

                            // Lấy voucher nếu có
                            if (order.voucher_id) {
                                db.query(
                                    "SELECT * FROM vouchers WHERE voucher_id = ?",
                                    [order.voucher_id],
                                    (err, voucherRows) => {
                                        if (err) return res.status(500).json({ error: err.message });
                                        res.json({
                                            order,
                                            items,
                                            payment: payments[0] || null,
                                            voucher: voucherRows[0] || null
                                        });
                                    }
                                );
                            } else {
                                res.json({
                                    order,
                                    items,
                                    payment: payments[0] || null,
                                    voucher: null
                                });
                            }
                        }
                    );
                }
            );
        }
    );
});

// UPDATE ORDER STATUS
app.put("/orders/:order_id", auth, (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'shipped', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    db.query(
        "UPDATE orders SET status = ? WHERE order_id = ? AND user_id = ?",
        [status, order_id, userId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Order not found" });

            res.json({ message: "Order status updated successfully", status });
        }
    );
});

// CREATE PAYMENT
app.post("/payments", auth, (req, res) => {
    const { order_id, amount, provider, transaction_code, status } = req.body;

    db.query(
        "INSERT INTO payments (order_id, amount, provider, transaction_code, status) VALUES (?, ?, ?, ?, ?)",
        [order_id, amount, provider, transaction_code, status || "pending"],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Update order status based on payment status
            if (status === "success") {
                db.query(
                    "UPDATE orders SET status = ? WHERE order_id = ?",
                    ["confirmed", order_id],
                    (err) => {
                        if (err) console.error("Error updating order status:", err);
                    }
                );
            }

            res.status(201).json({
                message: "Payment created successfully",
                payment_id: result.insertId
            });
        }
    );
});

// GET PAYMENT INFO
app.get("/payments/:order_id", auth, (req, res) => {
    const { order_id } = req.params;

    db.query(
        "SELECT * FROM payments WHERE order_id = ?",
        [order_id],
        (err, payments) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(payments[0] || null);
        }
    );
});


// ============= SELECT ALL ORDERS AT ADMIN PAGE==============================================//
// GET USER ORDERS
app.get("/all_orders", auth, (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    db.query(
        "SELECT COUNT(*) as total FROM orders",
        (err, countResult) => {
            if (err) return res.status(500).json({ error: err.message });

            const total = countResult[0].total;

            // Get orders with pagination
            db.query(
                "SELECT o.*, p.* FROM orders o LEFT JOIN payments p ON o.order_id = p.order_id ORDER BY o.created_at DESC LIMIT ? OFFSET ?",
                [limit, offset],
                (err, orders) => {
                    if (err) return res.status(500).json({ error: err.message });

                    if (orders.length === 0) {
                        return res.json({
                            orders: [],
                            pagination: {
                                total,
                                page,
                                limit,
                                pages: Math.ceil(total / limit)
                            }
                        });
                    }

                    // For each order, fetch order-items with product details and images
                    let completed = 0;
                    const ordersWithDetails = [];

                    orders.forEach((order, idx) => {
                        db.query(
                            "SELECT oi.*, p.* FROM order_items oi INNER JOIN products p ON p.product_id = oi.product_id",
                            [order.order_id],
                            (err, items) => {
                                if (err) {
                                    ordersWithDetails[idx] = { ...order, items: [] };
                                } else {
                                    ordersWithDetails[idx] = { ...order, items };
                                }
                                completed++;

                                if (completed === orders.length) {
                                    res.json({
                                        orders: ordersWithDetails,
                                        pagination: {
                                            total,
                                            page,
                                            limit,
                                            pages: Math.ceil(total / limit)
                                        }
                                    });
                                }
                            }
                        );
                    });
                }
            );
        }
    );
});

// GET ORDER DETAIL
app.get("/all_orders/:order_id", auth, (req, res) => {
    const { order_id } = req.params;
    db.query(
        "SELECT * FROM orders WHERE order_id = ?",
        [order_id],
        (err, orders) => {
            if (err) return res.status(500).json({ error: err.message });
            if (orders.length === 0) return res.status(404).json({ error: "Order not found" });

            const order = orders[0];

            // Get order items with product details and images
            db.query(
                "SELECT oi.*, p.* FROM order_items oi INNER JOIN products p ON p.product_id = oi.product_id",
                [order_id],
                (err, items) => {
                    if (err) return res.status(500).json({ error: err.message });

                    db.query(
                        "SELECT * FROM payments WHERE order_id = ?",
                        [order_id],
                        (err, payments) => {
                            if (err) return res.status(500).json({ error: err.message });

                            // Lấy voucher nếu có
                            if (order.voucher_id) {
                                db.query(
                                    "SELECT * FROM vouchers WHERE voucher_id = ?",
                                    [order.voucher_id],
                                    (err, voucherRows) => {
                                        if (err) return res.status(500).json({ error: err.message });
                                        res.json({
                                            order,
                                            items,
                                            payment: payments[0] || null,
                                            voucher: voucherRows[0] || null
                                        });
                                    }
                                );
                            } else {
                                res.json({
                                    order,
                                    items,
                                    payment: payments[0] || null,
                                    voucher: null
                                });
                            }
                        }
                    );
                }
            );
        }
    );
});

// UPDATE ORDER STATUS
app.put("/all_orders/:order_id", auth, (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'shipped', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    db.query(
        "UPDATE orders SET status = ? WHERE order_id = ?",
        [status, order_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Order not found" });

            res.json({ message: "Order status updated successfully", status });
        }
    );
});
// ============ END SELECT ALL ORDER APIS =============================================//





// ============ ADDRESS APIS ============

// GET USER ADDRESSES
app.get("/addresses", auth, (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    db.query(
        "SELECT COUNT(*) as total FROM user_addresses WHERE user_id = ?",
        [userId],
        (err, countResult) => {
            if (err) return res.status(500).json({ error: err.message });

            const total = countResult[0].total;

            // Get addresses with pagination
            db.query(
                "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC LIMIT ? OFFSET ?",
                [userId, limit, offset],
                (err, addresses) => {
                    if (err) return res.status(500).json({ error: err.message });

                    res.json({
                        data: addresses,
                        pagination: {
                            total,
                            page,
                            limit,
                            pages: Math.ceil(total / limit)
                        }
                    });
                }
            );
        }
    );
});

// ADD NEW ADDRESS
app.post("/addresses", auth, (req, res) => {
    const userId = req.user.id;
    const {
        recipient_name,
        phone,
        province_id,
        province_name,
        district_id,
        district_name,
        ward_id,
        ward_name,
        specific_address,
        label,
        is_default
    } = req.body;

    if (!recipient_name || !phone || !province_id || !district_id || !ward_id || !specific_address) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const newAddress = {
        user_id: userId,
        recipient_name,
        phone,
        province_id,
        province_name,
        district_id,
        district_name,
        ward_id,
        ward_name,
        specific_address,
        label,
        is_default: is_default || 0
    };

    const handleInsert = () => {
        db.query("INSERT INTO user_addresses SET ?", newAddress, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ success: true, message: "Address added successfully", address_id: result.insertId });
        });
    };

    if (newAddress.is_default) {
        // If the new address is default, set all other addresses for this user to not be default
        db.query("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            handleInsert();
        });
    } else {
        handleInsert();
    }
});

// ============ END ADDRESS APIS ============


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