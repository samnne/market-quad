
import { NextRequest, NextResponse } from "next/server.js";
import { createNewListing, getListings, getOthersListings } from "@/db/listings.db";
import { uploadImages } from "@/cloudinary/cloudinary";



export async function GET(req: NextRequest){
  const userId = req.headers.get('authorization');

 
  try {
    if (userId){
      return NextResponse.json({
        listings: await getOthersListings(userId),
        success: true
      })
    }
    const listings = await getListings();
    

    return NextResponse.json({
      listings,
      success: true
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({message:"Failed to Fetch Listings",status: 500, success: false})
  }
};
export async function POST(req: NextRequest) {
  const listingFormData: listingFormData = await req.json();
 
  try {

    const createdListing = await createNewListing(listingFormData);

    return NextResponse.json({
      message: "Successfully Created Listing",
      listing: createdListing,
      success: true
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({message:"Failed to Create Listing",status: 500, success: false})
  }
};

