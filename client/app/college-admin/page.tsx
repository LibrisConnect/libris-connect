import { Suspense } from "react"
import CollegeAdminContent from "./CollegeAdminContent"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollegeAdminContent />
    </Suspense>
  )
}
