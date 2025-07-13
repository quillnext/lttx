

// // // // "use client";

import EditProfile from "@/app/components/EditProfile";

export default async function Page({ params }) {
  // Resolve params in the Server Component
  const { id } = params; // Direct access is safe in an async Server Component

  return <EditProfile id={id} />;
}