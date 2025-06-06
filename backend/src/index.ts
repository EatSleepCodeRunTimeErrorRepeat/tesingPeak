import  express from "express";
import authRouter from "./routes/auth";

const app = express();
// Middleware to parse JSON bodies
app.use(express.json());
app.use("/auth", authRouter);


app.get("/", (req, res) => {
  res.send("Welcome to the Express server!!!!!!!!!1");
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});