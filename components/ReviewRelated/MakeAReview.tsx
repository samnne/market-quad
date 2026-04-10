import { motion } from "motion/react";
import StarRating from "../StarRating";
import {
  useConvos,
  
  useReviewModal,
  useUser,
} from "@/app/store/zustand";
import { IoStarOutline } from "react-icons/io5";
import { ChangeEvent, useState, useEffect } from "react";

const MakeAReview = () => {
  const reviewState = useReviewModal();
  const [hoverValue, setHoverValue] = useState(3);
  const { user } = useUser();
  const { selectedConvo } = useConvos();

  const [reviewForm, setReviewForm] = useState<{ body: string }>({
    body: "",
  });
  const [selectedRole, setSelectedRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && selectedConvo) {
      if (user.id === selectedConvo.buyerId) {
        setSelectedRole("BUYER");
      } else if (user.id === selectedConvo.sellerId) {
        setSelectedRole("SELLER");
      }
    }
  }, [user, selectedConvo]);

  const handleSumbitReview = async () => {
    if (!user || !selectedConvo) return;
    setIsSubmitting(true);
    try {
      const reviewerId = user.id;
      const revieweeId =
        selectedRole === "BUYER"
          ? selectedConvo.buyerId
          : selectedConvo.sellerId;
      const data = {
        rating: hoverValue,
        comment: reviewForm.body || null,
        role: selectedRole,
        reviewerId,
        revieweeId,
      };
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: user.id!,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        reviewState.reset();
      } else {
        console.error("Failed to submit review");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <motion.div
        exit={{
          y: [0, 50],
          scale: [1, 0.5],
          opacity: [1, 0],
        }}
        animate={{
          y: [50, 0],
          scale: [0.5, 1],
          opacity: [0, 1],
        }}
        className="fixed z-120 max-w-100 w-full font-inc-sans text-white top-1/2 left-1/2 -translate-1/2 bg-text p-8 border border-primary/25 rounded-3xl  "
      >
        <header className="flex flex-col space-y-4">
          <div className="bg-primary/20 w-20 h-20 p-6 rounded-xl flex justify-center items-center  ">
            <IoStarOutline className="w-full h-full text-primary" />
          </div>
          <h2 className="text-2xl">
            Leave a <span className="text-primary font-bold">review</span>
            <div className="text-gray-400 text-sm">
              <span>Write a review about your experience!</span>
            </div>
          </h2>
        </header>
        <div className="flex flex-col gap-2 mt-4">
          <span className="uppercase text-xs font-bold">
            You are reviewing as
          </span>
          <div className="flex gap-2">
            {["BUYER", "SELLER"].map((val) => {
              const isBuyer = user?.id === selectedConvo?.buyerId;
              const isSeller = user?.id === selectedConvo?.sellerId;
              const canReviewAs =
                (val === "BUYER" && isBuyer) || (val === "SELLER" && isSeller);
              return (
                <button
                  key={val}
                  onClick={() =>
                    canReviewAs && setSelectedRole(val as "BUYER" | "SELLER")
                  }
                  disabled={!canReviewAs}
                  className={`w-full py-1 font-bold px-4 capitalize ${selectedRole === val && canReviewAs ? "text-primary border-primary bg-primary/20" : canReviewAs ? "bg-primary/20 text-white border-white/50" : "bg-gray-500 text-gray-300 border-gray-500 cursor-not-allowed"} rounded-lg border `}
                >
                  {val === "BUYER" ? "Buyer" : "Seller"}
                </button>
              );
            })}
          </div>
        </div>
        <div className="w-full mt-4 flex  pb-4 flex-col">
          <span className="text-white text-sm font-bold uppercase">Rating</span>
          <div className="w-2/3">
            <StarRating value={hoverValue} setValue={setHoverValue} />
          </div>
          <span className="self-center text-sm text-gray-400 font-light pt-4 font-serif">
            {["Terrible", "Poor", "Okay", "Great", "Excellent"].find(
              (val, i) => i + 1 === hoverValue,
            )}
          </span>
        </div>
        <div>
          <span className="text-sm font-bold text-white uppercase">
            Comment <span className="text-gray-400 text-xs">(optional)</span>
          </span>
          <textarea
            className="w-full min-h-20 bg-primary/20 font-light p-4 font-sans text-sm rounded-2xl border border-primary/30 "
            placeholder="Fast response, easy pickup, item was exactly as described..."
            name="body"
            id="body"
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setReviewForm((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
            value={reviewForm.body}
          ></textarea>
        </div>
        <div className="w-full mt-4">
          <motion.button
            whileTap={{
              scale: 0.9,
            }}
            className="w-full bg-primary text-text border font-bold border-white/20 py-1 rounded-lg flex justify-center items-center text-center"
            onClick={handleSumbitReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        animate={{
          opacity: [0, 0.75],
        }}
        exit={{
          opacity: [0.75, 0],
        }}
        onClick={() => reviewState.reset()}
        className="bg-black w-dvw h dvh fixed inset-0 z-110 opacity-75 "
      ></motion.div>
    </>
  );
};

export default MakeAReview;
