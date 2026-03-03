"use client";

import { useListings } from "@/app/store/zustand";

import { type Listing } from "@/src/generated/prisma/client";

import { useEffect, useState } from "react";

import { fetchListings } from "@/app/client-utils/functions";

import ListingCard from "@/components/Listings/ListingCard";

const Listing = () => {
  const { listings, setListings } = useListings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      if (listings.length === 0) {
        fetchListings({ setter: setListings });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className=" h-[85vh]  overflow-auto">
      <header className="px-2">
        <h1 className="text-lg font-semibold">Today's Listings</h1>
      </header>
      <section className="flex flex-col p-12 gap-5">
        {listings ? (
          listings.map((listing: Listing) => {
            return <ListingCard key={listing.lid} listing={listing} />;
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
    </main>
  );
};

export default Listing;
