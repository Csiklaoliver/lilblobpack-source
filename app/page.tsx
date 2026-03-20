import { getBlobs, getPacks } from "@/lib/store"
import HubClient from "@/components/HubClient"

export const dynamic = "force-dynamic"

export default function Home() {
  const blobs = getBlobs()
  const packs = getPacks()
  return <HubClient packs={packs} allBlobs={blobs} />
}
