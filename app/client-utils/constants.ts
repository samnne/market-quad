import {FaHome, FaShoppingBag, FaPlus, FaInbox, FaUser} from "react-icons/fa"
export const navLinks =[
      {
        name: "Home",
        href: "/home",
        icon: FaHome
    },
    {
        name: "Market",
        href: "/listings",
        icon: FaShoppingBag,
    },
    {
        name: "New",
        href: "/new",
        icon: FaPlus,
    },
    {
        name: "Messages",
        href: "/conversations",
        icon: FaInbox,
    },
    {
        name: "Profile",
        href: "/profile",
        icon: FaUser
    },
]

export const condition = [
    "New",
    "Used - Good",
    "Used - Fair",
    "Used - Poor",
    "Used - New",
    "Broken"
]