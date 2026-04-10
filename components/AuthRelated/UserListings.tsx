"use client";
import { motion, useAnimate } from "motion/react";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import ListingCard from "../Listings/ListingCard";
import { redirect } from "next/navigation";
import ListingModal from "../Listings/ListingByID";
import { useListings, useUser } from "@/app/store/zustand";

type Filter = "all" | "sold" | "archived";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Sold", value: "sold" },
  { label: "Archived", value: "archived" },
];

const UserListings = ({
  setModals,
  showModal,
}: {
  setModals: (modals: SetStateAction<{ userModal: boolean }>) => void;
  showModal: boolean;
}) => {
  const [scope, animate] = useAnimate();
  const [titleScope, titleAnimate] = useAnimate();
  const { selectedListing } = useListings();
  const { userListings } = useUser();
  const [filter, setFilter] = useState<Filter>("all");

  const displayedListings = userListings.filter((listing) => {
    if (filter === "sold") return listing.sold === true;
    if (filter === "archived") return listing.archived === true;
    return true;
  });

  const animateModal = useCallback(async () => {
    await animate(
      scope.current,
      { left: 0, opacity: 1 },
      { duration: 0.1, type: "spring", stiffness: 200, damping: 30 },
    );
    await titleAnimate(
      titleScope.current,
      { left: 0, opacity: 1 },
      { duration: 0.1, type: "spring", stiffness: 200, damping: 20 },
    );
  }, [animate, titleAnimate, scope, titleScope]);
  useEffect(() => {
    if (!scope.current || !titleScope.current) return;
    animateModal();
  }, [scope, showModal, titleScope, animateModal]);

  async function closeModal() {
    await animate(scope.current, { left: -600, opacity: 0 });
    setModals(() => ({ userModal: false }));
  }
  
  return (
    <>
      {showModal && (
        <>
          <div
            onClick={closeModal}
            className="fixed inset-0 z-20 bg-black/20"
          />

          <motion.section
            ref={scope}
            initial={{ left: -600, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 top-0 z-30 flex flex-col bg-background rounded-t-3xl overflow-hidden"
          >
            {/* Sticky header */}
            <motion.div
              ref={titleScope}
              initial={{ left: -600, opacity: 0 }}
              className="bg-pill border-b border-[#e0faf2] px-4 py-3.5 flex items-center justify-between sticky top-0 z-10"
            >
              <p className="text-[17px] font-extrabold text-dtext">
                Your listings
                {userListings?.length > 0 && (
                  <span className="ml-2 text-[13px] font-normal text-[#6b9e8a]">
                    · {displayedListings.length}
                  </span>
                )}
              </p>
              <button
                onClick={closeModal}
                className="bg-[#f0fdf8] border border-[#c8f5e8] rounded-xl px-3.5 py-1.5 text-[13px] font-semibold text-[#6b9e8a] cursor-pointer"
              >
                Close ✕
              </button>
            </motion.div>

            {/* Filter chips */}
            <div className="bg-pill border-b border-[#e0faf2] px-4 py-3 flex gap-2">
              {FILTERS.map(({ label, value }) => {
                const count =
                  value === "all"
                    ? userListings.length
                    : userListings.filter((l) => l[value] === true).length;

                return (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all cursor-pointer ${
                      filter === value
                        ? "bg-dtext text-primary border-dtext"
                        : "bg-[#f0fdf8] text-[#6b9e8a] border-[#c8f5e8]"
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          filter === value
                            ? "bg-[#17f3b520] text-primary"
                            : "bg-[#e0faf2] text-[#6b9e8a]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 no-scrollbar pb-10">
              {selectedListing && <ListingModal listing={selectedListing} />}

              {displayedListings.length > 0 ? (
                displayedListings.map((listing, i) => (
                  <motion.div
                    key={listing.lid}
                    animate={{ opacity: [0, 1], y: [10, 0] }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))
              ) : userListings.length === 0 ? (
                /* No listings at all */
                <div className="flex flex-col gap-4 pt-2">
                  <div>
                    <h1 className="text-[26px] font-extrabold text-dtext leading-tight mb-1">
                      Make a listing!
                    </h1>
                    <p className="text-[14px] text-[#6b9e8a]">
                      Created listings will appear here.
                    </p>
                  </div>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    whileInView={{ y: [25, 0], opacity: [0, 1] }}
                    transition={{ delay: 0.15, type: "spring" }}
                    onClick={() => redirect("/new")}
                    className="bg-pill border border-[#e0faf2] rounded-[20px] overflow-hidden cursor-pointer relative"
                  >
                    <div className="w-full h-40 bg-[#e8faf4] flex items-center justify-center">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                      >
                        <rect width="48" height="48" rx="12" fill="#d6fdf1" />
                        <path
                          d="M24 16v16M16 24h16"
                          stroke="#17f3b5"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="absolute top-3 right-3 bg-primary text-dtext text-[11px] font-bold px-3 py-1.5 rounded-xl">
                      Tap to list
                    </span>
                    <div className="p-4">
                      <p className="text-[15px] font-bold text-dtext mb-0.5">
                        Click here to create a listing
                      </p>
                      <p className="text-[12px] text-[#6b9e8a]">
                        Takes less than 30 seconds
                      </p>
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Filter returned nothing */
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-12 h-12 bg-[#e8faf4] rounded-2xl flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M3 5h14M6 10h8M9 15h2"
                        stroke="#17f3b5"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <p className="text-[14px] text-[#6b9e8a] text-center">
                    No{" "}
                    <span className="text-dtext font-semibold">{filter}</span>{" "}
                    listings yet.
                  </p>
                  <button
                    onClick={() => setFilter("all")}
                    className="text-[13px] text-accent underline font-medium cursor-pointer"
                  >
                    Show all listings
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        </>
      )}
    </>
  );
};

export default UserListings;
