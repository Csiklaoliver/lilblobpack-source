import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getBlobs, getPackDefs } from "@/lib/store"
import AdminClient from "@/components/AdminClient"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/api/auth/signin")

  const blobs = getBlobs()
  const packs = getPackDefs()
  return <AdminClient blobs={blobs} packs={packs} />
}
