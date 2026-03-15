"use client";
import { condition } from "@/app/client-utils/constants";
import { editListingAction, newListingAction } from "@/lib/listing.lib";
import {
  ChangeEvent,
  KeyboardEvent,
  SubmitEvent,
  useEffect,
  useState,
} from "react";

import * as z from "zod";

import { MdAddToPhotos } from "react-icons/md";
import { useListings, useMessage, useUser } from "@/app/store/zustand";
import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";
import Image from "next/image";

import { IoClose } from "react-icons/io5";
import { cleanUP } from "@/app/client-utils/functions";

import { motion, stagger, useAnimate } from "motion/react";
import { uploadImages } from "@/app/client-utils/functions";
import { deleteImages } from "@/cloudinary/cloudinary";
import { supabase } from "@/supabase/authHelper";
import LocationInput from "../Inputs/LocationInput";

const ListingForm = z.object({
  title: z.string().min(1, "Title Too Short"),
  price: z.number().min(0),
  description: z.string().min(0),
  // location: z.object({
  //   lng: z.number(),
  //   lat: z.number(),
  // }),

  location: z.number(),
  condition: z.string().min(3, "Please Choose a Condition"),
});

type ImageEntry = {
  file: File;
  preview: string;
};

const ListingFormPage = ({ type }: { type: "new" | "edit" }) => {
  const { user, setUser, reset: userReset } = useUser();
  const [rows, setInputRows] = useState(1);
  const {
    selectedListing,
    setSelectedListing,
    reset: lisReset,
  } = useListings();
  const { setError, setSuccess } = useMessage();
  const [scope, animate] = useAnimate();
  const [selectedFiles, setSelectedFiles] = useState<ImageEntry[]>([]);
  // Listing form data inferred by ZOD

  const [listingFormData, setListingFormData] = useState<
    z.infer<typeof ListingForm>
  >({
    title: "",
    price: 0,
    description: "",
    location: 0,
    condition: "",
  });

  async function mountUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      console.error("Auth error:", error);
      setError(true);
      redirect("/sign-in");
    }
    setUser(data.user);
  }

  useEffect(() => {
    if (!scope.current) return;
    animate(
      "#sect",
      {
        y: [50, 0],
        opacity: [0, 1],
      },
      {
        delay: stagger(0.1),
      },
    );
    animate(
      "#from, div",
      {
        y: [50, 0],
        opacity: [0, 1],
      },
      {
        delay: stagger(0.1),
      },
    );
  }, [scope]);
  useEffect(() => {
    mountUser();
    if (type === "edit" && selectedListing.imageUrls) {
      const { title, price, description, condition, imageUrls } =
        selectedListing;
      console.log(selectedListing);
      setListingFormData((prev) => ({
        ...prev,
        title,
        description,
        price,
        condition,
        imageUrls,
      }));

      const files = imageUrls;
      const entries = files.map((url) => ({
        file: null,
        preview: url,
      }));
      setSelectedFiles((prev) => [...entries]);
    }
  }, []);

  function emptyLine() {
    const lines = listingFormData.description.split("\n");
    return lines[lines.length - 1].length === 0;
  }
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setListingFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
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

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const { title, price, location, condition, description } = listingFormData;
    const newPrice = Number.parseInt(price);
    const newLocation = Number.parseInt(location);

    const parseListingForm = ListingForm.safeParse({
      title,
      price: newPrice,
      description,
      condition,
      location: newLocation,
    });

    if (!parseListingForm.success) {
      console.error("Validation error:", parseListingForm.error);
      setError(true);
      return;
    }

    if (!user?.id) {
      console.error("User not authenticated");
      setError(true);
      return;
    }

    const files = selectedFiles.map((img) => {
      if (!img.file) return img.preview;
      return img.file;
    });

    const {
      title: formTitle,
      price: formPrice,
      description: formDesc,
      condition: formCond,
    } = parseListingForm.data;

    if (type === "new") {
      const uploadedUrls = await uploadImages(files);
      const newListing = await newListingAction(
        {
          title: formTitle,
          price: formPrice,
          description: formDesc,
          condition: formCond,
          latitude: 0,
          longitude: 0,
          imageUrls: uploadedUrls,
          sellerId: user.id,
        },
        user.id,
      );
      if (newListing.success) {
        setSuccess(true);
        redirect(`/listings/${newListing.listing.lid}`);
      } else {
        console.log("Failed to create listing:", newListing);
        setError(true);
      }
    } else if (type === "edit") {
      const delImage = [];
      for (let image of selectedListing.imageUrls) {
        if (!selectedFiles.find((file) => file.preview === image)) {
          delImage.push(image);
        }
      }

      if (delImage.length > 0) {
        await deleteImages(delImage);
      }

      const uploadedUrls = await uploadImages(files);
      const editListing = await editListingAction(
        {
          title: formTitle,
          price: formPrice,
          description: formDesc,
          condition: formCond,
          lid: selectedListing.lid,
          latitude: 0,
          longitude: 0,
          imageUrls: uploadedUrls,
          sellerId: user.id,
        },
        user.id,
      );

      if (editListing?.success) {
        setSuccess(true);
        redirect(`/listings/`);
      } else {
        console.log("Failed to edit listing:", editListing);
        setError(true);
      }
    }
  };

  function removeImage(index: number) {
    setSelectedFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview); // clean up memory
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const entries = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedFiles((prev) => [...prev, ...entries]);
  }

  return (
    <motion.main
      initial={{
        y: 50,
        opacity: 0,
      }}
      animate={{
        y: [50, 0],
        opacity: [0, 1],
      }}
      transition={{
        delay: 0.1,
      }}
      ref={scope}
      className="overflow-auto h-[85vh]"
    >
      {/* <div className="px-2 flex relative justify-end ">
      <button className="bg-primary  rounded-xl cursor-pointer text-white mt-4 font-bold px-4 py-2">
        Post Listing
      </button>

      </div> */}
      <header id="sect" className="flex gap-2 overflow-auto no-scrollbar p-2">
        {selectedFiles &&
          selectedFiles.map(({ preview, file }, i) => {
            return (
              <div
                key={preview}
                className="flex  w-full min-w-80 justify-center border border-secondary hover:bg-secondary/25  rounded-xl items-center h-80 relative"
              >
                <button
                  onClick={(e) => {
                    removeImage(i);
                  }}
                  className=" cursor-pointer flex justify-center items-center absolute top-2 right-2 bg-gray-200 w-8 rounded-full  h-8"
                >
                  <IoClose />
                </button>
                <Image
                  src={preview}
                  alt="image upload"
                  width={150}
                  className="w-full rounded-2xl h-full  object-contain"
                  height={150}
                />
              </div>
            );
          })}
        <div className="flex  w-full min-w-80 justify-center border border-secondary hover:bg-secondary/25  rounded-xl items-center h-80 relative">
          <span className="flex flex-col items-center font-semibold  text-secondary">
            <MdAddToPhotos className="w-6 h-6" /> Add Photos / Video
          </span>
          <label
            htmlFor="file"
            className="cursor-pointer absolute w-full h-full"
          ></label>
          <input
            type="file"
            name="file"
            id="file"
            multiple
            onChange={handleFileChange}
            className="hidden absolute w-full h-full"
          />
        </div>
      </header>
      <article id="sect" className="pl-4 text-sm text-gray-400">
        Photos: {selectedFiles?.length}/10
      </article>
      <section id="sect" className="p-2">
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex  form flex-col gap-2 p-2"
          id="form"
        >
          <div className="">
            <label className="" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              className=""
              name="title"
              id="title"
              onChange={handleChange}
              value={listingFormData.title}
              placeholder="Title"
            />
          </div>

          <div className="">
            <label>Price</label>
            <input
              type="number"
              className=""
              name="price"
              id="price"
              onChange={handleChange}
              value={listingFormData.price}
              placeholder="Price"
            />
          </div>
          <h2 className="mt-2 text-xl font-semibold">Condition</h2>
          <ul className="flex gap-4 overflow-x-auto no-scrollbar">
            {condition.map((c) => {
              return (
                <motion.button
                  whileTap={{
                    scale: 0.8,
                  }}
                  key={c}
                  type="button"
                  onClick={() =>
                    setListingFormData((prev) => {
                      return { ...prev, condition: c };
                    })
                  }
                  className={`${c === listingFormData.condition ? "bg-secondary" : "bg-secondary/20"} bg-secondary cursor-pointer text-sm text-text font-semibold px-2 rounded-md py-1  text-nowrap`}
                >
                  {c}
                </motion.button>
              );
            })}
          </ul>
          <div className="">
            <label>Description</label>
            <textarea
              className=""
              name="description"
              id="description"
              rows={rows}
              onChange={handleChange}
              value={listingFormData.description}
              onKeyDown={(e) => handleEnter(e)}
              placeholder="Description "
            />
          </div>
          <div className="">
            <label>Location</label>
            <LocationInput />
          </div>
          <motion.button
            whileTap={{
              scale: 0.8,
            }}
            type="submit"
            className="bg-primary rounded-xl cursor-pointer text-white mt-4 font-bold w-full h-12"
          >
            {type === "edit" ? "Edit" : "Post"} Listing
          </motion.button>
        </form>
      </section>
    </motion.main>
  );
};

export default ListingFormPage;
