import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getBlobs } from "@/lib/store"
import AdminClient from "@/components/AdminClient"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/api/auth/signin")

  const blobs = getBlobs()
  return <AdminClient blobs={blobs} />
}
