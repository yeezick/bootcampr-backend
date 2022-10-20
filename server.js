import db from "./db/connection.js";
import express from "express";
import logger from "morgan";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

//attaching api to the parameter so the CRUD requests are made to the url/api/endpoint
app.use("/api", routes);

// once there is a successful connection to mongoDB, express will start server to listen at PORT
db.on("connected", () => {
  console.log("Connected to MongoDB!");
  app.listen(PORT, () => {
    if (process.env.NODE_ENV === "production") {
      console.log(
        `Express server application is running in production on: ${PORT}\n\n`
      );
    } else {
      console.log(
        `Express server running in development on: http://localhost:${PORT} \n\n`
      );
    }
  });
});

// what is the purpose of this file?
// server.js must be the gatekeeper or "start-up" file. I believe the purpose of its logic is to initiate express -> initiate helperWare like cors and morgan -> attach 'api' to all endpoints of the app -> then start it actually starts the server
