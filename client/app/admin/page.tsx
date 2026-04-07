import { Suspense } from "react"
import AdminContent from "./AdminContent"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminContent />
    </Suspense>
  )
}
