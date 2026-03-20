"use client";
import DeleteModal from "@/components/Modals/DeleteModal";
import ProfileSections from "@/components/AuthRelated/ProfileSections";
import { getUserListings } from "@/db/listings.db";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { HiLogout } from "react-icons/hi";
import { AiOutlineLike } from "react-icons/ai";
import { CiViewList } from "react-icons/ci";
import { IoChatbubbleOutline } from "react-icons/io5";
import { MdOutlinePrivacyTip } from "react-icons/md";
import {
  useConvos,
  useListings,
  useMessage,
  useUser,
} from "../../store/zustand";

import { cleanUP } from "../../client-utils/functions";
import { supabase } from "@/supabase/authHelper";

function getInitials(name?: string, email?: string) {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

const Profile = () => {
  const [deleteUser, setDeleteUser] = useState(false);
  const {
    user,
    userListings,
    setUserListings,
    setUser,
    reset: userReset,
  } = useUser();
  const { reset: convoReset, convos } = useConvos();
  const { reset: lisReset, setSelectedListing } = useListings();
  const { setError, setSuccess } = useMessage();

  async function mountSession() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log("Auth error:", error);
      setError(true);
      redirect("/sign-in");
    }
    const tempUser = data.user;

    if (!tempUser) {
      setError(true);
      redirect("/sign-in");
    }
    setUser({ ...tempUser });
  }
  async function mountUserListings() {
    if (userListings.length > 0) return;
    try {
      if (!user?.id) {
        console.warn("No user ID available");
        return;
      }
      const tempListings = await getUserListings(user.id);
      if (!tempListings) {
        console.warn("No listings found");
        setError(true);
        return;
      }
      setUserListings(tempListings);
    } catch (err) {
      console.log("Error fetching user listings:", err);
      setError(true);
    }
  }
  useEffect(() => {
    mountSession();
  }, []);
  useEffect(() => {
    if (user) {
      mountUserListings();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    cleanUP({ reset: lisReset }, { reset: userReset }, { reset: convoReset });
    setSuccess(true);
    redirect("/sign-in");
  };

  function openDeleteModal() {
    setDeleteUser(true);
  }
  const unreadCount =
    convos?.filter((c) => (c.unreadCount ?? 0) > 0).length ?? 0;
  const soldCount = userListings?.filter((l) => l.sold).length ?? 0;
  const initials = getInitials(user?.name, user?.email);

  return (
    <>
      <main className="p-4 ">
        <header className="bg-white rounded-[20px] border border-[#e0faf2] p-5">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="w-15 h-15 rounded-full bg-secondary flex items-center justify-center text-[20px] font-bold text-text shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-text truncate">
                {user?.name ?? user?.email?.split("@")[0] ?? "Welcome"}
              </p>
              <p className="text-[12px] text-[#6b9e8a] mt-0.5 mb-2 truncate">
                {user?.email}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                <span className="bg-[#d6fdf1] text-[#0a6644] text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Verified student
                </span>
              </div>
            </div>

            {/* Edit button */}
            <button className="w-8 h-8 rounded-[9px] bg-[#f0fdf8] border border-[#c8f5e8] flex items-center justify-center shrink-0 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"
                  stroke="#6b9e8a"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 mt-4 rounded-xl overflow-hidden border border-[#e0faf2]">
            {[
              { num: userListings?.length ?? 0, label: "Listings" },
              { num: soldCount, label: "Sold" },
              { num: user?.user_metadata?.rating, label: "Rating" },
            ].map(({ num, label }, i) => (
              <div
                key={label}
                className={`py-3 text-center ${i !== 2 ? "border-r border-[#e0faf2]" : ""}`}
              >
                <p className="text-[18px] font-bold text-text">{num}</p>
                <p className="text-[10px] text-[#6b9e8a] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="mt-4">
          <p className="text-[11px] font-medium text-[#6b9e8a] uppercase tracking-widest mb-2.5 pl-1">
            Your market
          </p>
          <div className="bg-white rounded-[20px] border border-[#e0faf2] overflow-hidden">
            <ProfileSections
              sideIcon={<CiViewList className="text-primary" />}
              displayText="Your listings"
              badge={userListings?.length}
              props={{ type: "ulist" }}
            />
            <ProfileSections
              sideIcon={<IoChatbubbleOutline className="text-secondary" />}
              displayText="Your messages"
              badge={unreadCount > 0 ? unreadCount : undefined}
              badgeAccent
              props={{ type: "messages" }}
            />
          </div>
        </div>

        <p className="text-[11px] mt-4 font-medium text-[#6b9e8a] uppercase tracking-widest mb-2.5 pl-1">
          Settings
        </p>
        <section className="flex bg-white items-center shadow shadow-black/20 rounded-4xl">
          <ul className="  w-full flex flex-col ">
            <ProfileSections
              sideIcon={<MdOutlinePrivacyTip />}
              displayText="Privacy"
            />
            <ProfileSections
              sideIcon={<AiOutlineLike />}
              displayText="Preferences"
            />
            {/* Logout row */}
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-[#f0fdf8]">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-[10px] bg-[#f0fdf8] border border-[#e0faf2] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 8h7M10 5l3 3-3 3"
                      stroke="#6b9e8a"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 3v10"
                      stroke="#6b9e8a"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-[14px] font-medium text-text text-3xl">Logout</p>
              </div>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="bg-text text-primary text-[13px] text-2xl font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Log out
                </button>
              </form>
            </div>
          </ul>
        </section>
       <section className="mt-4">
          <p className="text-[11px] font-medium text-[#6b9e8a] uppercase tracking-widest mb-2.5 pl-1">
            Danger zone
          </p>
          <div className="bg-white rounded-[20px] border border-[#e0faf2] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-[10px] bg-[#fff0f0] border border-[#fca5a5] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 6v4M8 11.5v.5"
                      stroke="#dc2626"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M6.8 2.6L1.5 12a1.4 1.4 0 001.2 2h10.6a1.4 1.4 0 001.2-2L9.2 2.6a1.4 1.4 0 00-2.4 0z"
                      stroke="#dc2626"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-red-600">
                    Delete account
                  </p>
                  <p className="text-[11px] text-[#6b9e8a]">
                    This cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteUser(true)}
                className="bg-[#fff0f0] text-red-600 border border-[#fca5a5] text-[13px] font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </section>

        {deleteUser && (
          <DeleteModal
            session={user}
            lisReset={lisReset}
            userReset={userReset}
            setDeleteUser={setDeleteUser}
            deleteUser={deleteUser}
          />
        )}
      </main>
    </>
  );
};

export default Profile;
