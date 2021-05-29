import { Coordinates } from "./types";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

import { extname } from "path";
import fs from "fs/promises";

import { Image } from "./types";

type Schema = {
  images: Image[];
};

const allowedExts = [".jpg", ".jpeg", ".png"];

interface ImageManager {
  imgPath: string;
  db: low.LowdbSync<Schema>;
}
class ImageManager {
  constructor(imgLocation: string, dbLocation: string) {
    this.imgPath = imgLocation;
    const dbPath = dbLocation;
    console.log(`db path: ${dbPath}`);
    const adapter = new FileSync<Schema>(dbPath);
    this.db = low(adapter);
  }
  init = async (): Promise<number> => {
    console.log("initializing db");
    this.db.read();
    this.db.defaults({ images: [] }).write();
    console.log(this.db.value());
    console.log(`scanning ${this.imgPath} for images`);

    const fileList = (await fs.readdir(this.imgPath)).filter((elem) =>
      allowedExts.includes(extname(elem))
    );

    const dbList = this.db.get("images");

    fileList.forEach((elem) => {
      const elemId = elem.split(".")[0];
      const exists = this.db.get("images").find({ id: elemId }).value();
      if (!exists) {
        const newImageEntry = {
          id: elemId,
          fileName: elem,
        } as Image;
        dbList.push(newImageEntry).write();
      } else {
        return;
      }
    });
    console.log(fileList);

    return fileList.length;
  };
  getImageList = (count: number): Array<Image> => {
    const imageList = this.db.get("images").take(count).value();
    return imageList;
  };

  getImage = (id: string): Image => {
    const image = this.db.get("images").find({ id }).value();
    if (image) {
      return image;
    } else {
      throw new Error("image not found");
    }
  };

  getImageForAnnotation = (): Image => {
    const img = this.db
      .get("images")
      .filter((elem) => !elem.coordinates)
      .first()
      .value();

    console.log(img);
    if (img) {
      return img;
    } else {
      throw new Error("all images were annotated");
    }
  };

  getRandomAnnotatedImage = (): Image => {
    const img = this.db
      .get("images")
      .filter((elem) => !!elem.coordinates && elem.coordinates.x != -1)
      .shuffle()
      .first()
      .value();
    if (img) {
      return img;
    } else {
      throw new Error("no annotated images found");
    }
  };

  setImage = (id: string, coordinates: Coordinates): Image => {
    const image = this.db.get("images").find({ id });
    if (image.value()) {
      image.assign({ coordinates }).write();
      return image.value();
    } else {
      throw new Error("image not found");
    }
  };
}

export default ImageManager;
