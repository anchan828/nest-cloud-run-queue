// Copyright 2018 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// [START run_pubsub_server_setup]

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

// [END run_pubsub_server_setup]

// [START run_pubsub_handler]

app.post("/", (req, res) => {
  if (!req.body) {
    const msg = "no Pub/Sub message received";
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }
  if (!req.body.message) {
    const msg = "invalid Pub/Sub message format";
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }

  if (req.body.message.data) {
    req.body.message.data = Buffer.from(req.body.message.data, "base64").toString("utf8");
  }

  console.log(req.body);
  res.status(204).send();
});

// [END run_pubsub_handler]

app.listen(4363, () => console.log(`reciver listening on port 4363`));
