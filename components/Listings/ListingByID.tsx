import {
  useConvos,
  useListings,
  useMessage,
  useUser,
} from "@/app/store/zustand";
import { Conversation, type Listing } from "@/src/generated/prisma/client";
import { AnimationOptions, motion, useAnimate } from "motion/react";
import { ChangeEvent, useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import StarRating from "../StarRating";
import ListingMap from "./ListingMap";
import { redirect } from "next/navigation";
import { deleteListingAction } from "@/lib/listing.lib";
import Carousel from "../Carousel";
import { ListingInclude } from "@/src/generated/prisma/models";
import { createConvo } from "@/lib/conversations.lib";
import { supabase } from "@/supabase/authHelper";
import { getUserSupabase } from "@/app/client-utils/functions";

const getRandomFirstMessage = (): string => {
  const msgs = [
    "Is this still available?",
    "What time could this be picked up?",
    "Hey, I'm interested, when could I pick it up?",
    "I can come pick this up today, does that work?",
    "I'll take it, where should I bring the cash?",
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
};

const ListingModal = ({ listing }: { listing: Listing & ListingInclude }) => {
  const [sectionRef, animate] = useAnimate();
  const [scope, animateDots] = useAnimate();
  const [containerRef, animateText] = useAnimate();
  const { setSelectedListing } = useListings();
  const [optionsModal, setOptionsModal] = useState(false);
  const { user, setUser } = useUser();
  const { setSelectedConvo } = useConvos();
  const [expandDescription, setExpandDescription] = useState(false);
  const { setError } = useMessage();
  const [date, setDate] = useState("No time available");
  const [message, setMessage] = useState<string>("");

  const transition: AnimationOptions = {
    type: "spring",
    stiffness: 300,
    bounceDamping: 5,
    duration: 0.2,
  };

  function getTimeElapsed() {
    const currentTime = new Date(Date.now());
    const listingDate = new Date(listing?.createdAt);
    const timeMs = currentTime.getTime() - listingDate.getTime();
    let hoursDiff = timeMs / (1000 * 60 * 60);
    let hoursString = `${Math.floor(hoursDiff)} hours ago`;
    if (hoursDiff < 1) {
      hoursDiff = hoursDiff * 60;
      hoursString = `${Math.round(hoursDiff)} minutes ago`;
    }
    if (hoursDiff > 24) {
      hoursDiff = hoursDiff / 24;
      hoursString = `${Math.round(hoursDiff)} days ago`;
    }
    setDate(hoursString);
  }

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value);

  async function mountUser() {
    const user = await getUserSupabase();
    if (!user) { setError(false); return; }
    setUser(user);
  }

  useEffect(() => {
    getTimeElapsed();
    mountUser();
    setMessage(getRandomFirstMessage());
  }, [listing]);

  async function closeModal() {
    await animate(
      sectionRef.current,
      { y: [50, 500], opacity: [1, 0] },
      { duration: 0.2 },
    );
    setSelectedListing({});
  }

  function goToConvos(convo: Conversation) {
    setSelectedConvo(convo);
    redirect(`/conversations/${convo.cid}`);
  }

  async function createConversation() {
    const { data, error } = await supabase.auth.getUser();
    if (error) { setError(true); redirect("/sign-in"); }
    const created = await createConvo({
      listingId: listing.lid,
      buyerId: data.user.id,
      sellerId: listing.sellerId,
      initialMessage: message,
    });
    redirect("/conversations");
  }

  async function toggleListingOptions() {
    if (optionsModal === true) {
      animateDots(scope.current, { y: [0, 100], opacity: [1, 0] }, { ...transition });
    }
    setOptionsModal((prev) => !prev);
  }

  async function handleDeleteListing() {
    if (!user?.id) return;
    const delList = await deleteListingAction(listing.lid, user?.id);
    if (delList?.success) redirect("/profile");
  }

  async function handleEditListing() { redirect("/edit"); }
  async function handleArchive() { console.log("Archived"); }
  async function handleSold() { console.log("Sold"); }

  const isSeller = listing?.sellerId === user?.id;
  const existingConvo = listing?.conversations?.find(
    (convo: Conversation) => convo.buyerId === user?.id,
  );

  return (
    <>
      {listing?.title && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeModal}
            className="fixed inset-0 z-50 bg-black/20"
          />

          <motion.section
            ref={sectionRef}
            initial={{ y: 500 }}
            animate={{ y: [500, 0] }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-60 bg-white rounded-t-3xl flex flex-col max-h-[92dvh] overflow-y-auto"
          >
            {/* Nav */}
            <nav className="flex items-center justify-between px-4 py-3.5 sticky top-0 bg-white border-b border-[#f0fdf8] z-10 rounded-t-3xl">
              <button
                onClick={closeModal}
                className="w-8.5 h-8.5 rounded-[10px] bg-[#f0fdf8] border border-[#e0faf2] flex items-center justify-center cursor-pointer"
              >
                <IoClose className="text-text text-base" />
              </button>
              <p className="text-[13px] font-bold text-text">Listing details</p>
              <button
              
                className="w-8.5 h-8.5 rounded-[10px] bg-[#f0fdf8] border border-[#e0faf2] flex items-center justify-center cursor-pointer"
              >
                <BsThreeDots className="text-[#6b9e8a] text-base" />
              </button>
            </nav>

            {/* Image carousel */}
            <div className="w-full relative bg-[#f0fdf8] h-65 overflow-hidden shrink-0">
              <Carousel images={listing.imageUrls as string[]} />
              {listing.condition && (
                <span className="absolute top-3 right-3 bg-text text-primary text-[11px] font-bold px-2.5 py-1 rounded-lg z-10">
                  {listing.condition}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 p-4 pb-10">

              {/* Title + price + time */}
              <div>
                <h2 className="text-[20px] font-extrabold text-text leading-tight mb-1">
                  {listing.title}
                </h2>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[26px] font-extrabold text-text">
                    ${listing.price}
                  </span>
                  <span className="text-[12px] text-[#6b9e8a]">{date}</span>
                </div>
              </div>

              {/* Seller actions — message or go to convo */}
              {!isSeller && (
                <div className="bg-[#f7fdfb] border border-[#e0faf2] rounded-2xl p-3.5">
                  {!existingConvo ? (
                    <>
                      <p className="text-[13px] font-bold text-text mb-2.5">
                        Send a message
                      </p>
                      <div className="flex items-center gap-2 bg-white border border-[#c8f5e8] rounded-2xl pl-3.5 pr-1.5 py-1.5 focus-within:border-primary transition-colors">
                        <input
                          type="text"
                          value={message}
                          onChange={handleInput}
                          placeholder="Message the seller…"
                          className="flex-1 text-[13px] text-text placeholder:text-[#6b9e8a] bg-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={createConversation}
                          className="bg-primary text-text text-[12px] font-bold px-3.5 py-2 rounded-xl whitespace-nowrap"
                        >
                          Send →
                        </button>
                      </div>
                    </>
                  ) : (
                    listing.conversations?.map(
                      (convo: Conversation) =>
                        convo.buyerId === user?.id && (
                          <button
                            key={convo.cid}
                            type="button"
                            onClick={() => goToConvos(convo)}
                            className="w-full bg-text text-primary font-bold text-[14px] py-3 rounded-2xl"
                          >
                            Go to conversation →
                          </button>
                        ),
                    )
                  )}
                </div>
              )}

              {/* Owner options */}
              {isSeller && (
                <div className="bg-[#f7fdfb] border border-[#e0faf2] rounded-2xl p-3.5">
                  <p className="text-[13px] font-bold text-text mb-2.5">
                    Manage listing
                  </p>
                  <motion.div
                    ref={scope}
                    animate={{ y: [20, 0], opacity: [0, 1] }}
                    className="flex gap-2 overflow-x-auto no-scrollbar"
                  >
                    {[
                      { label: "Edit", fn: handleEditListing, accent: false },
                      { label: "Mark sold", fn: handleSold, accent: false },
                      { label: "Archive", fn: handleArchive, accent: false },
                    ].map(({ label, fn }) => (
                      <button
                        key={label}
                        onClick={fn}
                        className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-white border border-[#c8f5e8] text-[#6b9e8a]"
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={handleDeleteListing}
                      className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#fff0f0] border border-[#fca5a5] text-red-600"
                    >
                      Delete
                    </button>
                  </motion.div>
                </div>
              )}

              {/* Description */}
              <div className="bg-[#f7fdfb] border border-[#e0faf2] rounded-2xl p-4">
                <p className="text-[13px] font-bold text-text mb-2">Description</p>
                <motion.p
                  animate={{ height: expandDescription ? "auto" : "80px" }}
                  layout
                  className="text-[14px] text-text leading-relaxed overflow-hidden cursor-pointer"
                  onClick={() => setExpandDescription((prev) => !prev)}
                >
                  {listing.description}
                </motion.p>
                <button
                  onClick={() => setExpandDescription((prev) => !prev)}
                  className="text-[12px] text-primary font-semibold mt-1.5"
                >
                  {expandDescription ? "Show less" : "Show more"}
                </button>
              </div>

              {/* Seller */}
              <div className="bg-[#f7fdfb] border border-[#e0faf2] rounded-2xl p-4">
                <p className="text-[13px] font-bold text-text mb-3">The seller</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-[15px] font-bold text-text shrink-0">
                    {(user?.user_metadata?.name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-text">
                      {user?.user_metadata?.name ?? "Seller"}
                    </p>
                    <div className="flex items-center w-1/2 gap-1.5 mt-0.5">
                      <StarRating value={user?.user_metadata?.rating ?? 4} />
                      <span className="text-[11px] text-[#6b9e8a]">(20 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-[#f7fdfb] border border-[#e0faf2] rounded-2xl p-4">
                <p className="text-[13px] font-bold text-text mb-3">Location</p>
                <div className="rounded-xl overflow-hidden border border-[#e0faf2]">
                  <ListingMap
                    ll={
                      listing.latitude && listing.longitude
                        ? [listing.latitude, listing.longitude]
                        : []
                    }
                  />
                </div>
              </div>

            </div>
          </motion.section>
        </>
      )}
    </>
  );
};

export default ListingModal;