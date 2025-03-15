import express from "express";
import cors from "cors";
import expenseRouter from "./routes/expense";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/expense",expenseRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
