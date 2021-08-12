#!/usr/bin/env node

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { Image } from "./types";
import Manager from "./img-manager";
import { join } from "path";
dotenv.config();

if (!(process.env.IMAGE_FOLDER && process.env.DB_LOC)) {
  throw new Error("image folder not defined!");
}

const app = express();
app.use(express.json());
app.use("/api/images", express.static(process.env.IMAGE_FOLDER));

const port = process.env.PORT; // default port to listen

const manager = new Manager(process.env.IMAGE_FOLDER, process.env.DB_LOC);

/* app.use("/", express.static("frontend")); */
app.use(cors());

app.get("/api/annotation", (_req, res) => {
  try {
    const img = manager.getImageForAnnotation();
    console.log(`getting next annotation img: ${img.id}`);
    res.send(img);
  } catch (e) {
    res.send({ error: "nothing left to annotate" });
  }
});

app.get("/api/final", (_req, res) => {
  try {
    const img = manager.getRandomAnnotatedImage();
    console.log(`getting random img: ${img.id}`);
    res.send(img);
  } catch (e) {
    res.send({ error: "nothing left to annotate" });
  }
});

app.post("/api/update", (req, res) => {
  const data = req.body as Image;
  console.log(data);
  if (data.coordinates) {
    manager.setImage(data.id, data.coordinates);
    res.send("ok");
  } else {
    res.statusCode = 400;
    res.send("incorrect or no coordinate values provided!");
  }
});

app.use("/", express.static(join(__dirname, "../frontend")));
app.get("*", function (_req, res) {
  res.sendFile("index.html", {
    root: join(__dirname, "../frontend/"),
  });
});

const start = async () => {
  console.log("getting imagedata");

  await manager.init();

  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
  });
};

start();
