import Page, { metadata as originalMetadata } from "../tools/sponsor-pitch-generator/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  ...originalMetadata,
  alternates: {
    canonical: "https://shortspack.com/sponsor-pitch-generator"
  }
};

export default Page;
