import { LngLatLike } from "@maptiler/sdk";
import { FaHome, FaShoppingBag, FaPlus, FaInbox, FaUser } from "react-icons/fa";
export const navLinks = [
  {
    name: "Home",
    href: "/home",
    icon: <FaHome/>,
  },
  {
    name: "Market",
    href: "/listings",
    icon: <FaShoppingBag/>,
  },
  {
    name: "New",
    href: "/new",
    icon: <FaPlus/>,
  },
  {
    name: "Messages",
    href: "/conversations",
    icon: <FaInbox/>,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: <FaUser/>,
  },
];

export const UVIC_LNG_LAT: number[] & LngLatLike = [
  -123.312603, 48.463816,
];

export const condition = [
  "New",
  "Used - Good",
  "Used - Fair",
  "Used - Poor",
  "Used - New",
  "Broken",
];
export const BASEURL = process.env.BASE_URL ?? "http://localhost:3000";

export const categories = [
  "All",
  "Textbooks",
  "Electronics",
  "Housing",
  "Notes",
  "Clothes",
  "Sports",
];
