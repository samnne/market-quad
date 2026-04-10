"use client";

import { useListings, useMessage } from "@/app/store/zustand";
import { type Listing } from "@/src/generated/prisma/client";
import { useEffect, useState } from "react";
import { fetchListings, getUserSupabase } from "@/app/client-utils/functions";
import { useSearchParams, useRouter } from "next/navigation";
import ListingCard from "@/components/Listings/ListingCard";
import { motion } from "motion/react";
import ListingModal from "@/components/Listings/ListingByID";

const CATEGORIES = [
  "All",
  "Textbooks",
  "Electronics",
  "Clothes",
  "Housing",
  "Notes",
  "Sports",
  "Other",
];

const SkeletonCard = () => (
  <div className="bg-pill rounded-2xl border border-[#e0faf2] overflow-hidden animate-pulse">
    <div className="h-48 bg-[#e8faf4]" />
    <div className="p-3 flex flex-col gap-2">
      <div className="h-3.5 w-2/3 bg-[#e0faf2] rounded-full" />
      <div className="h-3 w-1/3 bg-[#e8faf4] rounded-full" />
      <div className="h-4 w-1/4 bg-[#d6fdf1] rounded-full mt-1" />
    </div>
  </div>
);

const ListingPage = () => {
  const { listings, setListings, selectedListing } =
    useListings();
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Listing[] | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { setError } = useMessage();
  const router = useRouter();

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  const baseListings =
    searchQuery && searchResults !== null ? searchResults : listings;

  const displayListings =
    activeCategory === "All"
      ? baseListings
      : baseListings?.filter(
          (l) => l.category?.toLowerCase() === activeCategory.toLowerCase(),
        );

  useEffect(() => {
    const loadListings = async () => {
      if (!searchQuery && listings?.length > 0) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        if (searchQuery) {
          const {user, app_user} = await getUserSupabase();
          const response = await fetch(
            `/api/listings/search?q=${encodeURIComponent(searchQuery)}`,
            { headers: { Authorization: user ? app_user.uid! : '' } },
          );
          if (!response.ok) throw new Error("Failed to fetch search results");
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
  }, [searchQuery, listings.length, setError, setListings]);

  return (
    <div className="flex flex-col  min-h-full pb-6">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-3">
        <div className="bg-pill border border-secondary/50 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 focus-within:border-primary transition-colors">
          <svg
            className="w-3.5 h-3.5 shrink-0 opacity-40"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle cx="9" cy="9" r="6" stroke="#011d16" strokeWidth="1.5" />
            <path
              d="M13.5 13.5L17 17"
              stroke="#011d16"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            defaultValue={searchQuery ?? ""}
            placeholder="Search listings…"
            className="flex-1 text-[13px] text-text placeholder:text-secondary bg-transparent outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val)
                  router.push(`/listings?search=${encodeURIComponent(val)}`);
                else router.push("/listings");
              }
            }}
          />
          {searchQuery && (
            <button
              onClick={() => router.push("/listings")}
              className="text-secondary text-sm leading-none cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
              activeCategory === cat
                ? "bg-text text-primary border-text"
                : "bg-pill text-secondary border-secondary/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-4 pb-3">
        <p className="text-[13px] font-medium text-text">
          {searchQuery ? (
            <>
              Results for <span className="text-primary">{searchQuery}</span>
            </>
          ) : (
            "Today's listings"
          )}
          {!loading && displayListings?.length > 0 && (
            <span className="text-secondary font-normal ml-1.5">
              · {displayListings.length}
            </span>
          )}
        </p>
        {/* Grid / list toggle */}
        <div className="flex gap-1 bg-pill border border-secondary/50 rounded-xl p-1">
          <button
            onClick={() => setView("grid")}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              view === "grid" ? "bg-text" : ""
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect
                x="0"
                y="0"
                width="5.5"
                height="5.5"
                rx="1.5"
                fill={view === "grid" ? "#17f3b5" : "#6b9e8a"}
              />
              <rect
                x="7.5"
                y="0"
                width="5.5"
                height="5.5"
                rx="1.5"
                fill={view === "grid" ? "#17f3b5" : "#6b9e8a"}
              />
              <rect
                x="0"
                y="7.5"
                width="5.5"
                height="5.5"
                rx="1.5"
                fill={view === "grid" ? "#17f3b5" : "#6b9e8a"}
              />
              <rect
                x="7.5"
                y="7.5"
                width="5.5"
                height="5.5"
                rx="1.5"
                fill={view === "grid" ? "#17f3b5" : "#6b9e8a"}
              />
            </svg>
          </button>
          <button
            onClick={() => setView("list")}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              view === "list" ? "bg-text" : ""
            }`}
          >
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path
                d="M4 1h9M4 5h9M4 9h9"
                stroke={view === "list" ? "#17f3b5" : "#6b9e8a"}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle
                cx="1.5"
                cy="1"
                r="1"
                fill={view === "list" ? "#17f3b5" : "#6b9e8a"}
              />
              <circle
                cx="1.5"
                cy="5"
                r="1"
                fill={view === "list" ? "#17f3b5" : "#6b9e8a"}
              />
              <circle
                cx="1.5"
                cy="9"
                r="1"
                fill={view === "list" ? "#17f3b5" : "#6b9e8a"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {loading ? (
          <div
            className={
              view === "grid" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"
            }
          >
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : displayListings?.length > 0 ? (
          <motion.div
            className={
              view === "grid"
                ? "grid grid-cols-2 gap-3 "
                : "flex flex-col gap-3"
            }
          >
            {displayListings.map((listing: Listing, i) => (
              <motion.div
                key={listing.lid}
                whileInView={{ y: [20, 0], opacity: [0, 1] }}
                transition={{ delay: 0.05 * i, type: "keyframes" }}
                className=""
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 bg-secondary/50 rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3h18v4H3zM3 10h18v11H3z"
                  stroke="#0a6644"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-[14px] text-secondary text-center leading-relaxed">
              {searchQuery ? (
                <>
                  No listings matched{" "}
                  <span className="text-text font-semibold">{searchQuery}</span>
                  .
                </>
              ) : activeCategory !== "All" ? (
                <>
                  No listings in{" "}
                  <span className="text-text font-semibold">
                    {activeCategory}
                  </span>{" "}
                  yet.
                </>
              ) : (
                "No listings available yet."
              )}
            </p>
            {(searchQuery || activeCategory !== "All") && (
              <button
                onClick={() => {
                  setActiveCategory("All");
                  if (searchQuery) router.push("/listings");
                }}
                className="text-[13px] text-secondary/50 underline font-medium cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <ListingModal listing={selectedListing} />
    </div>
  );
};

export default ListingPage;
