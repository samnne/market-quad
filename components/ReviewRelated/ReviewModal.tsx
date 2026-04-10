import { useReviewModal } from "@/app/store/zustand";
import {
  AnimatePresence,
  motion,

} from "motion/react";
import { FaStar } from "react-icons/fa";
import MakeAReview from "./MakeAReview";

const ReviewModal = () => {
  const { reviewModal, setMakeAReview, makeReview } =
    useReviewModal();

  // async function closeModal() {
  //   setReviewModal(!reviewModal);
  // }
  async function openMakeAReview() {
    setMakeAReview(!makeReview);
  }
  return (
    <>
      <AnimatePresence>
        {reviewModal && (
          <motion.div
            key={123}
            initial={{
              originX: 1,
              originY: 0,
            }}
            exit={{
              originX: 1,

              originY: 0,
              scale: 0,
            }}
            whileInView={{
              scale: [0, 1],
            }}
            transition={{
              duration: 0.3,
              type: "keyframes",
          
              stiffness: 200,
            }}
            className="flex flex-col  bg-background border gap-2 border-primary text-xs text-text z-100 absolute top-12 right-5 w-fit drop-shadow-lg drop-shadow-primary rounded-lg p-2 font-bold "
          >
            <span className="text-sm  flex gap-2 items-center ">
              <FaStar className="text-yellow-300 text-xl" /> You can now review
              eachother!
            </span>

            <button
              onClick={() => openMakeAReview()}
              className="confirm bg-text text-primary rounded-lg p-1  self-end"
            >
              Review
            </button>
          </motion.div>
        )}
        {makeReview && <MakeAReview />}
      </AnimatePresence>
    </>
  );
};

export default ReviewModal;
