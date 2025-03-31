import express from "express";
import connectDB from "./lib/db";

export const app = express();

connectDB();

app.use(express.json());

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});

// Define a Routes

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Hello World!");
});
