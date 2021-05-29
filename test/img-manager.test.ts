import Manager from "../src/img-manager";
import { join } from "path";

test("should load images and push new images into db", async () => {
  const manager = new Manager(
    join(__dirname, "data", "img"),
    join(__dirname, "data", "db.json")
  );
  const res = await manager.init();
  expect(res).toEqual(4);

  const list = manager.getImageList(3);
  expect(list).toHaveLength(3);

  const img = manager.getImage(list[0].id);
  expect(img).toBeDefined();
  console.log(img);

  const updated = manager.setImage(img.id, { x: 123, y: 123 });
  console.log(updated);
  expect(updated).toBeDefined();

  expect(() => manager.getImage("asdf")).toThrowError("image not found");
  expect(() => manager.setImage("asdf", { x: 0, y: 9 })).toThrowError(
    "image not found"
  );
});
