"use client";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";
import ListingCard from "../Listings/ListingCard";
import { redirect } from "next/navigation";
import ListingModal from "../Listings/ListingByID";
import { useListings, useUser } from "@/app/store/zustand";

const UserListings = ({
  setModals,
  showModal,
}: {
  setModals: Function;
  showModal: boolean;
}) => {
  const [scope, animate] = useAnimate();
  const [titleScope, titleAnimate] = useAnimate();
  const { selectedListing, setSelectedListing } = useListings();
  const { userListings } = useUser();

  const animateModal = async () => {
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
  };

  useEffect(() => {
    if (!scope.current || !titleScope.current) return;
    animateModal();
  }, [scope, showModal, titleScope]);

  async function closeModal() {
    await animate(scope.current, { left: -600, opacity: 0 });
    setModals((prev: object) => ({ ...prev, userModal: false }));
  }

  return (
    <>
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeModal}
            className="fixed inset-0 z-20 bg-black/20"
          />

          <motion.section
            ref={scope}
            initial={{ left: -600, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 top-0 z-30 flex flex-col bg-[#ecfef8] rounded-t-[24px] overflow-hidden"
          >
            {/* Sticky header */}
            <motion.div
              ref={titleScope}
              initial={{ left: -600, opacity: 0 }}
              className="bg-white border-b border-[#e0faf2] px-4 py-3.5 flex items-center justify-between sticky top-0 z-10"
            >
              <p className="text-[17px] font-extrabold text-[#011d16]">
                Your listings
                {userListings?.length > 0 && (
                  <span className="ml-2 text-[13px] font-normal text-[#6b9e8a]">
                    · {userListings.length}
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 no-scrollbar pb-10">
              <ListingModal listing={selectedListing} />

              {userListings?.length > 0 ? (
                userListings.map((listing, i) => (
                  <motion.div
                    key={listing.lid}
                    whileInView={{ y: [20, 0], opacity: [0, 1] }}
                    transition={{ delay: 0.06 * i, type: "keyframes" }}
                  >
                    <ListingCard listing={listing} setSelectedListing={setSelectedListing} />
                  </motion.div>
                ))
              ) : (
                /* Empty state */
                <div className="flex flex-col gap-4 pt-2">
                  <div>
                    <h1 className="text-[26px] font-extrabold text-[#011d16] leading-tight mb-1">
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
                    className="bg-white border border-[#e0faf2] rounded-[20px] overflow-hidden cursor-pointer relative"
                  >
                    {/* Mock image area */}
                    <div className="w-full h-40 bg-[#e8faf4] flex items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="#d6fdf1" />
                        <path d="M24 16v16M16 24h16" stroke="#17f3b5" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>

                    {/* CTA badge */}
                    <span className="absolute top-3 right-3 bg-[#17f3b5] text-[#011d16] text-[11px] font-bold px-3 py-1.5 rounded-xl">
                      Tap to list
                    </span>

                    <div className="p-4">
                      <p className="text-[15px] font-bold text-[#011d16] mb-0.5">
                        Click here to create a listing
                      </p>
                      <p className="text-[12px] text-[#6b9e8a]">
                        Takes less than 30 seconds
                      </p>
                    </div>
                  </motion.div>
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