"use client";

import { BASEURL } from "@/app/client-utils/constants";
import { socket } from "@/app/socket";
import { useConvos, useListings, useMessage, useUser } from "@/app/store/zustand";
import { getMessagesForConvo, sendMessage } from "@/lib/messages.lib";
import { Message } from "@/src/generated/prisma/client";
import { supabase } from "@/supabase/authHelper";
import { motion, useAnimate } from "motion/react";
import { redirect, useParams } from "next/navigation";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { CiCircleInfo } from "react-icons/ci";
import { FaCircle } from "react-icons/fa";
import { IoArrowBack, IoArrowUp } from "react-icons/io5";

function formatTime(date: string | Date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateDivider(date: string | Date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" });
}

const CID = () => {
  const params = useParams();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([]);
  const { selectedConvo, setSelectedConvo } = useConvos();
  const [rows, setInputRows] = useState(1);
  const [messageText, setMessageText] = useState("");
  const { setError } = useMessage();
  const { selectedListing } = useListings();
  const [scope, animate] = useAnimate();
  const [isConnected, setIsConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [messageError, setMessageError] = useState<{
    error?: string;
    success?: boolean;
    new_message?: null;
    message_text?: string;
    message?: undefined;
  }>({ error: "", message_text: "", success: false });
  const { user, setUser } = useUser();

  async function getConvo(cid: string) {
    const response = await fetch(`${BASEURL}/api/conversations/`, {
      method: "post",
      headers: { Authorization: cid || "" },
    });
    const { convo } = await response.json();
    return convo;
  }

  const getListingMetaData = async () => {
    if (!params.cid) return;
    const convo = await getConvo(params.cid);
    if (!convo) {
      setError(true);
      redirect("/conversations");
    }
    setSelectedConvo(convo);
  };

  useEffect(() => {
    mountUser();
    getListingMetaData();
  }, []);

  useEffect(() => {
    mountMessages();
  }, []);

  useEffect(() => {
    if (socket.connected) onConnect();

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => setTransport(transport.name));
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("typing", async (val) => {
      if (!val) {
        await animate(scope.current, { opacity: 0, scale: 0, transformOrigin: "bottom left" }, { type: "spring", stiffness: 300, duration: 0.3 });
      }
      setTyping(val);
    });
    socket.on("disconnect", onDisconnect);
    socket.on("message", ({ message, sender }) => {
      try {
        setMessages((prev) => [...prev, message]);
      } catch (err) {
        console.error("Error handling message event:", err);
      }
    });
    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setError(true);
    });

    handleOpenConvo();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message");
      socket.off("typing");
      socket.off("error");
    };
  }, []);

  function handleOpenConvo() {
    try {
      if (!user?.uid) return;
      socket.emit("open-convo", { cid: params.cid, uid: user.uid });
    } catch (err) {
      console.error("Error opening conversation:", err);
      setError(true);
    }
  }

  async function mountMessages() {
    try {
      const cid = params.cid;
      if (!cid) { setError(true); return; }
      const tempMessages = await getMessagesForConvo(cid);
      if (!tempMessages) { setError(true); return; }
      
      setMessages(tempMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(true);
    }
  }

  async function mountUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { setError(true); return; }
      socket.emit("open-convo", { cid: params.cid, uid: data.user.id });
      setUser(data.user);
    } catch (err) {
      console.error("Error mounting user:", err);
      setError(true);
    }
  }

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setMessageText(e.target.value);
    if (e.target.value.trim()) {
      socket.emit("typing", { cid: params.cid, typing: true });
    } else {
      socket.emit("typing", { cid: params.cid, typing: false });
    }
  }

  async function handleSendMessage() {
    try {
      if (!messageText.trim() || !user?.id) return;
      socket.emit("typing", { cid: params.cid, typing: false });
      socket.emit("message", {
        cid: params.cid,
        message: { senderId: user.id, text: messageText },
      });
      const response = await sendMessage(
        { conversationId: params.cid, senderId: user.id, text: messageText },
        user,
      );
      setMessages((prev) => [...prev, response.new_message]);
      setMessageText("");
      if (response.error) {
        setMessageError({ ...response });
      }
    } catch (err) {
      console.error("Unexpected error sending message:", err);
      setError(true);
    }
  }

  function emptyLine() {
    const lines = messageText.split("\n");
    return lines[lines.length - 1].length === 0;
  }

  const handleEnter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Enter" && e.shiftKey) {
      setInputRows((prev) => prev + 1);
    } else if (e.key === "Backspace" && emptyLine()) {
      setInputRows((prev) => (prev !== 1 ? prev - 1 : prev));
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const listing = selectedConvo?.listing;

  return (
    <div className="absolute inset-0 z-50 min-h-screen flex flex-col bg-background">

      {/* Nav */}
      <nav className="bg-white border-b border-[#e0faf2] px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => redirect("/conversations")}
          className="w-8.5 h-8.5 rounded-[10px] bg-[#f0fdf8] border border-[#c8f5e8] flex items-center justify-center cursor-pointer shrink-0"
        >
          <IoArrowBack className="text-text text-base" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-text truncate">
            {selectedConvo?.listing?.title ?? "Conversation"}
          </p>
          <p className="text-[11px] text-[#6b9e8a]">
            {isConnected ? "Connected" : "Offline"}
          </p>
        </div>

        {isConnected && (
          <span className="w-2 h-2 rounded-full bg-primary border-2 border-white shrink-0" />
        )}

        <button className="w-8.5 h-8.5 rounded-[10px] bg-[#f0fdf8] border border-[#c8f5e8] flex items-center justify-center cursor-pointer shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#6b9e8a" strokeWidth="1.5" />
            <path d="M8 7v4M8 5.5v.5" stroke="#6b9e8a" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </nav>

      {/* Listing pill */}
      {listing && (
        <div className="mx-4 mt-3 mb-1 bg-white border border-[#e0faf2] rounded-2xl px-3 py-2.5 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-[#d6fdf1] rounded-xl flex items-center justify-center text-lg shrink-0">
            📦
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-text truncate">{listing.title}</p>
            <p className="text-[11px] text-[#6b9e8a]">
              ${listing.price}{listing.condition ? ` · ${listing.condition}` : ""}
            </p>
          </div>
          <button
            onClick={() => redirect(`/listings/${listing.lid}`)}
            className="text-[11px] font-bold text-text bg-primary px-3 py-1.5 rounded-lg shrink-0"
          >
            View
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1.5 no-scrollbar">
        {messages.map((message: Message, i) => {
          const isMine = message.senderId === user?.id;
          
          const prevMsg = messages[i - 1 > 0 ? i - 1 : 0];
          const showDivider =
            i === 0 ||
            (prevMsg &&
              new Date(message.createdAt).toDateString() !==
                new Date(prevMsg.createdAt).toDateString());

          const isLast = i === messages.length - 1;
          const hasError =
            !messageError?.success && message.text === messageError?.message_text;

          return (
            <div key={message.mid ?? i}>
              {showDivider && message.createdAt && (
                <p className="text-center text-[11px] text-[#aad4c5] my-3">
                  {formatDateDivider(message.createdAt)}
                </p>
              )}
              <div className={`flex items-end gap-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
                {!isMine && (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-text shrink-0 mb-0.5">
                    {(selectedConvo?.listing?.title?.[0] ?? "?").toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`px-3.5 py-2 text-[14px] leading-snug max-w-[72vw] wrap-break
                      ${isMine
                        ? "bg-text text-primary rounded-[18px] rounded-br-[5px]"
                        : "bg-white text-text border border-[#e0faf2] rounded-[18px] rounded-bl-[5px]"
                      }
                      ${hasError ? "border border-red-300" : ""}
                    `}
                  >
                    {message.text}
                  </motion.div>
                  <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                    {message.createdAt && (
                      <span className="text-[10px] text-[#aad4c5]">
                        {formatTime(message.createdAt)}
                      </span>
                    )}
                    {isMine && isLast && (
                      <span className="text-[10px] text-primary">
                        {message.readAt ? "Read" : "Delivered"}
                      </span>
                    )}
                    {hasError && (
                      <CiCircleInfo className="text-red-400 text-sm" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <motion.div
            ref={scope}
            initial={{ opacity: 0, scale: 0, transformOrigin: "bottom left" }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 bg-white border border-[#e0faf2] rounded-[18px] rounded-bl-[5px] px-3.5 py-2.5 w-fit"
          >
            {[0.1, 0.25, 0.4].map((delay) => (
              <motion.div
                key={delay}
                animate={{ y: [-3, 3] }}
                transition={{ type: "spring", duration: 0.5, delay, repeat: Infinity, repeatType: "reverse" }}
                className="w-1.5 h-1.5 rounded-full bg-[#aad4c5]"
              />
            ))}
          </motion.div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-[#e0faf2] px-3 py-2.5 flex items-end gap-2 shrink-0">
        <button className="w-9 h-9 rounded-[10px] bg-[#f0fdf8] border border-[#c8f5e8] flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="#6b9e8a" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <textarea
          name="message"
          id="message"
          rows={rows}
          value={messageText}
          onKeyDown={handleEnter}
          onChange={handleChange}
          placeholder="Message…"
          className="flex-1 bg-[#f7fdfb] border border-[#c8f5e8] rounded-2xl px-3.5 py-2 text-sm text-text placeholder:text-[#6b9e8a] resize-none outline-none focus:border-primary transition-colors no-scrollbar"
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSendMessage}
          disabled={!messageText.trim()}
          className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
        >
          <IoArrowUp className="text-text text-base" />
        </motion.button>
      </div>

    </div>
  );
};

export default CID;