
// // // "use client";

// // // import { useState, useEffect } from "react";
// // // import { getFirestore, collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
// // // import { app } from "@/lib/firebase";
// // // import PhoneInput from "react-phone-input-2";
// // // import "react-phone-input-2/lib/style.css";
// // // import { useRouter } from "next/navigation";
// // // import Image from "next/image";
// // // import { FaSearch } from "react-icons/fa";
// // // import Link from "next/link";

// // // const db = getFirestore(app);

// // // export default function Home() {
// // //   const [formData, setFormData] = useState({
// // //     name: "",
// // //     email: "",
// // //     phone: "",
// // //     searchQuery: "",
// // //     purpose: "",
// // //   });
// // //   const [loading, setLoading] = useState(false);
// // //   const [showSuccess, setShowSuccess] = useState(false);
// // //   const [showModal, setShowModal] = useState(false);
// // //   const [hasSubmitted, setHasSubmitted] = useState(false);
// // //   const router = useRouter();

// // //   // Load saved form data from localStorage on component mount
// // //   useEffect(() => {
// // //     const savedData = localStorage.getItem("userFormData");
// // //     if (savedData) {
// // //         console.log(savedData)
// // //       const parsedData = JSON.parse(savedData);
// // //       setFormData((prev) => ({
// // //         ...prev,
// // //         name: parsedData.name || "",
// // //         email: parsedData.email || "",
// // //         phone: parsedData.phone || "",
// // //         purpose: parsedData.purpose || "",
// // //         message:parsedData.searchQuery || "",
// // //       }));
// // //       setHasSubmitted(true);
// // //     }
// // //   }, []);

// // //   const handleChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setFormData((prev) => ({ ...prev, [name]: value }));
// // //   };

// // //   const extractKeywords = (text) => {
// // //     if (!text) return [];
// // //     const stopWords = [
// // //       "the", "is", "in", "and", "or", "but", "a", "an", "for", "with", "to",
// // //       "at", "by", "from", "on", "of", "need", "help", "i", "you", "we",
// // //     ];
// // //     const words = text.toLowerCase().match(/\b\w+\b/g) || [];
// // //     return [...new Set(words)].filter(word => word.length > 2 && !stopWords.includes(word));
// // //   };

// // //   const handleAskExpert = async () => {
// // //     if (!formData.searchQuery) {
// // //       alert("Please enter a search query.");
// // //       return;
// // //     }

// // //     if (hasSubmitted) {
// // //       // If user has previously submitted, skip modal and proceed directly
// // //       await handleSearchRedirect();
// // //     } else {
// // //       // Show modal for first-time form submission
// // //       setShowModal(true);
// // //     }
// // //   };

// // //   const handleSearchRedirect = async () => {
// // //     setLoading(true);
// // //     try {
// // //       if (["General Query", "I'm a Traveller"].includes(formData.purpose) && formData.searchQuery) {
// // //         const keywords = extractKeywords(formData.searchQuery);
// // //         if (keywords.length > 0) {
// // //           const experts = await getDocs(collection(db, "Profiles"));
// // //           const filteredExperts = experts.docs
// // //             .map(doc => ({ id: doc.id, ...doc.data() }))
// // //             .filter(expert => {
// // //               const searchableFields = [
// // //                 expert.fullName || "",
// // //                 expert.title || "",
// // //                 expert.tagline || "",
// // //                 expert.about || "",
// // //                 expert.certifications || "",
// // //                 expert.companies || "",
// // //                 expert.languages || "",
// // //                 expert.location || "",
// // //                 (expert.expertise || []).join(" "),
// // //                 (expert.regions || []).join(" "),
// // //                 ...(expert.experience || []).map(
// // //                   (exp) => `${exp.company || ""} ${exp.title || ""}`
// // //                 ),
// // //               ].join(" ").toLowerCase();
// // //               return keywords.some(keyword => searchableFields.includes(keyword));
// // //             });

// // //           if (filteredExperts.length > 0) {
// // //             router.push(`/expert?keywords=${encodeURIComponent(keywords.join(","))}`);
// // //           } else {
// // //             alert("No matching experts found. Try different keywords.");
// // //           }
// // //         } else {
// // //           alert("Please provide more details in your query to find relevant experts.");
// // //         }
// // //       }
// // //     } catch (error) {
// // //       console.error("Search error:", error);
// // //       alert("Search failed. Try again.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };


// // // const handleSubmit = async (e) => {
// // //   e.preventDefault();
// // //   setLoading(true);

// // //   try {
// // //     // Save form data to Firestore with searchQuery as message
// // //     await addDoc(collection(db, "JoinQueries"), {
// // //       name: formData.name,
// // //       email: formData.email,
// // //       phone: formData.phone,
// // //       purpose: formData.purpose,
// // //       message: formData.searchQuery, // Use searchQuery as message
// // //       timestamp: Timestamp.now(),
// // //     });

// // //     // Send form data to API with searchQuery as message
// // //     await fetch("/api/send-expert-form", {
// // //       method: "POST",
// // //       headers: {
// // //         "Content-Type": "application/json",
// // //       },
// // //       body: JSON.stringify({
// // //         name: formData.name,
// // //         email: formData.email,
// // //         phone: formData.phone,
// // //         purpose: formData.purpose,
// // //         message: formData.searchQuery, // Use searchQuery as message
// // //       }),
// // //     });

