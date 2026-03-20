"use client";
import { cleanUP } from "@/app/client-utils/functions";
import { useConvos, useListings, useUser } from "@/app/store/zustand";
import { UserSession } from "@/app/types";

import { supabase } from "@/supabase/authHelper";
import { motion, useAnimate } from "motion/react";
import { redirect } from "next/navigation";

const DeleteModal = ({
  deleteUser,
  setDeleteUser,
  session,
}: {
  deleteUser: boolean;
  setDeleteUser: Function;
  session: UserSession;
}) => {
  const [scope, animate] = useAnimate();
  const { reset: lisReset } = useListings();
  const { reset: userReset } = useUser();
  const { reset: convoReset } = useConvos();
  async function closeModal() {
    await animate(
      scope.current,
      {
        y: -100,
        opacity: 0,
      },
      {
        duration: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    );
    setDeleteUser(false);
  }

  async function handleDeleteUser() {
    if (session?.id) {
      await supabase.auth.admin.deleteUser(session?.uid, true);
    }
    cleanUP({ reset: lisReset }, { reset: userReset }, { reset: convoReset });
    await animate(
      scope.current,
      { y: 20, opacity: 0 },
      { duration: 0.2, type: "spring", stiffness: 300 },
    );
    setDeleteUser(false);
    redirect("/sign-in");
  }
  return (
    <>
      {deleteUser && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeModal}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none">
            <motion.div
              ref={scope}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.25,
                type: "spring",
                stiffness: 300,
                damping: 28,
              }}
              className="bg-white rounded-[24px] p-6 w-full max-w-[340px] flex flex-col gap-5 pointer-events-auto"
            >
              {/* Warning icon */}
              <div className="w-[52px] h-[52px] bg-[#fff0f0] border border-[#fca5a5] rounded-2xl flex items-center justify-center mx-auto">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M11 8v5M11 14.5v.5"
                    stroke="#dc2626"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9.4 3.2L2 18a1.6 1.6 0 001.4 2.4h15.2A1.6 1.6 0 0020 18L12.6 3.2a1.6 1.6 0 00-3.2 0z"
                    stroke="#dc2626"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Copy */}
              <div className="text-center">
                <h2 className="text-[17px] font-extrabold text-[#011d16] mb-2">
                  Delete your account?
                </h2>
                <p className="text-[13px] text-[#6b9e8a] leading-relaxed">
                  This will permanently remove all your listings, conversations,
                  and data.{" "}
                  <span className="text-red-600 font-bold">
                    This cannot be undone.
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDeleteUser}
                  className="w-full bg-red-600 text-white text-[14px] font-bold py-3.5 rounded-2xl cursor-pointer"
                >
                  Yes, delete my account
                </motion.button>
                <button
                  onClick={closeModal}
                  className="w-full bg-[#f0fdf8] text-[#6b9e8a] border border-[#c8f5e8] text-[14px] font-semibold py-3.5 rounded-2xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </>
  );
};

export default DeleteModal;
