// src/app/experts/[slug]/head.jsx
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default async function Head({ params }) {
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", params.slug));
  const querySnapshot = await getDocs(q);

  let profile = null;
  querySnapshot.forEach((doc) => {
    profile = { ...doc.data(), id: doc.id };
  });

  if (!profile) {
    return (
      <>
        <title>Profile Not Found | XmyTravel</title>
        <meta name="robots" content="noindex" />
      </>
    );
  }

  const metaTitle = `${profile.fullName} - ${profile.tagline || "Travel Expert"}`;
  const metaDescription = profile.about?.substring(0, 200) || "Verified expert on XmyTravel";
  const metaImage = profile.photo || "https://www.xmytravel.com/logolttx.svg";

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />

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
      <meta name="twitter:site" content="@Xmytravel" />
      <meta name="twitter:creator" content={`@${params.slug}`} />
    </>
  );
}