// // //     // Save form data to localStorage with searchQuery as message
// // //     localStorage.setItem("userFormData", JSON.stringify({
// // //       name: formData.name,
// // //       email: formData.email,
// // //       phone: formData.phone,
// // //       purpose: formData.purpose,
// // //       message: formData.searchQuery, // Use searchQuery as message
// // //     }));

// // //     setHasSubmitted(true);
// // //     setShowSuccess(true);
// // //     setShowModal(false);

// // //     // Handle navigation for General Query and I'm a Traveller
// // //     await handleSearchRedirect();

// // //     // Reset only searchQuery, keep other fields
// // //     setFormData((prev) => ({
// // //       ...prev,
// // //       searchQuery: "",
// // //     }));
// // //   } catch (error) {
// // //     console.error("Submission error:", error);
// // //     alert("Submission failed. Try again.");
// // //   } finally {
// // //     setLoading(false);
// // //     setTimeout(() => setShowSuccess(false), 3000);
// // //   }
// // // };
// // //   return (
// // //     <div className="min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift">
// // //       <style jsx global>{`
// // //         :root {
// // //           --primary: #36013f;
// // //           --secondary: #f4d35e;
// // //         }
// // //         @keyframes gradientShift {
// // //           0% { background-position: 0% 50%; }
// // //           50% { background-position: 100% 50%; }
// // //           100% { background-position: 0% 50%; }
// // //         }
// // //         .animate-gradientShift {
// // //           background-size: 400% 400%;
// // //           animation: gradientShift 15s ease infinite;
// // //         }
// // //         .animate-fadeIn {
// // //           animation: fadeIn 1s ease-in-out;
// // //         }
// // //         @keyframes fadeIn {
// // //           from { opacity: 0; transform: translateY(20px); }
// // //           to { opacity: 1; transform: translateY(0); }
// // //         }
// // //       `}</style>

// // //       {/* Header */}
// // //       <header className="w-full px-6 py-4 flex justify-between items-center text-sm z-10">
// // //         <div className="flex gap-6">
// // //           <a href="#" className="hover:underline">About</a>
// // //           <a href="#" className="hover:underline">Features</a>
// // //         </div>
// // //         <div className="flex gap-6">
// // //           <a href="#" className="hover:underline">Become an Expert</a>
// // //           <a href="#" className="hover:underline">Contact</a>
// // //         </div>
// // //       </header>

// // //       {/* Hero Section */}
// // //       <main className="flex-grow flex items-center justify-center relative px-4">
// // //         <div className=" bg-opacity-80  rounded-3xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fadeIn">
// // //           <Image
// // //             src="https://www.xmytravel.com/logolttx.svg"
// // //             alt="XmyTravel Logo"
// // //             width={192}
// // //             height={48}
// // //             className="w-36 md:w-48 drop-shadow-lg brightness-110"
// // //           />
// // //           <h1 className="text-2xl md:text-3xl font-semibold text-center ">
// // //             Planning travel? Ask your question here.
// // //           </h1>
// // //           <div className="w-full relative">
// // //             <input
// // //               name="searchQuery"
// // //               type="text"
// // //               placeholder=" Ask any travel-related query: destination advice, planning tips, costs, visas or more. A verified expert will guide you."
// // //               value={formData.searchQuery}
// // //               onChange={handleChange}
// // //               className="w-full pl-12 pr-5 py-3 rounded-full bg-transparent bg-opacity-30 border  border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
// // //             />
// // //             <FaSearch className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70" />
// // //           </div>
// // //           <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
// // //             <button
// // //               onClick={handleAskExpert}
// // //               disabled={loading}
// // //               className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition ${
// // //                 loading ? "opacity-50 cursor-not-allowed" : ""
// // //               }`}
// // //             >
// // //               Ask Expert
// // //             </button>
           
         
          
// // //               <Link href='/complete-profile'      className="bg-white text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition flex items-center justify-center">
// // //               Join as Expert
// // //               </Link>
            
// // //           </div>
// // //         </div>
// // //       </main>

// // //       {/* Modal */}
// // //       {showModal && (
// // //         <div className="fixed inset-0 flex items-center justify-center bg-[#36013F] bg-opacity-50 z-50">
// // //           <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
// // //             <h3 className="text-lg font-semibold text-[#36013F] mb-4">Ask an Expert</h3>
// // //             <form onSubmit={handleSubmit} className="space-y-4">
// // //               <input
// // //                 name="name"
// // //                 type="text"
// // //                 required
// // //                 placeholder="Full Name"
// // //                 value={formData.name}
// // //                 onChange={handleChange}
// // //                 className="w-full px-4 py-3 rounded-xl border bg-white text-[#36013F]"
// // //               />
// // //               <PhoneInput
// // //                 country={"in"}
// // //                 value={formData.phone}
// // //                 onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
// // //                 placeholder="Enter phone number"
// // //                 inputProps={{
// // //                   id: "phone",
// // //                   className: "w-full p-3 border px-12 border-gray-300 rounded-xl bg-white text-[#36013F]",
// // //                   required: true,
// // //                   autoFocus: false,
// // //                 }}
// // //               />
// // //               <input
// // //                 name="email"
// // //                 type="email"
// // //                 required
// // //                 placeholder="Email Address"
// // //                 value={formData.email}
// // //                 onChange={handleChange}
// // //                 className="w-full px-4 py-3 rounded-xl border bg-white text-[#36013F]"
// // //               />
// // //               <select
// // //                 name="purpose"
// // //                 required
// // //                 value={formData.purpose}
// // //                 onChange={handleChange}
// // //                 className="w-full px-4 py-3 rounded-xl border bg-white text-[#36013F]"
// // //               >
// // //                 <option value="" disabled>What best describes your intent?</option>
                
