
import EditProfile from "@/app/components/EditProfile";

export default async function Page({ params }) {
  // Resolve params in the Server Component
  const { id } = await params;

  return <EditProfile id={id} />;
}
