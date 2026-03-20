"use client";

import { useConvos, useMessage } from "@/app/store/zustand";
import { getConvos } from "@/lib/conversations.lib";
import { supabase } from "@/supabase/authHelper";
import { motion } from "motion/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import {  IoIosRefresh } from "react-icons/io";

const AVATAR_COLORS = [
  { bg: "#17f3b5", text: "#011d16" },
  { bg: "#d282f9", text: "#011d16" },
  { bg: "#f544bd", text: "#ffffff" },
  { bg: "#011d16", text: "#17f3b5" },
  { bg: "#f0fdf8", text: "#0a6644", border: "1.5px solid #c8f5e8" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(date: string | Date) {
  if (!date) return "";
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return new Date(date).toLocaleDateString("en", { weekday: "short" });
}

const Conversations = () => {
  const { convos, setConvos, setSelectedConvo } = useConvos();
  const { setError } = useMessage();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  async function getConvosClient() {
    setLoading(true);
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Auth error:", error);
      setError(true);
      return;
    }
    if (!data.user) {
      console.warn("No user found");
      setError(true);
      redirect("/sign-in");
    }
    const tempConvos = await getConvos(data.user.id);
    if (!tempConvos) {
      console.warn("No conversations found");
      setError(true);
      return;
    }
    setConvos(tempConvos);
    setLoading(false);
  }
  async function mountConvos() {
    if (convos?.length > 0) {
      setLoading(false);
      return;
    }
    getConvosClient();
  }

  useEffect(() => {
    mountConvos();
  }, []);

  const filtered = query.trim()
    ? convos?.filter((convo) => {
        const title = convo.listing?.title ?? "";
        const lastMsg = convo.messages?.[convo.messages.length - 1]?.text ?? "";
        return (
          title.toLowerCase().includes(query.toLowerCase()) ||
          lastMsg.toLowerCase().includes(query.toLowerCase())
        );
      })
    : convos;

  return (
    <div className="flex flex-col gap-0 bg-[#ecfef8] min-h-full">
      {/* Search */}
      <div className="px-4 pt-4 pb-3">
        <div className="bg-white border border-[#c8f5e8] rounded-2xl px-4 py-2.5 flex items-center gap-2.5 focus-within:border-[#17f3b5] transition-colors">
          <svg
            className="w-3.5 h-3.5 shrink-0 opacity-40"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle cx="9" cy="9" r="6" stroke="#011d16" strokeWidth="1.5" />
            <path
              d="M13.5 13.5L17 17"
              stroke="#011d16"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 text-[13px] text-text placeholder:text-[#6b9e8a] bg-transparent outline-none"
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery("")}
              className="text-[#6b9e8a] text-sm leading-none cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading skeletons */}
      {loading ? (
        <div className="flex flex-col">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e8faf4]"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-[#e0faf2] animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3 w-2/3 bg-white rounded-full animate-pulse" />
                <div className="h-2.5 w-1/2 bg-[#e8faf4] rounded-full animate-pulse" />
              </div>
              <div className="h-2.5 w-10 bg-[#e8faf4] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered?.length > 0 ? (
        <>
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-medium text-[#6b9e8a] uppercase tracking-widest px-4 pt-2 pb-2">
              {query.trim()
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                : "Recent"}
            </p>
            <button  onClick={async ()=> await getConvosClient()} className="pr-4 w-10 h-10"><IoIosRefresh /></button>
          </div>

          {filtered.map((convo, i) => {
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const title = convo.listing?.title || "Unknown listing";
            const initials = getInitials(title);
            const lastMsg = convo.messages?.[convo.messages.length - 1];
            const unread = convo.unreadCount ?? 0;
            const timestamp = convo.updatedAt ?? convo.createdAt;

            return (
              <motion.div
                key={convo.cid}
                whileInView={{ y: [20, 0], opacity: [0, 1] }}
                transition={{ delay: 0.08 * i, type: "keyframes" }}
                onClick={() => {
                  setSelectedConvo(convo);
                  redirect(`/conversations/${convo.cid}`);
                }}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e8faf4] cursor-pointer active:bg-[#e8faf4] transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0"
                  style={{
                    background: color.bg,
                    color: color.text,
                    border: color.border ?? "none",
                  }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-text truncate">
                    {title}
                  </h3>
                  <p className="text-[12px] text-[#6b9e8a] truncate">
                    {lastMsg?.text ?? "Most recent message"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] text-[#aad4c5]">
                    {timeAgo(timestamp)}
                  </span>
                  {unread > 0 ? (
                    <div className="w-4.5 h-4.5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-[#011d16]">
                      {unread}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#aad4c5]">
                      Delivered
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-20 gap-4">
          <div className="w-14 h-14 bg-[#d6fdf1] rounded-2xl flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                stroke="#0a6644"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-[14px] text-[#6b9e8a] text-center leading-relaxed">
            {query.trim() ? (
              <>
                No conversations match{" "}
                <span className="text-[#011d16] font-semibold">"{query}"</span>.{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => setQuery("")}
                >
                  Clear search
                </span>
              </>
            ) : (
              <>
                No conversations yet.{" "}
                <span
                  className="text-[#011d16] font-semibold underline cursor-pointer"
                  onClick={() => redirect("/listings")}
                >
                  Browse listings
                </span>{" "}
                to start chatting.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default Conversations;
