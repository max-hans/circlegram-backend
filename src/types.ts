export type Coordinates = {
  x: number;
  y: number;
};

export type Image = {
  fileName: string;
  id: string;
  coordinates?: Coordinates;
};
