
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default async function Head({ params }) {
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", params.slug));
  let profile = null;

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        profile = { ...doc.data(), id: doc.id };
      });
    }
  } catch (error) {
    console.error("Error fetching profile for meta tags:", error);
  }

  if (!profile) {
    return (
      <>
        <title>Profile Not Found | XmyTravel</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="The requested expert profile was not found on XmyTravel." />
      </>
    );
  }

  const metaTitle = `${profile.fullName} - ${profile.tagline || "Travel Expert"} | XmyTravel`;
  const metaDescription = profile.about
    ? profile.about.length > 160
      ? `${profile.about.substring(0, 157)}...`
      : profile.about
    : "Discover expert travel advice from a verified professional on XmyTravel.";
  const metaImage = profile.photo && profile.photo.endsWith(".jpg") || profile.photo.endsWith(".png")
    ? profile.photo
    : "https://www.xmytravel.com/default-profile.jpg"; // Use a default JPG image instead of SVG

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={`https://www.xmytravel.com/experts/${params.slug}`} />
      <meta property="og:type" content="profile" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${profile.fullName}'s profile image`} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@XmyTravel" />
      <meta name="twitter:creator" content={`@${profile.username || params.slug}`} />
    </>
  );
}