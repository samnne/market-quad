import {
  useConvos,
  useListings,
  useMessage,
  useUser,
} from "@/app/store/zustand";
import { Conversation } from "@/src/generated/prisma/client";
import { motion, useAnimate } from "motion/react";
import { ChangeEvent, useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import StarRating from "../StarRating";
import ListingMap from "./ListingMap";
import { redirect, useRouter } from "next/navigation";
import { deleteListingAction } from "@/lib/listing.lib";
import Carousel from "../Carousel";

import { createConvo } from "@/lib/conversations.lib";
import { getUserSupabase } from "@/app/client-utils/functions";
import { ListingWithIncludes, mapToUserSession } from "@/app/types";

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

const ListingModal = ({ listing }: { listing: ListingWithIncludes }) => {
  const [sectionRef, animate] = useAnimate();

  const { setSelectedListing } = useListings();

  const { user, setUser } = useUser();
  const { setSelectedConvo } = useConvos();
  const [expandDescription, setExpandDescription] = useState(false);
  const { setError, setSuccess } = useMessage();
  const router = useRouter();
  const [localReviews, setLocalReviews] = useState(0);
  const [date, setDate] = useState("No time available");
  const [message, setMessage] = useState<string>("");

  const handleInput = (e: ChangeEvent<HTMLInputElement>) =>
    setMessage(e.target.value);

  useEffect(() => {
    async function mountUser() {
      const { user, app_user } = await getUserSupabase();
      if (!user) {
        setError(false);
        return;
      }

      const sessionUser = mapToUserSession(user, app_user);
      setUser(sessionUser);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews/count`,
          {
            method: "get",
            headers: {
              Authorization: listing.sellerId!,
            },
          },
        ).then((res) => res.json());

        setLocalReviews(response.count);
      } catch (err) {
        console.log(err);
      }
    }
    mountUser();
  }, [listing.sellerId, setError, setUser]);
  useEffect(() => {
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

    getTimeElapsed();
  }, [listing]);
  useEffect(() => {
    function messageMount() {
      setMessage(getRandomFirstMessage());
    }
    messageMount();
  }, []);

  async function closeModal() {
    await animate(
      sectionRef.current,
      { y: [50, 500], opacity: [1, 0] },
      { duration: 0.2 },
    );
    setSelectedListing(null);
  }

  function goToConvos(convo: Conversation) {
    setSelectedConvo(convo);
    redirect(`/conversations/${convo.cid}`);
  }

  async function createConversation() {
    const data = await getUserSupabase();
    if (!data.user) {
      setError(true);
      redirect("/sign-in");
    }
    await createConvo({
      listingId: listing.lid,
      buyerId: data.app_user.uid,
      sellerId: listing.sellerId,
      initialMessage: message,
    });
    redirect("/conversations");
  }

  async function handleDeleteListing() {
    if (!user?.id) return;
    const delList = await deleteListingAction(listing.lid, user?.id);
    if (delList?.success) router.refresh();
  }

  async function handleEditListing() {
    redirect("/edit");
  }
  async function handleArchive() {
    if (!user) return;
    const copy = {
      ...listing,
      archived: !listing.archived,
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/listings`,
      {
        method: "put",
        headers: {
          Authorization: user.id!,
        },
        body: JSON.stringify(copy),
      },
    ).then((res) => res.json());

    if (!response.success) {
      setError(true);
      return;
    }

    setSuccess(true);
    setSelectedListing(null);
    router.refresh();
  }
  async function handleSold() {
    if (!user) return;
    const copy = {
      ...listing,
      archived: !listing.sold,
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/listings`,
      {
        method: "put",
        headers: {
          Authorization: user.id!,
        },
        body: JSON.stringify(copy),
      },
    ).then((res) => res.json());

    if (!response.success) {
      setError(true);
      return;
    }

    setSuccess(true);
    setSelectedListing(null);
    router.refresh();
  }

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
            className="fixed inset-x-0 bottom-0 z-60 bg-pill rounded-t-3xl flex flex-col max-h-[92dvh] overflow-y-auto"
          >
            {/* Nav */}
            <nav className="flex items-center justify-between px-4 py-3.5 sticky top-0 bg-pill border-b border-[#f0fdf8] z-60 rounded-t-3xl">
              <button
                onClick={closeModal}
                className="w-8.5 h-8.5 rounded-[10px] bg-[#f0fdf8] border border-[#e0faf2] flex items-center justify-center cursor-pointer"
              >
                <IoClose className="text-text text-base" />
              </button>
              <p className="text-[13px] font-bold text-text">Listing details</p>
              <button className="w-8.5 h-8.5 rounded-[10px] bg-[#f0fdf8] border border-[#e0faf2] flex items-center justify-center cursor-pointer">
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
                      <div className="flex items-center gap-2 bg-pill border border-[#c8f5e8] rounded-2xl pl-3.5 pr-1.5 py-1.5 focus-within:border-primary transition-colors">
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
                    animate={{ y: [20, 0], opacity: [0, 1] }}
                    className="flex gap-2 overflow-x-auto no-scrollbar"
                  >
                    {[
                      { label: "Edit", fn: handleEditListing, key: null },
                      { label: "Mark sold", fn: handleSold, key: "sold" },
                      { label: "Archive", fn: handleArchive, key: "archived" },
                    ].map(({ label, fn, key }) => {
                      const isActive = key
                        ? listing[key as keyof typeof listing]
                        : false;

                      return (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          key={label}
                          onClick={fn}
                          className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                            isActive
                              ? "bg-text text-primary border-text"
                              : "bg-pill border-[#c8f5e8] text-[#6b9e8a]"
                          }`}
                        >
                          {isActive
                            ? key!.charAt(0).toUpperCase() + key!.slice(1)
                            : label}
                        </motion.button>
                      );
                    })}
                    <motion.button
                      whileTap={{
                        scale: 0.95,
                      }}
                      onClick={handleDeleteListing}
                      className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-[#fff0f0] border border-[#fca5a5] text-red-600"
                    >
                      Delete
                    </motion.button>
                  </motion.div>
                </div>
              )}

              {/* Description */}
              <div className="bg-[#f7fdfb] border border-[#e0faf2] rounded-2xl p-4">
                <p className="text-[13px] font-bold text-text mb-2">
                  Description
                </p>
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
                <p className="text-[13px] font-bold text-text mb-3">
                  The seller
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-[15px] font-bold text-text shrink-0">
                    {(user?.user_metadata?.name?.[0] ?? "?").toUpperCase()}
                  </div>

                  <div>
                    <p className="text-[14px] font-bold text-text">
                      {user?.user_metadata?.name ?? "Seller"}
                    </p>
                    <div className="flex items-center  gap-1 mt-0.5">
                      <div className="w-1/2">
                        <StarRating
                          value={user?.app_user?.rating ?? 3}
                          setValue={() => console.log("...")}
                        />
                      </div>

                      <span className="text-[11px] text-[#6b9e8a]">
                        (
                        {localReviews
                          ? localReviews === 1
                            ? `${localReviews} review`
                            : `${localReviews} reviews`
                          : "loading..."}
                        )
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-[#f7fdfb] border border-[#e0faf2] rounded-2xl p-4">
                <p className="text-[13px] font-bold text-text mb-3">Location</p>
                <div className="rounded-xl overflow-hidden border border-[#e0faf2]">
                  <ListingMap />
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