// // //                 <option value="I'm a Traveller">I'm a Traveller</option>
// // //                 <option value="General Query">General Query</option>
// // //               </select>
// // //               <div className="flex justify-end gap-4">
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => setShowModal(false)}
// // //                   className="px-6 py-2 bg-gray-300 text-[#36013F] rounded-full hover:bg-gray-400 transition"
// // //                 >
// // //                   Cancel
// // //                 </button>
// // //                 <button
// // //                   type="submit"
// // //                   disabled={loading}
// // //                   className={`px-6 py-2 rounded-full font-medium transition ${
// // //                     loading
// // //                       ? "bg-gray-400 text-white cursor-not-allowed"
// // //                       : "bg-[#36013F] text-white hover:bg-[#4e1a60]"
// // //                   }`}
// // //                 >
// // //                   {loading ? "Submitting..." : "Submit"}
// // //                 </button>
// // //               </div>
// // //             </form>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Success Message */}
// // //       {showSuccess && (
// // //         <div className="fixed inset-0 flex items-center justify-center bg-[#36013F] bg-opacity-30 z-50">
// // //           <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-lg">
// // //             <h3 className="text-lg font-semibold text-green-700 mb-2">Success!</h3>
// // //             <p className="text-gray-700">Your form has been submitted.</p>
// // //             <button
// // //               className="mt-4 px-6 py-2 bg-[#36013F] text-white rounded-full hover:bg-[#4e1a60] transition"
// // //               onClick={() => setShowSuccess(false)}
// // //             >
// // //               Close
// // //             </button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Footer */}
// // //       <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
// // //         <div className="flex flex-wrap justify-center items-center gap-3">
// // //           <p>Info@xmytravel.com</p>
// // //           <span>|</span>
// // //           <a href="#" className="hover:underline">Privacy Policy</a>
// // //           <span>|</span>
// // //           <p>© 2025 XmyTravel.com</p>
// // //         </div>
// // //       </footer>
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useState, useEffect } from "react";
// // import { getFirestore, collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
// // import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// // import { app } from "@/lib/firebase";
// // import PhoneInput from "react-phone-input-2";
// // import "react-phone-input-2/lib/style.css";
// // import { useRouter } from "next/navigation";
// // import Image from "next/image";
// // import { FaSearch } from "react-icons/fa";
// // import Link from "next/link";
// // import { ToastContainer, toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // const db = getFirestore(app);
// // const auth = getAuth(app);
// // const provider = new GoogleAuthProvider();

// // export default function Home() {
// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     phone: "",
// //     searchQuery: "",
// //     purpose: "",
// //   });
// //   const [loading, setLoading] = useState(false);
// //   const [showSuccess, setShowSuccess] = useState(false);
// //   const [showModal, setShowModal] = useState(false);
// //   const [hasSubmitted, setHasSubmitted] = useState(false);
// //   const [user, setUser] = useState(null);
// //   const router = useRouter();

// //   // Load user data from localStorage or Firebase Auth
// //   useEffect(() => {
// //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// //       console.log("Home: Auth state changed:", currentUser); // Debug
// //       if (currentUser) {
// //         setUser(currentUser);
// //         setFormData((prev) => ({
// //           ...prev,
// //           name: currentUser.displayName || "",
// //           email: currentUser.email || "",
// //           phone: currentUser.phoneNumber || "",
// //         }));
// //         setHasSubmitted(true);
// //       } else {
// //         const savedData = localStorage.getItem("userFormData");
// //         if (savedData) {
// //           const parsedData = JSON.parse(savedData);
// //           console.log("Home: Loaded from localStorage:", parsedData); // Debug
// //           setFormData((prev) => ({
// //             ...prev,
// //             name: parsedData.name || "",
// //             email: parsedData.email || "",
// //             phone: parsedData.phone || "",
// //             purpose: parsedData.purpose || "",
// //             searchQuery: "", // Do not persist searchQuery
// //           }));
// //           setHasSubmitted(true);
// //         }
// //       }
// //     });
// //     return () => unsubscribe();
// //   }, []);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const handleGoogleSignIn = async () => {
// //     try {
// //       const result = await signInWithPopup(auth, provider);
// //       const user = result.user;
// //       console.log("Home: Google Sign-In success:", user); // Debug
// //       setUser(user);
// //       setFormData((prev) => ({
// //         ...prev,
// //         name: user.displayName || "",
// //         email: user.email || "",
// //         phone: user.phoneNumber || "",
// //       }));
// //       setHasSubmitted(true);
// //       localStorage.setItem(
// //         "userFormData",
// //         JSON.stringify({
// //           name: user.displayName || "",
// //           email: user.email || "",
// //           phone: user.phoneNumber || "",
// //           purpose: formData.purpose || "General Query",
// //         })
// //       );
// //       if (formData.searchQuery.trim()) {
// //         await handleSearchRedirect();
// //       } else {
// //         toast.error("Please enter a search query.");
// //       }
// //     } catch (error) {
// //       console.error("Home: Google Sign-In error:", error);
// //       toast.error("Google Sign-In failed. Please try again.");
// //     }
// //   };

