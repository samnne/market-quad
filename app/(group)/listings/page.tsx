"use client";

import { useListings } from "@/app/store/zustand";
import ListingModal from "@/components/Listings/ListingByID";
import {
  getClientListings,
  getClientListingsNotUsers,
} from "@/lib/listing.lib";
import { type Listing } from "@/src/generated/prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getSession } from "@/lib/lib";

const Listing = () => {
  const { listings, setListings, selectedListing, setSelectedListing } =
    useListings();
  const [loading, setLoading] = useState(true);
  const fetchListings = async () => {
    const session = await getSession();
    if (!session) {
      const temp = await getClientListings();
      setListings(temp?.listings);

      return temp;
    } else {
      const temp = await getClientListingsNotUsers(session?.uid);
      setListings(temp?.listings);
      
      return temp;
    }
  };
  useEffect(() => {
    try {
      setLoading(true);
      if (listings.length === 0) {
        fetchListings();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);
  function openListingModal(listing: Listing) {
    setSelectedListing(listing);
  }
  return (
    <main className=" h-[85vh]  overflow-auto">
      <header className="px-2">
        <h1 className="text-lg font-semibold">Today's Listings</h1>
      </header>
      <section className="flex flex-col p-12 gap-5">
        {listings ? (
          listings.map((listing: Listing) => {
            return (
              <section
                onClick={() => openListingModal(listing)}
                className=" bg-white  drop-shadow-xl text-white p-2 flex flex-col gap-2 rounded-4xl"
                key={listing.lid}
              >
                <div className="h-80 relative p-1">
                  <Image
                    className=" rounded-4xl w-full h-full object-cover z-0"
                    width={250}
                    loading="eager"
                    height={250}
                    src={
                      listing.imageUrls.length > 0
                        ? listing.imageUrls[0]
                          ? listing.imageUrls[0].includes("example")
                            ? "https://picsum.photos/500"
                            : listing.imageUrls[0]
                          : "/"
                        : "/"
                    }
                    alt="listing photo"
                  />

                  <motion.span
                    initial={{
                      opacity: 0,
                      scale: 0,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="absolute top-3 right-5 font-bold bg-primary rounded-4xl px-2"
                  >
                    Click to View
                  </motion.span>
                </div>
                <div className="p-4 rounded-2xl text-lg  overflow-hidden text-nowrap flex flex-col gap-1 justify-center">
                  {/* <span className="">${listing.price / 100} ⋅</span>
                  <h3 className="">{listing.title}</h3> */}
                  <h3 className="text-xl text-black">
                    {" "}
                    ${listing.price} ⋅ {listing.title}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {listing?.condition}
                  </span>
                  <p className="text-gray-400 text-sm text-nowrap overflow-hidden">
                    {listing.description}
                  </p>
                </div>
              </section>
            );
          })
        ) : (
          <div>Empty</div>
        )}
        {loading && (
          <>
            <section className="">
              <div className="h-80 bg-gray-200 animate-pulse ">
                <img src="#" alt="" />
              </div>
              <div className=" pt-2 animate-pulse  text-lg font-semibold overflow-hidden text-nowrap flex gap-1 items-center">
                <span className="bg-gray-300 w-1/2 h-6 "></span>
                <h3 className=" bg-gray-300  w-full h-6"></h3>
              </div>
            </section>
            <section className="">
              <div className="h-80 bg-gray-200 animate-pulse ">
                <img src="#" alt="" />
              </div>
              <div className=" pt-2 animate-pulse  text-lg font-semibold overflow-hidden text-nowrap flex gap-1 items-center">
                <span className="bg-gray-300 w-1/2 h-6 "></span>
                <h3 className=" bg-gray-300  w-full h-6"></h3>
              </div>
            </section>
          </>
        )}
      </section>
      <ListingModal listing={selectedListing}></ListingModal>
    </main>
  );
};

export default Listing;
