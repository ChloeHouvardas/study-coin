//test

const express = require("express");
const app = express();
app.use(express.json());

app.post("/block", (req, res) => {
  console.log("Webhook triggered!", req.body);
  res.sendStatus(200);
});

app.listen(3005, () => {
  console.log("Webhook server listening on port 3005");
});