// //   const extractKeywords = (text) => {
// //     if (!text) return [];
// //     const stopWords = [
// //       "the", "is", "in", "and", "or", "but", "a", "an", "for", "with", "to",
// //       "at", "by", "from", "on", "of", "need", "help", "i", "you", "we",
// //     ];
// //     const words = text.toLowerCase().match(/\b\w+\b/g) || [];
// //     return [...new Set(words)].filter(word => word.length > 2 && !stopWords.includes(word));
// //   };

// //   const handleAskExpert = async () => {
// //     console.log("Home: handleAskExpert called:", { searchQuery: formData.searchQuery, hasSubmitted, user }); // Debug
// //     if (!formData.searchQuery.trim()) {
// //       toast.error("Please enter a search query.");
// //       return;
// //     }

// //     try {
// //       if (hasSubmitted || user) {
// //         await handleSearchRedirect();
// //       } else {
// //         setShowModal(true);
// //       }
// //     } catch (error) {
// //       console.error("Home: Error in handleAskExpert:", error);
// //       toast.error("An error occurred. Please try again.");
// //     }
// //   };

// //   const handleSearchRedirect = async () => {
// //     console.log("Home: handleSearchRedirect called:", formData.searchQuery); // Debug
// //     setLoading(true);
// //     try {
// //       const keywords = extractKeywords(formData.searchQuery);
// //       if (keywords.length === 0) {
// //         toast.error("Please provide more specific keywords in your query.");
// //         setLoading(false);
// //         return;
// //       }

// //       const expertsSnapshot = await getDocs(collection(db, "Profiles"));
// //       const filteredExperts = expertsSnapshot.docs
// //         .map(doc => ({ id: doc.id, ...doc.data() }))
// //         .filter(expert => {
// //           const searchableFields = [
// //             expert.fullName || "",
// //             expert.title || "",
// //             expert.tagline || "",
// //             expert.about || "",
// //             expert.certifications || "",
// //             expert.companies || "",
// //             expert.languages || "",
// //             expert.location || "",
// //             (expert.expertise || []).join(" "),
// //             (expert.regions || []).join(" "),
// //             ...(expert.experience || []).map(
// //               (exp) => `${exp.company || ""} ${exp.title || ""}`
// //             ),
// //           ].join(" ").toLowerCase();
// //           return keywords.some(keyword => searchableFields.includes(keyword));
// //         });

// //       if (filteredExperts.length > 0) {
// //         router.push(`/ask-an-expert?keywords=${encodeURIComponent(keywords.join(","))}&question=${encodeURIComponent(formData.searchQuery)}`);
// //       } else {
// //         toast.warn("No matching experts found. Try different keywords.");
// //       }
// //     } catch (error) {
// //       console.error("Home: Search error:", error);
// //       toast.error("Search failed. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     console.log("Home: handleSubmit called:", formData); // Debug
// //     if (!formData.name || !formData.email || !formData.phone || !formData.purpose) {
// //       toast.error("Please fill out all required fields.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       await addDoc(collection(db, "JoinQueries"), {
// //         name: formData.name,
// //         email: formData.email,
// //         phone: formData.phone,
// //         purpose: formData.purpose,
// //         message: formData.searchQuery,
// //         timestamp: Timestamp.now(),
// //       });

// //       await fetch("/api/send-expert-form", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           name: formData.name,
// //           email: formData.email,
// //           phone: formData.phone,
// //           purpose: formData.purpose,
// //           message: formData.searchQuery,
// //         }),
// //       });

// //       localStorage.setItem(
// //         "userFormData",
// //         JSON.stringify({
// //           name: formData.name,
// //           email: formData.email,
// //           phone: formData.phone,
// //           purpose: formData.purpose,
// //         })
// //       );

// //       setHasSubmitted(true);
// //       setShowSuccess(true);
// //       setShowModal(false);

// //       await handleSearchRedirect();

// //       setFormData((prev) => ({
// //         ...prev,
// //         searchQuery: "",
// //       }));
// //     } catch (error) {
// //       console.error("Home: Submission error:", error);
// //       toast.error("Submission failed. Please try again.");
// //     } finally {
// //       setLoading(false);
// //       setTimeout(() => setShowSuccess(false), 3000);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift">
// //       <style jsx global>{`
// //         :root {
// //           --primary: #36013f;
// //           --secondary: #f4d35e;
// //         }
// //         @keyframes gradientShift {
// //           0% { background-position: 0% 50%; }
// //           50% { background-position: 100% 50%; }
// //           100% { background-position: 0% 50%; }
// //         }
// //         .animate-gradientShift {
// //           background-size: 400% 400%;
// //           animation: gradientShift 15s ease infinite;
// //         }
// //         .animate-fadeIn {
// //           animation: fadeIn 1s ease-in-out;
// //         }
// //         @keyframes fadeIn {
// //           from { opacity: 0; transform: translateY(20px); }
// //           to { opacity: 1; transform: translateY(0); }
// //         }
// //       `}</style>

