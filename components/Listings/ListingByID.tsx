import { useListings, useUser } from "@/app/store/zustand";
import { type Listing } from "@/src/generated/prisma/client";

import {
  AnimationOptions,
  motion,
  useAnimate,
  usePresence,
} from "motion/react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";

import { BsThreeDots } from "react-icons/bs";

import { IoClose, IoSearch } from "react-icons/io5";

import StarRating from "../StarRating";
import ListingMap from "./ListingMap";
import { redirect } from "next/navigation";
import { deleteListingAction } from "@/lib/listing.lib";
import { getSession } from "@/lib/lib";
import { deleteImages } from "@/cloudinary/cloudinary";


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
  const [scope, animateDots] = useAnimate();
  const { setSelectedListing } = useListings();
  const [optionsModal, setOptionsModal] = useState(false);
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

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  useEffect(() => {
    getTimeElapsed();

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
  async function toggleListingOptions() {
    if (optionsModal === true) {
      await animateDots(
        scope.current,
        {
          top: "30px",
          right: 0,
          opacity: 0,
        },
        { ...transition },
      );
    }
    setOptionsModal((prev) => !prev);
  }

  async function handleDeleteListing(){ 
 

    const delList = await deleteListingAction(listing.lid)
    if (delList.success){
      redirect('/listings')
    }
  }
  async function handleEditListing(){
    redirect('/edit')
  }

  return (
    <>
      {listing?.title ? (
        <motion.section
          ref={sectionRef}
          initial={{
            y: 50,

            scale: 0.75,
            opacity: 0,
          }}
          whileInView={{
            y: 0,
            x: 0,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: 0.2,
          }}
          className="absolute  flex flex-col min-h-screen   w-screen inset-0 bg-white z-50"
        >
          <nav className="flex sticky top-0 w-full h-20 bg-white justify-between p-4">
            <button onClick={closeModal} className="w-6 h-6">
              <IoClose className="w-full h-full " />
            </button>
            <div className="flex gap-2">
              <span className="w-6 h-6 ">
                <IoSearch className="w-full h-full" />
              </span>
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
              {optionsModal && listing.sellerId === user.uid && (
                <motion.div
                  ref={scope}
                  animate={{
                    top: ["30px", "52px"],
                    right: [0, "8px"],
                    opacity: [0, 1],
                  }}
                  transition={{
                    ...transition,
                  }}
                  className="absolute top-13 rounded-2xl border-2 border-primary text-primary font-bold bg-white min-w-fit w-30 right-2 p-2"
                >
                  <ul className="flex flex-col gap-2">
                    <li onClick={() => handleEditListing()}>Edit</li>
                    <li
                      onClick={() => handleDeleteListing()}
                      className="text-red-500"
                    >
                      Delete
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>
          </nav>
          <section className="flex flex-col grow">
            <div className="w-full">
              <Image
                className="w-full"
                src={listing.imageUrls[0]}
                width={200}
                height={200}
                alt="Bigger Listing View"
              />
            </div>
            <article className="p-5 rounded-t-4xl relative  shadow-2xl border h-full  bg-background flex flex-col">
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
            y: [50, 0],
            opacity: [0, 1],
            dur: 0.2,
          }}
          className="absolute  flex flex-col min-h-screen   w-screen inset-0 bg-white z-50"
        >
          <nav className="flex sticky w-full h-20 bg-white justify-between p-4">
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
          <section className="flex flex-col grow">
            <div className="w-full">
              <Image
                className="w-full"
                src={"/nav-logo.svg"}
                width={200}
                height={200}
                alt="Bigger Listing View"
              />
            </div>
            <article className="p-5 rounded-t-4xl relative  shadow-2xl border h-full  bg-background flex flex-col">
              <h3 className="text-2xl font-semibold"></h3>
              <span className="text-lg"></span>
              <span className="text-gray-400 text-sm"></span>
              <div className="w-full h-25 rounded-2xl mt-4  bg-white drop-shadow-xl drop-shadow-black/20">
                <h4 className="pl-4 pt-4  w-full flex font-semibold text-sm ">
                  Send a Message
                </h4>
                <form action="#" className="p-2 flex gap-2">
                  <button className="font-bold bg-accent rounded-2xl px-2 text-white">
                    Send
                  </button>
                </form>
              </div>
              <div className="mt-2  p-5 drop-shadow-xl drop-shadow-black/20 w-full bg-white rounded-2xl">
                <h4 className="font-bold ">Description</h4>
                <p className="text-md mt-2"></p>
              </div>

              <div className="mt-2 p-2 absolute right-0 -top-1">
                <p className="text-sm bg-accent font-semibold text-white rounded-2xl p-2 w-fit mt-2"></p>
              </div>
              <div className="mt-2 p-5 drop-shadow-xl drop-shadow-black/20 w-full bg-white rounded-2xl ">
                <h3 className="font-bold">The Seller</h3>
                <div className="text-md mt-3 flex gap-2 ">
                  <div>
                    <div className="w-14 h-14 bg-accent/50 rounded-full"></div>
                  </div>
                  <div className="flex-col flex">
                    <h1 className="w-full pl-1 font-semibold"></h1>
                    <div className="w-30 flex gap-1">
                      <StarRating value={4} />

                      <span className="text-sm text-gray-500">(20)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 p-5 flex flex-col gap-2  drop-shadow-xl drop-shadow-black/20 w-full bg-white rounded-2xl">
                <h1 className="w-full pl-1 font-semibold">Location</h1>
                <div className="h-30 w-full bg-gray-300 animate-pulse"></div>
              </div>
            </article>
          </section>
        </motion.section>
      )}
    </>
  );
};

export default ListingModal;
