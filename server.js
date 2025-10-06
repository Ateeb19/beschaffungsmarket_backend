const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const cors = require("cors");

const routes = require("./routes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.use(
  cors({
    origin: ["https://beschaffungsmarkt.com","http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/payments", paymentRoutes);

// inside public directory.
app.use(express.static("public"));
app.use("/files", express.static("uploads"));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World - Client Server");
});

// Use routes
app.use("/api", routes);

const port = process.env.PORT || 5001;

app.listen(port, () => console.log(`Server running on port ${port}`));
