import { favorites, locations, users } from "./schema";

export type User = (typeof users)["$inferSelect"];
export type Location = (typeof locations)["$inferSelect"];
export type Favorite = (typeof favorites)["$inferSelect"];
