"use client";

import { redirect, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

const CID = () => {
  const params = useParams();
  const messageEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  function scrollToBottom(){
    messageEndRef.current?.scrollIntoView({behavior: "smooth"})
  }
  useEffect(()=>{
    scrollToBottom()
  }, [messages])
  return (
    <section className="absolute inset-0 z-50 bg-white w-screen min-h-screen overflow-y-auto">
      <nav
        className="w-screen h-20 bg-white sticky border items-center flex justify-between p-4"
        id="navigation"
      >
        <button className="text-2xl" onClick={() => redirect("/conversations")}>
          <IoArrowBack />
        </button>
        <div className="text-2xl">{params?.cid}</div>
      </nav>
      <div className="w-full h-full max-h-[82dvh] overflow-y-auto flex gap-5 p-4 flex-col" >
        {messages.map((message, i) => {
          return <div key={message} className={`p-2 w-fit text-black  rounded-2xl ${i % 2 !== 0 ? 'self-end bg-primary' : 'bg-secondary/50'}`}>Hello {message}</div>;
        })}
        <div ref={messageEndRef} id="message-end"></div>
      </div>
      <div id="message-box" className="w-screen p-4   absolute bottom-0">
        <div className="flex justify-between ">
          <input
            type="text"
            name="message"
            id="message"
            className="p-2 border rounded-2xl border-black/50"
            placeholder="Type Your Message"
          />
          <button
            onClick={() => {
              setMessages((prev) => [...prev, prev[prev.length - 1] + 1]);
            }}
            className="px-4 py-2 font-bold text-white bg-primary rounded-2xl"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
};

export default CID;
