"use client";

import { useListings, useMessage } from "@/app/store/zustand";

import { type Listing } from "@/src/generated/prisma/client";

import { useEffect, useState } from "react";

import { fetchListings } from "@/app/client-utils/functions";
import { useSearchParams } from "next/navigation";

import ListingCard from "@/components/Listings/ListingCard";
import { motion } from "motion/react";

const ListingPage = () => {
  const { listings, setListings } = useListings();
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Listing[]>([]);
  const { setError } = useMessage();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");
  const displayListings =
    searchQuery && searchResults !== null ? searchResults : listings;
  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);

        if (searchQuery) {
          // Fetch search results
          const response = await fetch(
            `/api/listings/search?q=${encodeURIComponent(searchQuery)}`,
          );
          if (!response.ok) {
            throw new Error("Failed to fetch search results");
          }
          const data = await response.json();
          if (data.success) {
            setSearchResults(data.listings);
          } else {
            setError(true);
          }
        } else {
      
          setSearchResults(null);
          if (listings.length === 0) {
            await fetchListings({ setter: setListings });
          }
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [searchQuery]);

  return (
    <main className=" h-[85vh]  overflow-auto">
      <header className="px-2">
        <h1 className="text-lg font-semibold">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : "Today's Listings"}
        </h1>
      </header>
      <motion.section className="flex flex-col p-12 gap-5">
        {!loading && displayListings && displayListings.length > 0 ? (
          displayListings.map((listing: Listing) => {
            return <ListingCard key={listing.lid} listing={listing} />;
          })
        ) : !loading ? (
          <div className="text-center text-gray-400">
            {searchQuery
              ? "No listings found matching your search"
              : "No listings available"}
          </div>
        ) : null}
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
      </motion.section>
    </main>
  );
};

export default ListingPage;
