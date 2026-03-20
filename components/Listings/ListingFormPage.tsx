"use client";
import { categories, condition } from "@/app/client-utils/constants";
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

import { redirect } from "next/navigation";
import Image from "next/image";

import { IoClose } from "react-icons/io5";

import { motion, stagger, useAnimate } from "motion/react";
import { uploadImages } from "@/app/client-utils/functions";
import { deleteImages } from "@/cloudinary/cloudinary";
import { supabase } from "@/supabase/authHelper";

import { Listing } from "@/src/generated/prisma/client";
import LocationInput from "@/components/Inputs/LocationInput";
import { useRouter } from "next/navigation";

const ListingForm = z.object({
  title: z.string().min(4, "Title Too Short"),
  price: z.number().min(0).max(1000000),
  description: z.string().min(0),
  location: z.object({
    lng: z.number(),
    lat: z.number(),
  }),
  category: z.string().min(3, "Please Choose a Category"),
  condition: z.string().min(3, "Please Choose a Condition"),
});

type ImageEntry = {
  file: File;
  preview: string;
};

const ListingFormPage = ({ type }: { type: "new" | "edit" }) => {
  const {
    user,
    setUser,
    reset: userReset,
    userListings,
    setUserListings,
  } = useUser();
  const router = useRouter()
  const [rows, setInputRows] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const {
    selectedListing,
    setSelectedListing,
    reset: lisReset,
  } = useListings();
  const { setError, setSuccess } = useMessage();
  const [scope, animate] = useAnimate();

  const [selectedFiles, setSelectedFiles] = useState<ImageEntry[]>([]);
  const [disabled, setDisabled] = useState(true);
  const [latLong, setLatLong] = useState<number[] | null[]>([0, 0]);
  const [listingFormData, setListingFormData] = useState({
    title: "",
    price: 0,
    description: "",
    condition: "",
    category: "",
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
    animate("#sect", { y: [50, 0], opacity: [0, 1] }, { delay: stagger(0.1) });
    animate(
      "#from, div",
      { y: [50, 0], opacity: [0, 1] },
      { delay: stagger(0.1) },
    );
  }, [scope]);

  useEffect(() => {
    mountUser();
    if (type === "edit" && selectedListing && selectedListing.imageUrls) {
      const { title, price, description, condition, imageUrls, category } =
        selectedListing;
      setListingFormData((prev) => ({
        ...prev,
        title,
        description,
        price,
        condition,
        imageUrls,
        category,
      }));
      setLatLong([selectedListing.latitude, selectedListing.longitude]);
      const entries = imageUrls.map((url) => ({ file: null, preview: url }));
      setSelectedFiles(entries);
    }
  }, []);

  useEffect(() => {
    const { title, price, condition, description, category } = listingFormData;
    const newPrice = Number.parseInt(price);

    const parseListingForm = ListingForm.safeParse({
      title,
      price: newPrice,
      condition,
      description,
      location: { lng: latLong[1], lat: latLong[0] },
      category: category,
    });

    if (!parseListingForm.success) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, []);

  function emptyLine() {
    const lines = listingFormData.description.split("\n");
    return lines[lines.length - 1].length === 0;
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setListingFormData((prev) => {
      const parseListingForm = ListingForm.safeParse({
        ...prev,
        price: Number.parseInt(prev.price),
        [e.target.name]:
          e.target.name === "price"
            ? Number.parseInt(e.target.value)
            : e.target.value,
        location: { lng: latLong[1], lat: latLong[0] },
      });

      if (!parseListingForm.success) {
        setDisabled(true);
      } else {
        setDisabled(false);
      }

      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleEnter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      setInputRows((prev) => prev + 1);
    } else if (e.key === "Backspace" && emptyLine()) {
      setInputRows((prev) => (prev !== 1 ? prev - 1 : prev));
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const { title, price, condition, description } = listingFormData;
    const newPrice = Number.parseInt(price);

    const parseListingForm = ListingForm.safeParse({
      title,
      price: newPrice,
      description,
      condition,
      category: listingFormData.category,
      location: { lng: latLong[1], lat: latLong[0] },
    });
    if (!parseListingForm.success) {
      setError(true);
      console.log(parseListingForm.error);
      return;
    }

    if (!user?.id) {
      setError(true);
      return;
    }

    const files = selectedFiles.map((img) =>
      !img.file ? img.preview : img.file,
    );
    setIsLoading(true);

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
          latitude: latLong[0],
          longitude: latLong[1],
          imageUrls: uploadedUrls,
          sellerId: user.id,
          category: listingFormData.category,
        },
        user.id,
      );
      if (newListing.success) {
        setSuccess(true);
        setSelectedListing(newListing.listing);
         const notNew = userListings.filter(
          (listing) => listing.lid !== newListing.listing.lid,
        );
        setUserListings([...notNew, newListing.listing]);
        setIsLoading(false);
        redirect("/listings/");
      } else {
        setIsLoading(false);
        setError(true);
      }
    } else if (type === "edit") {
      const delImage = [];
      for (let image of selectedListing.imageUrls) {
        if (!selectedFiles.find((file) => file.preview === image)) {
          delImage.push(image);
        }
      }
      if (delImage.length > 0) await deleteImages(delImage);

      const uploadedUrls = await uploadImages(files);
      const editListing = await editListingAction(
        {
          title: formTitle,
          price: formPrice,
          description: formDesc,
          condition: formCond,
          lid: selectedListing.lid,
          latitude: latLong[0],
          longitude: latLong[1],
          imageUrls: uploadedUrls,
          sellerId: user.id,
          category: listingFormData.category,
        },
        user.id,
      );

      if (editListing?.success) {
        setSuccess(true);
        setSelectedListing(editListing.listing);
        const notEdited = userListings.filter(
          (listing) => listing.lid !== editListing.listing.lid,
        );
        console.log(notEdited, editListing.listing);
        setUserListings([...notEdited, editListing.listing]);
        setIsLoading(false);
        redirect("/listings/");
      } else {
        setIsLoading(false);
        setError(true);
      }
    }
  };

  function removeImage(index: number) {
    setSelectedFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
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

  const inputClass =
    "w-full bg-white border border-[#c8f5e8] rounded-xl px-3.5 py-2.5 text-sm text-[#011d16] placeholder:text-[#6b9e8a] outline-none focus:border-[#17f3b5] transition-colors";

  const chipClass = (active: boolean) =>
    `cursor-pointer text-sm font-semibold px-3.5 py-1.5 rounded-full text-nowrap border transition-all ${
      active
        ? "bg-[#011d16] text-[#17f3b5] border-[#011d16]"
        : "bg-white text-[#6b9e8a] border-[#c8f5e8]"
    }`;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: [50, 0], opacity: [0, 1] }}
      transition={{ delay: 0.1 }}
      ref={scope}
      className="flex flex-col gap-5 px-5 pt-4 pb-10 bg-[#ecfef8] min-h-full"
    >
      {/* Photo strip */}
      <section id="sect" className="flex flex-col gap-2">
        <p className="text-[11px] font-medium text-[#6b9e8a] uppercase tracking-widest">
          Photos
        </p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {selectedFiles.map(({ preview }, i) => (
            <div
              key={preview}
              className="relative shrink-0 w-36 h-36 rounded-2xl border border-[#c8f5e8] bg-white overflow-hidden"
            >
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-[#011d16]/70 flex items-center justify-center cursor-pointer"
              >
                <IoClose className="text-white text-sm" />
              </button>
              <Image
                src={preview}
                alt="upload preview"
                width={144}
                height={144}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Add more */}
          <div className="relative shrink-0 w-36 h-36 rounded-2xl border-2 border-dashed border-[#c8f5e8] bg-white flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#f0fdf8] transition-colors">
            <MdAddToPhotos className="text-[#17f3b5] text-2xl" />
            <span className="text-[11px] text-[#6b9e8a] font-medium text-center leading-tight">
              Add photos
            </span>
            <label htmlFor="file" className="absolute inset-0 cursor-pointer" />
            <input
              type="file"
              name="file"
              id="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        <p className="text-[11px] text-[#6b9e8a]">
          {selectedFiles.length}/10 photos added
        </p>
      </section>

      <div className="h-px bg-[#d6fdf1]" />

      {/* Form fields */}
      <section id="sect">
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex flex-col gap-5"
          id="form"
        >
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[13px] font-medium text-[#011d16]"
              htmlFor="title"
            >
              Title
            </label>
            <input
              type="text"
              className={inputClass}
              name="title"
              id="title"
              onChange={handleChange}
              value={listingFormData.title}
              placeholder="e.g. Calculus textbook — 3rd edition"
            />
          </div>

          {/* Price */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[13px] font-medium text-[#011d16]"
              htmlFor="price"
            >
              Price
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#6b9e8a]">
                $
              </span>
              <input
                type="number"
                className={`${inputClass} pl-7`}
                name="price"
                id="price"
                min={0}
                max={1000000}
                onChange={handleChange}
                value={listingFormData.price}
                placeholder="0"
              />
            </div>
          </div>

          <div className="h-px bg-[#d6fdf1]" />

          {/* Condition */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-medium text-[#011d16]">Condition</p>
            <ul className="flex gap-2 overflow-x-auto no-scrollbar">
              {condition.map((c) => (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  key={c}
                  type="button"
                  onClick={() =>
                    setListingFormData((prev) => ({ ...prev, condition: c }))
                  }
                  className={chipClass(c === listingFormData.condition)}
                >
                  {c}
                </motion.button>
              ))}
            </ul>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-medium text-[#011d16]">Category</p>
            <ul className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map(
                (c) =>
                  c !== "All" && (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      key={c}
                      type="button"
                      onClick={() =>
                        setListingFormData((prev) => ({ ...prev, category: c }))
                      }
                      className={chipClass(c === listingFormData.category)}
                    >
                      {c}
                    </motion.button>
                  ),
              )}
            </ul>
          </div>

          <div className="h-px bg-[#d6fdf1]" />

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[13px] font-medium text-[#011d16]"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className={inputClass}
              name="description"
              id="description"
              rows={rows}
              onChange={handleChange}
              value={listingFormData.description}
              onKeyDown={(e) => handleEnter(e)}
              placeholder="Describe the item — edition, defects, extras included…"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#011d16]">
              Location
            </label>
            <div className="transition-colors">
              <LocationInput llSetter={setLatLong} ll={latLong} />
            </div>
            <p className="text-[11px] text-[#6b9e8a]">
              Exact address shared only after buyer confirms
            </p>
          </div>

          <div className="h-px bg-[#d6fdf1]" />

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading || disabled}
            className="w-full bg-primary text-text font-bold text-[15px] py-3.5 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              `${type === "edit" ? "Save changes" : "Post listing"}`
            )}
          </motion.button>

          <button
            type="button"
          onClick={() => router.back()}
            className="w-full bg-transparent text-[#6b9e8a] border border-[#c8f5e8] font-medium text-[14px] py-3 rounded-2xl"
          >
            Cancel
          </button>
        </form>
      </section>
    </motion.div>
  );
};

export default ListingFormPage;
