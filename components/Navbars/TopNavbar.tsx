"use client";
import { useListings, useMessage } from "@/app/store/zustand";
import { animate, motion } from "motion/react";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

const TopNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setError } = useMessage();
  const [path, setPath] = useState(pathname.substring(1, pathname.length));
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const segments = pathname.split("/");
    if (segments.length > 2) {
      setPath('');
    } else {
      setPath(segments[1]);
    }
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
    <nav className="sticky w-screen p-4 bg-white ">
      <section className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button className="flex text-xl justify-center items-center hover:text-primary transition-colors">
            <FaBars />
          </button>
        </div>


        {searchOpen ? (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
         
            exit={{width: 0, opacity: 0}}

            transition={{ duration: 0.2, type: 'keyframes' }}
            className="flex gap-2 items-center bg-gray-100 rounded-full px-4 py-1 origin-right"
          >
            <FaMagnifyingGlass className="text-gray-500" />
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
              className="text-lg text-gray-500 hover:text-gray-700"
            >
              <IoClose />
            </button>
          </motion.div>
        ) : (
          <>
            <div className="capitalize text-2xl font-bold text-primary-dark">
              {path}
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex justify-center items-center text-xl hover:text-primary transition-colors"
            >
              <FaMagnifyingGlass />
            </button>
          </>
        )}
      </section>
    </nav>
  );
};

export default TopNavbar;