// //       <header className="w-full px-6 py-4 flex justify-between items-center text-sm z-10">
// //         <div className="flex gap-6">
// //           <a href="#" className="hover:underline">About</a>
// //           <a href="#" className="hover:underline">Features</a>
// //         </div>
// //         <div className="flex gap-6">
// //           {user && (
// //             <button
// //               onClick={() => {
// //                 auth.signOut();
// //                 localStorage.removeItem("userFormData");
// //                 setUser(null);
// //                 setHasSubmitted(false);
// //                 setFormData({
// //                   name: "",
// //                   email: "",
// //                   phone: "",
// //                   searchQuery: "",
// //                   purpose: "",
// //                 });
// //               }}
// //               className="hover:underline"
// //             >
// //               Logout
// //             </button>
// //           )}
// //           <a href="#" className="hover:underline">Become an Expert</a>
// //           <a href="#" className="hover:underline">Contact</a>
// //         </div>
// //       </header>

// //       <main className="flex-grow flex items-center justify-center relative px-4">
// //         <div className="bg-opacity-80 rounded-3xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fadeIn">
// //           <Image
// //             src="https://www.xmytravel.com/logolttx.svg"
// //             alt="XmyTravel Logo"
// //             width={192}
// //             height={48}
// //             className="w-36 md:w-48 drop-shadow-lg brightness-110"
// //           />
// //           <h1 className="text-2xl md:text-3xl font-semibold text-center">
// //             Planning travel? Ask your question here.
// //           </h1>
// //           <div className="w-full relative">
// //             <input
// //               name="searchQuery"
// //               type="text"
// //               placeholder="Ask any travel-related query: destination advice, planning tips, costs, visas or more. A verified expert will guide you."
// //               value={formData.searchQuery}
// //               onChange={handleChange}
// //               className="w-full pl-12 pr-5 py-3 rounded-full bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
// //             />
// //             <FaSearch className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70" />
// //           </div>
// //           <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
// //             <button
// //               onClick={handleAskExpert}
// //               disabled={loading}
// //               className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition ${
// //                 loading ? "opacity-50 cursor-not-allowed" : ""
// //               }`}
// //             >
// //               Ask Expert
// //             </button>
// //             {/* {!user && (
// //               <button
// //                 onClick={handleGoogleSignIn}
// //                 className="bg-white text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition"
// //               >
// //                 Sign in with Google
// //               </button>
// //             )} */}
// //             <Link
// //               href="/complete-profile"
// //               className="bg-white text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition flex items-center justify-center"
// //             >
// //               Join as Expert
// //             </Link>
// //           </div>
// //         </div>
// //       </main>

// //       {showModal && (
// //         <div className="fixed inset-0 flex items-center justify-center bg-[#36013F] bg-opacity-50 z-50">
// //           <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
// //             <h3 className="text-lg font-semibold text-[#36013F] mb-4">Ask an Expert</h3>
// //             <form onSubmit={handleSubmit} className="space-y-4">
// //               <input
// //                 name="name"
// //                 type="text"
// //                 required
// //                 placeholder="Full Name"
// //                 value={formData.name}
// //                 onChange={handleChange}
// //                 className="w-full px-4 py-3 rounded-xl border bg-white text-[#36013F]"
// //               />
// //               <PhoneInput
// //                 country={"in"}
// //                 value={formData.phone}
// //                 onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
// //                 placeholder="Enter phone number"
// //                 inputProps={{
// //                   id: "phone",
// //                   className: "w-full p-3 border px-12 border-gray-300 rounded-xl bg-white text-[#36013F]",
// //                   required: true,
// //                   autoFocus: false,
// //                 }}
// //               />
// //               <input
// //                 name="email"
// //                 type="email"
// //                 required
// //                 placeholder="Email Address"
// //                 value={formData.email}
// //                 onChange={handleChange}
// //                 className="w-full px-4 py-3 rounded-xl border bg-white text-[#36013F]"
// //               />
// //               <select
// //                 name="purpose"
// //                 required
// //                 value={formData.purpose}
// //                 onChange={handleChange}
// //                 className="w-full px-4 py-3 rounded-xl border bg-white text-[#36013F]"
// //               >
// //                 <option value="" disabled>What best describes your intent?</option>
// //                 <option value="I'm a Traveller">I'm a Traveller</option>
// //                 <option value="General Query">General Query</option>
// //               </select>
// //               <div className="flex justify-end gap-4">
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowModal(false)}
// //                   className="px-6 py-2 bg-gray-300 text-[#36013F] rounded-full hover:bg-gray-400 transition"
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   type="submit"
// //                   disabled={loading}
// //                   className={`px-6 py-2 rounded-full font-medium transition ${
// //                     loading
// //                       ? "bg-gray-400 text-white cursor-not-allowed"
// //                       : "bg-[#36013F] text-white hover:bg-[#4e1a60]"
// //                   }`}
// //                 >
// //                   {loading ? "Submitting..." : "Submit"}
// //                 </button>
// //               </div>
// //             </form>
// //           </div>
// //         </div>
// //       )}

