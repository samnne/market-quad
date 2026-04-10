"use client";
import {  useMessage, useUser } from "@/app/store/zustand";
import {  motion } from "motion/react";
import Image from "next/image";
import {
  redirect,
  usePathname,
  useRouter,

} from "next/navigation";
import { useEffect, useState } from "react";

import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

const TopNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { setError } = useMessage();
  const [path, setPath] = useState(pathname.substring(1, pathname.length));
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {user} = useUser()
  useEffect(() => {
    function mountPath(){
      
      const segments = pathname.split("/");
      if (segments.length > 2) {
        setPath("");
      } else {
        setPath(segments[1]);
      }
    }
    mountPath()
  }, [pathname]);

  const handleSearchListings = async () => {
    try {
      if (!searchQuery.trim()) {
        setError(true);
        return;
      }

      // Redirect to listings page with search query
      router.push(`/listings?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    } catch (err) {
      console.error("Error handling search:", err);
      setError(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchListings();
    }
  };

  return (
    <nav className=" sticky top-0 w-screen p-4 bg-background ">
      <section className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button className="flex text-xl w-15 h-15 justify-center items-center hover:text-primary transition-colors">
            <Image
              src={"/nav-logo.svg"}
              width={25}
              height={25}
              alt="TopNavLogo"
              loading="lazy"
              className="w-auto h-auto"
            />
          </button>
        </div>

        {searchOpen ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, type: "keyframes" }}
            className="flex gap-2 items-center bg-primary/25 text-text shadow  rounded-full px-4 py-1 origin-right"
          >
            <FaMagnifyingGlass className="text-text" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
              className="bg-transparent outline-none w-48"
            />

            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
              className="text-lg text-text hover:text-primary"
            >
              <IoClose />
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex gap-4">
              <div className="capitalize text-2xl font-bold text-primary-dark"></div>
              <button
                onClick={() => setSearchOpen(true)}
                className="flex justify-center items-center text-xl hover:text-primary transition-colors"
              >
                <FaMagnifyingGlass />
              </button>
              <button onClick={()=> redirect('/profile')} className="w-12 h-12 bg-primary text-black rounded-full flex items-center justify-center text-[14px] font-bold shrink-0">
                {user?.app_user?.name[0]}
              </button>
            </div>
          </>
        )}
        <span id={path}></span>
      </section>
    </nav>
  );
};

export default TopNavbar;
