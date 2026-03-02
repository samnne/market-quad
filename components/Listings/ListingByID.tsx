import { useListings, useUser } from "@/app/store/zustand";
import { type Listing } from "@/src/generated/prisma/client";
import { type ListingInclude } from "@/src/generated/prisma/models";
import { motion, useAnimate, usePresence } from "motion/react";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { AiFillMessage, AiOutlineMessage } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";

import { IoClose, IoSearch } from "react-icons/io5";

import StarRating from "../StarRating";
import ListingMap from "./ListingMap";

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

const ListingModal = ({ listing }: { listing: Listing }) => {
  const [sectionRef, animate] = useAnimate();
  const [isPresent, safeToRemove] = usePresence();
  const { setSelectedListing } = useListings();
  const { user, setUser } = useUser();
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

    setDate(hoursString);
  }
  function getUser() {
    setUser(listing?.seller);
  }
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  useEffect(() => {
    getTimeElapsed();
    getUser();
    setMessage(getRandomFirstMessage());
  }, [listing]);

  async function closeModal() {
    await animate(sectionRef.current, { y: 50, scale: 0, opacity: 0 });
    setSelectedListing({});
  }
  return (
    <>
      {listing.title ? (
        <motion.section
          ref={sectionRef}
          initial={{
            y: 50,
            scale: 0,
            opacity: 0,
          }}
          whileInView={{
            y: 0,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.2,
          }}
          className="absolute flex flex-col min-h-screen h-fit w-screen inset-0 bg-white z-50"
        >
          <nav className="flex fixed w-full h-fit bg-white justify-between p-4">
            <button onClick={closeModal} className="w-6 h-6">
              <IoClose className="w-full h-full " />
            </button>
            <div className="flex gap-2">
              <span className="w-6 h-6 ">
                <IoSearch className="w-full h-full" />
              </span>
              <span className="w-6 h-6">
                <BsThreeDots className="w-full h-full" />
              </span>
            </div>
          </nav>
          <section className="flex flex-col">
            <div className="w-full">
              <Image
                className="w-full"
                src={listing.imageUrls[0]}
                width={200}
                height={200}
                alt="Bigger Listing View"
              />
            </div>
            <article className="p-5 rounded-t-4xl relative shadow-accent shadow-2xl border h-full  bg-background flex flex-col">
              <h3 className="text-2xl font-semibold">{listing?.title}</h3>
              <span className="text-lg">${listing?.price / 100}</span>
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
                  <button className="font-bold bg-accent rounded-2xl px-2 text-white">
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
                      <div className=""></div>
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
        ""
        // <section className="absolute flex flex-col min-h-screen h-fit w-screen inset-0 bg-white z-50">
        //   <nav className="flex fixed w-full h-fit bg-white justify-between p-4">
        //     <button onClick={closeModal} className="w-6 h-6">
        //       <IoClose className="w-full h-full " />
        //     </button>
        //     <div className="flex gap-2">
        //       <span className="w-6 h-6 ">
        //         <IoSearch className="w-full h-full" />
        //       </span>
        //       <span className="w-6 h-6">
        //         <BsThreeDots className="w-full h-full" />
        //       </span>
        //     </div>
        //   </nav>
        //   <article className="flex justify-center items-center text-black text-2xl w-full h-full">
        //     <p>
        //         Error Initializing Listing.
        //     </p>
        //   </article>
        // </section>
      )}
    </>
  );
};

export default ListingModal;
