"use client";
import {
  categories,
  condition,
  UVIC_LNG_LAT,
} from "@/app/client-utils/constants";
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
import { getUserSupabase, uploadImages } from "@/app/client-utils/functions";
import { deleteImages } from "@/cloudinary/cloudinary";

import LocationInput from "@/components/Inputs/LocationInput";
import { useRouter } from "next/navigation";
import { mapToUserSession } from "@/app/types";

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
  file: File | null; // ← allow null for existing cloudinary images
  preview: string;
};

const ListingFormPage = ({ type }: { type: "new" | "edit" }) => {
  const {
    user,
    setUser,

    userListings,
    setUserListings,
  } = useUser();

  const router = useRouter();
  const [rows, setInputRows] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const {
    selectedListing,
    setSelectedListing,

  } = useListings();
  const { setError, setSuccess } = useMessage();
  const [scope, animate] = useAnimate();

  const [selectedFiles, setSelectedFiles] = useState<ImageEntry[]>([]);
  const [disabled, setDisabled] = useState(true);
  const [latLong, setLatLong] = useState<number[]>([0, 0]);
  const [listingFormData, setListingFormData] = useState<{
    title: string;
    price: string;
    description: string;
    condition: string;
    category: string;
  }>({
    title: "",
    price: "0",
    description: "",
    condition: "",
    category: "",
  });

  useEffect(() => {
    
    if (!scope.current) return;
    animate("#sect", { y: [50, 0], opacity: [0, 1] }, { delay: stagger(0.1) });
    animate(
      "#from, div",
      { y: [50, 0], opacity: [0, 1] },
      { delay: stagger(0.1) },
    );
  }, [scope, animate]);
  useEffect(() => {
    async function mountUser() {
      const { user, error, app_user } = await getUserSupabase();
      if (error || !user) {
        console.error("Auth error:", error);
        setError(true);
        redirect("/sign-in");
      }

    const sessionUser = mapToUserSession(user, app_user);
setUser(sessionUser);
    }
    mountUser();
  }, [setError, setUser]);

  useEffect(() => {
    if (type === "edit" && selectedListing && selectedListing.imageUrls) {
      function mountListingFormData({
        title,
        price,
        description,
        condition,
        category,
        imageUrls,
      }: {
        category: string;
        imageUrls: string[];
        title: string;
        price: string;
        description: string;
        condition: string;
      }) {
        setListingFormData((prev) => ({
          ...prev,
          title,
          price,
          description,
          condition,
          category,
        }));
        if (
          selectedListing &&
          selectedListing.latitude &&
          selectedListing.longitude
        ) {
          setLatLong([
            selectedListing.latitude ?? UVIC_LNG_LAT[1],
            selectedListing.longitude ?? UVIC_LNG_LAT[0],
          ]);
        }
        const entries = imageUrls.map((url) => ({ file: null, preview: url }));
        setSelectedFiles(entries);
      }
      const { title, price, description, condition, imageUrls, category } =
        selectedListing;
      mountListingFormData({
        title,
        price: String(price),
        description,
        condition: condition ?? "",
        category: category ?? "",
        imageUrls,
      });
    }
  }, [selectedListing, type]);

  useEffect(() => {
    function parseFormPlease() {
      const { title, price, condition, description, category } =
        listingFormData;
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
    }
    parseFormPlease();
  }, [latLong, listingFormData]);

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
      category: listingFormData.category ?? "",
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
    } else if (type === "edit" && selectedListing) {
      const delImage = [];
      for (const image of selectedListing.imageUrls) {
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
    "w-full bg-pill border border-background rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-primary/50 outline-none focus:border-primary transition-colors";

  const chipClass = (active: boolean) =>
    `cursor-pointer text-sm font-semibold px-3.5 py-1.5 rounded-full text-nowrap border transition-all ${
      active
        ? "bg-text text-primary border-text"
        : "bg-pill text-primary/50 border-background"
    }`;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: [50, 0], opacity: [0, 1] }}
      transition={{ delay: 0.1 }}
      ref={scope}
      className="flex flex-col gap-5 px-5 pt-4 pb-10  min-h-full"
    >
      {/* Photo strip */}
      <section id="sect" className="flex flex-col gap-2">
        <p className="text-[11px] font-medium text-primary/50 uppercase tracking-widest">
          Photos
        </p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {selectedFiles.map(({ preview }, i) => (
            <div
              key={preview}
              className="relative shrink-0 w-36 h-36 rounded-2xl border border-background bg-pill overflow-hidden"
            >
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-text/70 flex items-center justify-center cursor-pointer"
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
          <div className="relative shrink-0 w-36 h-36 rounded-2xl border-2 border-dashed border-background bg-pill flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#f0fdf8] transition-colors">
            <MdAddToPhotos className="text-primary text-2xl" />
            <span className="text-[11px] text-primary/50 font-medium text-center leading-tight">
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
        <p className="text-[11px] text-primary/50">
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
              className="text-[13px] font-medium text-text"
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
              className="text-[13px] font-medium text-text"
              htmlFor="price"
            >
              Price
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-primary/50">
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
            <p className="text-[13px] font-medium text-text">Condition</p>
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
            <p className="text-[13px] font-medium text-text">Category</p>
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
              className="text-[13px] font-medium text-text"
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
            <label className="text-[13px] font-medium text-text">
              Location
            </label>
            <div className="transition-colors">
              <LocationInput
                llSetter={setLatLong}
                ll={[
                  selectedListing?.latitude ? selectedListing?.latitude : 0,
                  selectedListing?.longitude ? selectedListing?.longitude : 0,
                ]}
              />
            </div>
            <p className="text-[11px] text-primary/50">
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
            className="w-full bg-transparent text-primary/50 border border-background font-medium text-[14px] py-3 rounded-2xl"
          >
            Cancel
          </button>
        </form>
      </section>
    </motion.div>
  );
};

export default ListingFormPage;