// //       {showSuccess && (
// //         <div className="fixed inset-0 flex items-center justify-center bg-[#36013F] bg-opacity-30 z-50">
// //           <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-lg">
// //             <h3 className="text-lg font-semibold text-green-700 mb-2">Success!</h3>
// //             <p className="text-gray-700">Your form has been submitted.</p>
// //             <button
// //               className="mt-4 px-6 py-2 bg-[#36013F] text-white rounded-full hover:bg-[#4e1a60] transition"
// //               onClick={() => setShowSuccess(false)}
// //             >
// //               Close
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
// //         <div className="flex flex-wrap justify-center items-center gap-3">
// //           <p>Info@xmytravel.com</p>
// //           <span>|</span>
// //           <a href="#" className="hover:underline">Privacy Policy</a>
// //           <span>|</span>
// //           <p>© 2025 XmyTravel.com</p>
// //         </div>
// //       </footer>
// //       <ToastContainer position="top-right" autoClose={3000} />
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import { getFirestore, collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
// import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// import { app } from "@/lib/firebase";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { FaSearch } from "react-icons/fa";
// import Link from "next/link";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const db = getFirestore(app);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();

// export default function Home() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     searchQuery: "",
//     purpose: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [hasSubmitted, setHasSubmitted] = useState(false); // Fixed typo: UsetHasSubmitted -> setHasSubmitted
//   const [user, setUser] = useState(null);
//   const router = useRouter();

//   // Load user data from localStorage or Firebase Auth
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       console.log("Home: Auth state changed:", currentUser); // Debug
//       if (currentUser) {
//         setUser(currentUser);
//         setFormData((prev) => ({
//           ...prev,
//           name: currentUser.displayName || "",
//           email: currentUser.email || "",
//           phone: currentUser.phoneNumber || "",
//         }));
//         setHasSubmitted(true);
//       } else {
//         const savedData = localStorage.getItem("userFormData");
//         if (savedData) {
//           const parsedData = JSON.parse(savedData);
//           console.log("Home: Loaded from localStorage:", parsedData); // Debug
//           setFormData((prev) => ({
//             ...prev,
//             name: parsedData.name || "",
//             email: parsedData.email || "",
//             phone: parsedData.phone || "",
//             purpose: parsedData.purpose || "",
//             searchQuery: "", // Do not persist searchQuery
//           }));
//           setHasSubmitted(true);
//         }
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;
//       console.log("Home: Google Sign-In success:", user); // Debug
//       setUser(user);
//       setFormData((prev) => ({
//         ...prev,
//         name: user.displayName || "",
//         email: user.email || "",
//         phone: user.phoneNumber || "",
//       }));
//       setHasSubmitted(true);
//       localStorage.setItem(
//         "userFormData",
//         JSON.stringify({
//           name: user.displayName || "",
//           email: user.email || "",
//           phone: user.phoneNumber || "",
//           purpose: formData.purpose || "General Query",
//         })
//       );
//       if (formData.searchQuery.trim()) {
//         await handleSearchRedirect();
//       } else {
//         toast.error("Please enter a search query.");
//       }
//     } catch (error) {
//       console.error("Home: Google Sign-In error:", error);
//       toast.error("Google Sign-In failed. Please try again.");
//     }
//   };

//   const extractKeywords = (text) => {
//     if (!text) return [];
//     const stopWords = [
//       "the", "is", "in", "and", "or", "but", "a", "an", "for", "with", "to",
//       "at", "by", "from", "on", "of", "need", "help", "i", "you", "we",
//     ];
//     const words = text.toLowerCase().match(/\b\w+\b/g) || [];
//     return [...new Set(words)].filter(word => word.length > 2 && !stopWords.includes(word));
//   };

//   const handleAskExpert = async () => {
//     console.log("Home: handleAskExpert called:", { searchQuery: formData.searchQuery, hasSubmitted, user }); // Debug
//     if (!formData.searchQuery.trim()) {
//       toast.error("Please enter a search query.");
//       return;
//     }

//     try {
//       if (hasSubmitted || user) {
//         await handleSearchRedirect();
//       } else {
//         setShowModal(true);
//       }
//     } catch (error) {
//       console.error("Home: Error in handleAskExpert:", error);
//       toast.error("An error occurred. Please try again.");
//     }
//   };

//   const handleSearchRedirect = async () => {
//     console.log("Home: handleSearchRedirect called:", formData.searchQuery); // Debug
//     setLoading(true);
//     try {
//       const keywords = extractKeywords(formData.searchQuery);
//       if (keywords.length === 0) {
//         toast.error("Please provide more specific keywords in your query.");
//         setLoading(false);
//         return;
//       }

//       const expertsSnapshot = await getDocs(collection(db, "Profiles"));
//       const filteredExperts = expertsSnapshot.docs
//         .map(doc => ({ id: doc.id, ...doc.data() }))
//         .filter(expert => {
//           const searchableFields = [
//             expert.fullName || "",
//             expert.title || "",
//             expert.tagline || "",
//             expert.about || "",
//             expert.certifications || "",
//             expert.companies || "",
//             expert.languages || "",
//             expert.location || "",
//             (expert.expertise || []).join(" "),
//             (expert.regions || []).join(" "),
//             ...(expert.experience || []).map(
//               (exp) => `${exp.company || ""} ${exp.title || ""}`
//             ),
//           ].join(" ").toLowerCase();
//           return keywords.some(keyword => searchableFields.includes(keyword));
//         });

//       if (filteredExperts.length > 0) {
//         router.push(`/ask-an-expert?keywords=${encodeURIComponent(keywords.join(","))}&question=${encodeURIComponent(formData.searchQuery)}`);
//       } else {
//         toast.warn("No matching experts found. Try different keywords.");
//       }
//     } catch (error) {
//       console.error("Home: Search error:", error);
//       toast.error("Search failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Home: handleSubmit called:", formData); // Debug
//     if (!formData.name || !formData.email || !formData.phone || !formData.purpose) {
//       toast.error("Please fill out all required fields.");
//       return;
//     }

//     setLoading(true);
//     try {
//       await addDoc(collection(db, "JoinQueries"), {
//         name: formData.name,
//         email: formData.email,
//         phone: formData.phone,
//         purpose: formData.purpose,
//         message: formData.searchQuery,
//         timestamp: Timestamp.now(),
//       });

//       await fetch("/api/send-expert-form", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           phone: formData.phone,
//           purpose: formData.purpose,
//           message: formData.searchQuery,
//         }),
//       });

//       localStorage.setItem(
//         "userFormData",
//         JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           phone: formData.phone,
//           purpose: formData.purpose,
//         })
//       );

//       setHasSubmitted(true);
//       setShowSuccess(true);
//       setShowModal(false);

//       await handleSearchRedirect();

//       setFormData((prev) => ({
//         ...prev,
//         searchQuery: "",
//       }));
//     } catch (error) {
//       console.error("Home: Submission error:", error);
//       toast.error("Submission failed. Please try again.");
//     } finally {
//       setLoading(false);
//       setTimeout(() => setShowSuccess(false), 3000);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift">
//       <style jsx global>{`
//         :root {
//           --primary: #36013f;
//           --secondary: #f4d35e;
//         }
//         @keyframes gradientShift {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
//         .animate-gradientShift {
//           background-size: 400% 400%;
//           animation: gradientShift 15s ease infinite;
//         }
//         .animate-fadeIn {
//           animation: fadeIn 1s ease-in-out;
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>

//       <header className="w-full px-6 py-4 text-sm z-10">
//         <nav className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
//           <div className="flex flex-wrap justify-center gap-4">
//             <Link href="/" className="hover:underline">Home</Link>
//             <Link href="/about" className="hover:underline">About</Link>
//             <Link href="/why-us" className="hover:underline">Why us</Link>
//           </div>
//           <div className="flex flex-wrap justify-center gap-4">
//             <Link href="/features" className="hover:underline">Features</Link>
//             <Link href="/joining-process" className="hover:underline">Joining Process</Link>
//             {user && (
//               <button
//                 onClick={() => {
//                   auth.signOut();
//                   localStorage.removeItem("userFormData");
//                   setUser(null);
//                   setHasSubmitted(false);
//                   setFormData({
//                     name: "",
//                     email: "",
//                     phone: "",
//                     searchQuery: "",
//                     purpose: "",
//                   });
//                 }}
//                 className="hover:underline"
//               >
//                 Logout
//               </button>
//             )}
//           </div>
//         </nav>
//       </header>

//       <main className="flex-grow flex items-center justify-center relative px-4">
//         <div className="bg-opacity-80 rounded-3xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fadeIn">
//           <Image
//             src="https://www.xmytravel.com/logolttx.svg"
//             alt="XmyTravel Logo"
//             width={192}
//             height={48}
//             className="w-36 md:w-48 drop-shadow-lg brightness-110"
//           />
//           <h1 className="text-2xl md:text-3xl font-semibold text-center">
//             Planning travel? Ask your question here.
//           </h1>
//           <div className="w-full relative">
//             <input
//               name="searchQuery"
//               type="text"
//               placeholder="Ask any travel-related query: destination advice, planning tips, costs, visas or more. A verified expert will guide you."
//               value={formData.searchQuery}
//               onChange={handleChange}
//               className="w-full pl-12 pr-5 py-3 rounded-full bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
//             />
//             <FaSearch className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70" />
//           </div>
//           <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
//             <button
//               onClick={handleAskExpert}
//               disabled={loading}
//               className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition ${
//                 loading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               Ask Expert
//             </button>
//             <Link
//               href="/complete-profile"
//               className="bg-white text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition flex items-center justify-center"
//             >
//               Join as Expert
//             </Link>
//           </div>
//         </div>
//       </main>

//       {showModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-[#36013F] bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
//             <h3 className="text-lg font-semibold text-[#36013F] mb-4">Ask an Expert</h3>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <input
//                 name="name"
//                 type="text"
//                 required
//                 placeholder="Full Name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 rounded-xl border bg-white text-[#36013F]"
//               />
//               <PhoneInput
//                 country={"in"}
//                 value={formData.phone}
//                 onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
//                 placeholder="Enter phone number"
//                 inputProps={{
//                   id: "phone",
//                   className: "w-full p-3 border px-12 border-gray-300 rounded-xl bg-white text-[#36013F]",
//                   required: true,
//                   autoFocus: false,
//                 }}
//               />
//               <input
//                 name="email"
//                 type="email"
//                 required
//                 placeholder="Email Address"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 rounded-xl border bg-white text-[#36013F]"
//               />
//               <select
//                 name="purpose"
//                 required
//                 value={formData.purpose}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 rounded-xl border bg-white text-[#36013F]"
//               >
//                 <option value="" disabled>What best describes your intent?</option>
//                 <option value="I'm a Traveller">I'm a Traveller</option>
//                 <option value="General Query">General Query</option>
//               </select>
//               <div className="flex justify-end gap-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="px-6 py-2 bg-gray-300 text-[#36013F] rounded-full hover:bg-gray-400 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`px-6 py-2 rounded-full font-medium transition ${
//                     loading
//                       ? "bg-gray-400 text-white cursor-not-allowed"
//                       : "bg-[#36013F] text-white hover:bg-[#4e1a60]"
//                   }`}
//                 >
//                   {loading ? "Submitting..." : "Submit"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showSuccess && (
//         <div className="fixed inset-0 flex items-center justify-center bg-[#36013F] bg-opacity-30 z-50">
//           <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-lg">
//             <h3 className="text-lg font-semibold text-green-700 mb-2">Success!</h3>
//             <p className="text-gray-700">Your form has been submitted.</p>
//             <button
//               className="mt-4 px-6 py-2 bg-[#36013F] text-white rounded-full hover:bg-[#4e1a60] transition"
//               onClick={() => setShowSuccess(false)}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
//         <div className="flex flex-wrap justify-center items-center gap-3">
//           <p>Info@xmytravel.com</p>
//           <span>|</span>
//           <a href="#" className="hover:underline">Privacy Policy</a>
//           <span>|</span>
//           <p>© 2025 XmyTravel.com</p>
//         </div>
//       </footer>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore(app);

export default function Home() {
  const [formData, setFormData] = useState({
    searchQuery: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const extractKeywords = (text) => {
    if (!text) return [];
    const stopWords = [
      "the", "is", "in", "and", "or", "but", "a", "an", "for", "with", "to",
      "at", "by", "from", "on", "of", "need", "help", "i", "you", "we",
    ];
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return [...new Set(words)].filter(word => word.length > 2 && !stopWords.includes(word));
  };

  const handleAskExpert = async () => {
    console.log("Home: handleAskExpert called:", { searchQuery: formData.searchQuery }); // Debug
    if (!formData.searchQuery.trim()) {
      toast.error("Please enter a search query.");
      return;
    }

    try {
      await handleSearchRedirect();
    } catch (error) {
      console.error("Home: Error in handleAskExpert:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleSearchRedirect = async () => {
    console.log("Home: handleSearchRedirect called:", formData.searchQuery); // Debug
    setLoading(true);
    try {
      const keywords = extractKeywords(formData.searchQuery);
      if (keywords.length === 0) {
        toast.error("Please provide more specific keywords in your query.");
        setLoading(false);
        return;
      }

      const expertsSnapshot = await getDocs(collection(db, "Profiles"));
      const filteredExperts = expertsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(expert => {
          const searchableFields = [
            expert.fullName || "",
            expert.title || "",
            expert.tagline || "",
            expert.about || "",
            expert.certifications || "",
            expert.companies || "",
            expert.languages || "",
            expert.location || "",
            (expert.expertise || []).join(" "),
            (expert.regions || []).join(" "),
            ...(expert.experience || []).map(
              (exp) => `${exp.company || ""} ${exp.title || ""}`
            ),
          ].join(" ").toLowerCase();
          return keywords.some(keyword => searchableFields.includes(keyword));
        });

      if (filteredExperts.length > 0) {
        router.push(`/ask-an-expert?keywords=${encodeURIComponent(keywords.join(","))}&question=${encodeURIComponent(formData.searchQuery)}`);
      } else {
        toast.warn("No matching experts found. Try different keywords.");
      }
    } catch (error) {
      console.error("Home: Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift">
      <style jsx global>{`
        :root {
          --primary: #36013f;
          --secondary: #f4d35e;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradientShift {
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className="w-full px-6 py-4 text-sm z-10">
        <nav className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/why-us" className="hover:underline">Why us</Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/features" className="hover:underline">Features</Link>
            <Link href="/joining-process" className="hover:underline">Joining Process</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center relative px-4">
        <div className="bg-opacity-80 rounded-3xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fadeIn">
          <Image
            src="https://www.xmytravel.com/logolttx.svg"
            alt="XmyTravel Logo"
            width={192}
            height={48}
            className="w-36 md:w-48 drop-shadow-lg brightness-110"
          />
          <h1 className="text-2xl md:text-3xl font-semibold text-center">
            Planning travel? Ask your question here.
          </h1>
          <div className="w-full relative">
            <input
              name="searchQuery"
              type="text"
              placeholder="Ask any travel-related query: destination advice, planning tips, costs, visas or more. A verified expert will guide you."
              value={formData.searchQuery}
              onChange={handleChange}
              className="w-full pl-12 pr-5 py-3 rounded-full bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
            />
            <FaSearch className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
            <button
              onClick={handleAskExpert}
              disabled={loading}
              className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Ask Expert
            </button>
            <Link
              href="/complete-profile"
              className="bg-white text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition flex items-center justify-center"
            >
              Join as Expert
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
        <div className="flex flex-wrap justify-center items-center gap-3">
          <p>Info@xmytravel.com</p>
          <span>|</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <p>© 2025 XmyTravel.com</p>
        </div>
      </footer>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}