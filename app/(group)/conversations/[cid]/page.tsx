"use client";
import { socket } from "@/app/socket";

import { useConvos, useMessage, useUser } from "@/app/store/zustand";
import { getMessagesForConvo, sendMessage } from "@/lib/messages.lib";
import { Message } from "@/src/generated/prisma/client";
import { supabase } from "@/supabase/authHelper";
import { motion, stagger, useAnimate } from "motion/react";
import { redirect, useParams } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaCircle, FaDotCircle, FaTimes } from "react-icons/fa";
import { IoAddCircle, IoArrowBack, IoArrowUp } from "react-icons/io5";

const CID = () => {
  const params = useParams();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState([]);
  const { selectedConvo, setSelectedConvo } = useConvos();
  const [rows, setInputRows] = useState(1);
  const [messageText, setMessageText] = useState("");
  const { setError } = useMessage();
  const [scope, animate] = useAnimate();
  const [isConnected, setIsConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const { user, setUser } = useUser();

  useEffect(() => {
    mountUser();
  }, []);

  useEffect(() => {
    mountMessages();
  }, []);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("typing", async (val) => {
      if (!val) {
        await animate(
          scope.current,
          {
            opacity: 0,
            scale: 0,
            transformOrigin: "bottom left",
          },
          {
            type: "spring",
            stiffness: 300,
            duration: 0.3,
          },
        );
      }
      setTyping(val);
    });
    socket.on("disconnect", onDisconnect);
    socket.on("message", ({ message, sender }) => {
      try {
        console.log({ message, sender });
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
      if (!user?.uid) {
        console.warn("No user UID available");
        return;
      }
      socket.emit("open-convo", { cid: params.cid, uid: user.uid });
    } catch (err) {
      console.error("Error opening conversation:", err);
      setError(true);
    }
  }

  async function mountMessages() {
    try {
      const cid = params.cid;
      if (!cid) {
        console.error("No conversation ID");
        setError(true);
        return;
      }
      const tempMessages = await getMessagesForConvo(cid);
      if (!tempMessages) {
        console.warn("No messages found");
        setError(true);
        return;
      }
      setMessages(tempMessages);
    } catch (err) {
      console.log("Error fetching messages:", err);
      setError(true);
    }
  }

  async function mountUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Auth error:", error);
        setError(true);
        return;
      }
      if (!data.user) {
        console.log("No user found");
        setError(true);
        return;
      }
      socket.emit("open-convo", { cid: params.cid, uid: data.user.id });
      setUser(data.user);
    } catch (err) {
      console.log("Error mounting user:", err);
      setError(true);
    }
  }

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setMessageText((prev) => e.target.value);
    if (e.target.value.trim()) {
      socket.emit("typing", { cid: params.cid, typing: true });

      return;
    }
    socket.emit("typing", { cid: params.cid, typing: false });
  }
  async function handleSendMessage() {
    try {
      if (!messageText.trim()) {
        console.warn("Empty message");
        return;
      }

      if (!user?.id) {
        console.log("User not authenticated");
        setError(true);
        return;
      }

      const response = await sendMessage(
        {
          conversationId: params.cid,
          senderId: user.id,
          text: messageText,
        },
        user,
      );

      if (response.error) {
        console.log("Error sending message:", response.error);
        setError(true);
        return;
      }

      socket.emit("typing", { cid: params.cid, typing: false });

      socket.emit("message", {
        cid: params.cid,
        message: {
          senderId: user.id,
          text: messageText,
        },
      });

      setMessages((prev) => [...prev, response.new_message]);
      setMessageText("");
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
    if (e.key === "Enter") {
      setInputRows((prev) => prev + 1);
      console.log("Enter key pressed!", rows);
    } else if (e.key === "Backspace" && emptyLine()) {
      console.log("Enter key pressed!", rows);
      setInputRows((prev) => {
        if (prev !== 1) {
          return prev - 1;
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  return (
    <section className="absolute inset-0 z-50 bg-white w-screen min-h-screen overflow-y-auto">
      <nav
        className="w-screen  bg-white sticky border items-center flex justify-between p-4"
        id="navigation"
      >
        <button className="text-2xl" onClick={() => redirect("/conversations")}>
          <IoArrowBack />
        </button>
        <div className="text-2xl">{selectedConvo.listing?.title}</div>
      </nav>
      <div className="w-full h-full max-h-[85dvh] overflow-y-auto flex gap-1 p-4 flex-col">
        {messages.map((message, i) => {
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-2 w-fit text-black rounded-2xl ${message.senderId === user.id ? "self-end bg-primary" : "bg-secondary/50"}`}
            >
              {message.text}
            </motion.div>
          );
        })}
        {typing && (
          <motion.div
            ref={scope}
            initial={{
              opacity: 0,
              scale: 0,
              transformOrigin: "bottom left",
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            className={`flex  justify-center items-center w-fit h-fit p-2 text-black/50  rounded-2xl bg-secondary/50`}
          >
            {[0.1, 0.15, 0.2].map((val) => {
              return (
                <motion.div
                  initial={{
                    y: 0,
                  }}
                  animate={{
                    y: [-2, 2],
                  }}
                  transition={{
                    stiffness: 300,
                    // when: "beforeChildren",
                    type: "spring",
                    duration: 0.2,
                    delay: val,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  key={val * 100}
                >
                  <FaCircle className="" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
        <div ref={messageEndRef} id="message-end"></div>
      </div>
      <div id="message-box" className="w-screen p-4    absolute bottom-0">
        <div className="flex justify-between gap-2 ">
          <textarea
            name="message"
            id="message"
            rows={rows}
            value={messageText}
            onKeyDown={handleEnter}
            onChange={handleChange}
            className="p-2 border w-full rounded-2xl border-black/50"
            placeholder="Type Your Message"
          />
          <button
            onClick={() => {
              handleSendMessage();
            }}
            className="px-4 py-2 font-bold text-white bg-primary rounded-2xl"
          >
            <IoArrowUp />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CID;
