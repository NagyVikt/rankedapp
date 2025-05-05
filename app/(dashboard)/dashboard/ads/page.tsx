import { ImagePlayground } from "@/components/ImagePlayground";
import { getRandomSuggestions } from "@/lib/suggestions";

export const dynamic = "force-dynamic";

export default function AdsPage() {
  return <ImagePlayground suggestions={getRandomSuggestions()} />;
}
