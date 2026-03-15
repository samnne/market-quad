import { useListings, useMessage, useUser } from "@/app/store/zustand";
import { type Listing } from "@/src/generated/prisma/client";

import {
  AnimationOptions,
  motion,
  useAnimate,
  usePresence,
} from "motion/react";

import { ChangeEvent, useEffect, useState } from "react";

import { BsThreeDots } from "react-icons/bs";

import { IoArrowUp, IoClose, IoSearch } from "react-icons/io5";

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
  const randomMessages = [
    "Is this still avaliable?",
    "What time could this be picked up?",
    "Hey, I'm interested, when could I pick it up?",
    "I can come pick this up today, does that work?",
    "I'll take it, where should I bring the cash?",
  ];
  const message =
    randomMessages[Math.floor(Math.random() * randomMessages.length)];

  return message;
};

const ListingModal = ({ listing }: { listing: Listing & ListingInclude }) => {
  const [sectionRef, animate] = useAnimate();
  const [scope, animateDots] = useAnimate();
  const [containerRef, animateText] = useAnimate();
  const { setSelectedListing } = useListings();
  const [optionsModal, setOptionsModal] = useState(false);
  const { user, setUser } = useUser();
  const { setError } = useMessage();
  const [date, setDate] = useState("No Time Available");
  const [message, setMessage] = useState<string>("");
  function getTimeElapsed() {
    // Get Time difference
    const currentTime = new Date(Date.now());
    const listingDate = new Date(listing?.createdAt);
    const timeMs = currentTime.getTime() - listingDate.getTime();

    let hoursDiff = timeMs / (1000 * 60 * 60);
    let hoursString = `${Math.floor(hoursDiff).toString()} hours ago`;

    if (hoursDiff < 1) {
      hoursDiff = hoursDiff * 60;
      hoursString = `${Math.round(hoursDiff).toString()} minutes ago`;
    }
    
    if (hoursDiff > 24){
      hoursDiff = hoursDiff / 24
      hoursString = `${Math.round(hoursDiff).toString()} days ago`;
    }
    

    setDate(hoursString);
  }
  console.log(listing);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  async function mountUser() {
    const user = await getUserSupabase();
    if (!user) {
      setError(false);
      return;
    }
    console.log(user);
    setUser(user);
  }
  useEffect(() => {
    getTimeElapsed();
    mountUser();
    setMessage(getRandomFirstMessage());
  }, [listing]);

  async function closeModal() {
    await animate(sectionRef.current, {
      y: 50,
      scale: 0.75,

      opacity: 0,
    });
    setSelectedListing({});

    redirect("/listings");
  }
  const transition: AnimationOptions = {
    type: "spring",
    stiffness: 300,
    bounceDamping: 5,
    duration: 0.2,
  };

  async function createConversation() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      setError(true);
      redirect("/sign-in");
    }
    const created = await createConvo({
      listingId: listing.lid,
      buyerId: data.user.id,
      sellerId: listing.sellerId,
      initialMessage: message,
    });
    console.log(created);
    redirect(`/conversations`);
  }
  async function toggleListingOptions() {
    if (optionsModal === true) {
       animateDots(
        scope.current,
        {
     
          y: [0,100],
          opacity: [1,0]
        },
        { ...transition },
      );
    }

    setOptionsModal((prev) => !prev);
  }

  async function handleDeleteListing() {
    const delList = await deleteListingAction(listing.lid, user.id);
    if (delList?.success) {
      redirect("/profile");
    }
  }
  async function handleEditListing() {
    redirect("/edit");
  }
  async function handleArchive() {
    console.log("Archived");
  }
  async function handleSold() {
    console.log("Sold");
  }

  return (
    <>
      {listing?.title ? (
        <motion.section
          ref={sectionRef}
          drag="y"
          dragConstraints={{
            top: 0,
            bottom: 0,
          }}
          onDragEnd={(event, info) => {
            if (info.velocity.y > 500 || info.offset.y > 100) {
              closeModal();
            } else {
              animate(sectionRef.current, { y: 50 });
            }
          }}
          initial={{
            y: 500,
            opacity: 0,
          }}
          animate={{
            y: [500, 50],
            opacity: [0, 1],
          }}
          transition={{
            duration: 0.2,
          }}
          className="absolute rounded-t-4xl flex flex-col min-h-screen w-screen inset-0 bg-white z-50"
        >
          <motion.nav className="flex relative  rounded-t-4xl z-60  top-0 w-full h-20 bg-white justify-between p-4">
            <button onClick={closeModal} className="w-6 h-6">
              <IoClose className="w-full h-full " />
            </button>
            <div className="flex gap-2">
              <motion.span
                whileTap={{
                  scale: 0.8,
                }}
                transition={{ ...transition }}
                onClick={() => toggleListingOptions()}
                className="w-6 h-6"
              >
                <BsThreeDots className="w-full h-full " />
              </motion.span>
            </div>
          </motion.nav>
          <section className="flex flex-col grow">
            <div
              id="carousel"
              className="w-full relative bg-accent/10  z-0 flex gap-2 overflow-hidden h-full "
            >
              <Carousel images={listing.imageUrls}> </Carousel>
            </div>

            <motion.h4
              ref={containerRef}
             
                animate={{
                  y: [50,0]
                }}
              className="flex flex-col text-black/30 items-center justify-center text-sm font-bold "
            >
              <IoArrowUp />

              <span  onClick={toggleListingOptions} >Toggle Options</span>
              {optionsModal && (
                <motion.div className="flex flex-col rounded-2xl p-2 font-bold bg-white min-w-fit w-30  ">
                  <motion.ul
                    ref={scope}
                    animate={{
                   
                      y: [100, 0],
                      opacity: [0,1]
                    }}
                
                    className="flex   gap-2"
                  >
                    <li onClick={() => handleArchive()}>Archive</li>
                    <li onClick={() => handleSold()}>Mark Sold</li>
                    <li onClick={() => handleEditListing()}>Edit</li>
                    <li
                      onClick={() => handleDeleteListing()}
                      className="text-red-500"
                    >
                      Delete
                    </li>
                  </motion.ul>
                </motion.div>
              )}
            </motion.h4>

            <article className="p-5 rounded-t-4xl relative  shadow-2xl border h-full  bg-background flex flex-col">
              <h3 className="text-2xl font-semibold">{listing?.title}</h3>
              <span className="text-lg">${listing?.price}</span>
              <span className="text-gray-400 text-sm">{date}</span>
              <div className="w-full h-25 rounded-2xl mt-4  bg-white drop-shadow-xl drop-shadow-black/20">
                <h4 className="pl-4 pt-4  w-full flex font-semibold text-sm ">
                  Send a Message
                </h4>
                <form action="#" className="p-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Send a Message!"
                    onChange={handleInput}
                    value={message}
                    className="p-2 w-full outline-0  rounded-2xl bg-gray-200"
                  />
                  <button
                    onClick={(e) => createConversation()}
                    className="font-bold bg-accent rounded-2xl px-2 text-white"
                  >
                    Send
                  </button>
                </form>
              </div>
              <div className="mt-2  p-5 drop-shadow-xl drop-shadow-black/20 w-full bg-white rounded-2xl">
                <h4 className="font-bold ">Description</h4>
                <p className="text-md mt-2">{listing?.description}</p>
              </div>

              <div className="mt-2 p-2 absolute right-0 -top-1">
                <p className="text-sm bg-accent font-semibold text-white rounded-2xl p-2 w-fit mt-2">
                  {listing?.condition}
                </p>
              </div>
              <div className="mt-2 p-5 drop-shadow-xl drop-shadow-black/20 w-full bg-white rounded-2xl ">
                <h3 className="font-bold">The Seller</h3>
                <div className="text-md mt-3 flex gap-2 ">
                  <div>
                    {user?.profileURL ? (
                      <div className="w-14 h-14 bg-accent/50 rounded-full"></div>
                    ) : (
                      <div className="w-14 h-14 bg-accent/50 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-col flex">
                    <h1 className="w-full pl-1 font-semibold">{user?.name}</h1>
                    <div className="w-30 flex gap-1">
                      {user?.rating ? (
                        <StarRating value={user?.rating} />
                      ) : (
                        <StarRating value={4} />
                      )}
                      <span className="text-sm text-gray-500">(20)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 p-5 flex flex-col gap-2  drop-shadow-xl drop-shadow-black/20 w-full bg-white rounded-2xl">
                <h4 className="font-bold ">Location</h4>
                <div className="">
                  <ListingMap />
                </div>
              </div>
            </article>
          </section>
        </motion.section>
      ) : (
        <motion.section
          animate={{
            opacity: [0, 1],
          }}
          className="absolute  flex flex-col min-h-screen    w-screen inset-0 bg-white z-50"
        ></motion.section>
      )}

      <div
        onClick={closeModal}
        className="w-screen h-screen absolute inset-0 z-40 bg-black/20"
      ></div>
    </>
  );
};

export default ListingModal;
