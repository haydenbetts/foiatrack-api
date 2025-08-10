import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { requests } from "./routes/requests.js";
import { ai } from "./routes/ai.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/requests", requests);
app.use("/ai", ai);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API on :${port}`));
