"use client";

import { useConvos } from "@/app/store/zustand";
import { getConvos } from "@/lib/conversations.lib";
import { supabase } from "@/supabase/authHelper";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useMessage } from "@/app/store/zustand";
import { motion } from "motion/react";

const Conversations = () => {
  const { convos, setConvos, setSelectedConvo } = useConvos();
  const { setError } = useMessage();
  const [loading, setLoading] = useState(true);

  async function mountConvos() {
  
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
        redirect('/sign-in')
        
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

  useEffect(() => {
    mountConvos();
  }, []);

  return (
    <main>
      {loading ? (
        <div className="p-4 text-center">Loading conversations...</div>
      ) : convos?.length > 0 ? (
        convos.map((convo, i) => {
          return (
            
            <motion.section
            whileInView={{
              y: [50, 0]
              
            }}
            transition={{
              delay: 0.1 * i,
              
              type: 'keyframes'
            }}
              key={convo.cid}
              onClick={(e) => {
                setSelectedConvo(convo);

                redirect(`/conversations/${convo.cid}`);
              }}
              className="border-y  gap-5 flex p-4 items-center h-20"
            >
              <div className="bg-accent w-12 h-12 rounded-full"></div>
              <header>
                <h3 className="text-xl font-medium">
                  {convo.listing?.title || "Unknown Listing"}
                </h3>
                <span className="text-sm text-gray-400 ">
                  Most recent message
                </span>
              </header>
              <div className="grow text-gray-400 h-full flex justify-end text-sm items-start">
                Delivered
              </div>
            </motion.section>
          );
        })
      ) : (
        <div className="p-4 text-center text-gray-400">
          No conversations yet
        </div>
      )}
    </main>
  );
};

export default Conversations;
