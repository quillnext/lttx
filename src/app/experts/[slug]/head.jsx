
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default async function Head({ params }) {
  const { slug } = await params;
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", slug));

  let profileData = null;

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        profileData = { ...doc.data(), id: doc.id };
      });
    }
  } catch (error) {
    console.error("Error fetching profile for meta tags:", error);
  }

  if (!profileData) {
    return (
      <>
        <title>Profile Not Found | XmyTravel</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="The requested expert profile was not found on XmyTravel." />
      </>
    );
  }

  const metaTitle = `${profileData.fullName} - ${profileData.tagline || "Travel Expert"} | XmyTravel`;
  const metaDescription =
    profileData.about?.length > 160
      ? `${profileData.about.substring(0, 157)}...`
      : profileData.about || "Discover expert travel advice from a verified professional on XmyTravel.";

  const metaImage =
    profileData.photo && (profileData.photo.endsWith(".jpg") || profileData.photo.endsWith(".png"))
      ? profileData.photo
      : "https://www.xmytravel.com/default-profile.jpg";

  const profileUrl = `https://www.xmytravel.com/experts/${slug}`;
  const imageAlt = `${profileData.fullName}'s profile image`;
  const twitterHandle = `@${profileData.username || slug}`;

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={profileUrl} />
      <meta property="og:type" content="profile" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@XmyTravel" />
      <meta name="twitter:creator" content={twitterHandle} />
    </>
  );
}
