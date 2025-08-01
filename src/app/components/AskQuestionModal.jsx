
// // // // // // // "use client";

// // // // // // // import { useState } from "react";
// // // // // // // import { collection, addDoc, getFirestore } from "firebase/firestore";
// // // // // // // import { app } from "@/lib/firebase";

// // // // // // // const db = getFirestore(app);

// // // // // // // export default function AskQuestionModal({ expert, onClose }) {
// // // // // // //   const [step, setStep] = useState(1);
// // // // // // //   const [question, setQuestion] = useState("");
// // // // // // //   const [name, setName] = useState("");
// // // // // // //   const [email, setEmail] = useState("");
// // // // // // //   const [phone, setPhone] = useState("");
// // // // // // //   const [errors, setErrors] = useState({});
// // // // // // //   const [loading, setLoading] = useState(false);
// // // // // // //   const [success, setSuccess] = useState(false);

// // // // // // //   const validateStep1 = () => {
// // // // // // //     if (!question.trim()) {
// // // // // // //       setErrors({ question: "Question is required." });
// // // // // // //       return false;
// // // // // // //     }
// // // // // // //     return true;
// // // // // // //   };

// // // // // // //   const validateStep2 = () => {
// // // // // // //     const newErrors = {};
// // // // // // //     if (!name.trim()) newErrors.name = "Name is required.";
// // // // // // //     if (!email.trim()) newErrors.email = "Email is required.";
// // // // // // //     else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid.";
// // // // // // //     if (!phone.trim()) newErrors.phone = "Phone number is required.";
// // // // // // //     else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Phone number is invalid.";
// // // // // // //     if (!expert.id) newErrors.form = "Expert profile ID is missing. Please try again later.";
// // // // // // //     setErrors(newErrors);
// // // // // // //     return Object.keys(newErrors).length === 0;
// // // // // // //   };

// // // // // // //   const handleNext = () => {
// // // // // // //     if (validateStep1()) {
// // // // // // //       setErrors({});
// // // // // // //       setStep(2);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleSubmit = async (e) => {
// // // // // // //     e.preventDefault();
// // // // // // //     if (!validateStep2()) return;

// // // // // // //     setLoading(true);
// // // // // // //     try {
// // // // // // //       // Save to Firestore
// // // // // // //       const docRef = await addDoc(collection(db, "Questions"), {
// // // // // // //         expertId: expert.id, // This should now be defined
// // // // // // //         expertName: expert.fullName,
// // // // // // //         expertEmail: expert.email,
// // // // // // //         question,
// // // // // // //         userName: name,
// // // // // // //         userEmail: email,
// // // // // // //         userPhone: phone,
// // // // // // //         status: "pending",
// // // // // // //         createdAt: new Date().toISOString(),
// // // // // // //         reply: null,
// // // // // // //       });

// // // // // // //       // Send emails via API route
// // // // // // //       const response = await fetch("/api/send-question-emails", {
// // // // // // //         method: "POST",
// // // // // // //         headers: {
// // // // // // //           "Content-Type": "application/json",
// // // // // // //         },
// // // // // // //         body: JSON.stringify({
// // // // // // //           userEmail: email,
// // // // // // //           userName: name,
// // // // // // //           expertEmail: expert.email,
// // // // // // //           expertName: expert.fullName,
// // // // // // //           question,
// // // // // // //           userPhone: phone,
// // // // // // //         }),
// // // // // // //       });

// // // // // // //       if (!response.ok) {
// // // // // // //         throw new Error("Failed to send emails");
// // // // // // //       }

// // // // // // //       setSuccess(true);
// // // // // // //       setTimeout(() => {
// // // // // // //         onClose();
// // // // // // //       }, 2000);
// // // // // // //     } catch (error) {
// // // // // // //       console.error("Error submitting question:", error.message);
// // // // // // //       setErrors({ form: "Failed to submit question. Please try again." });
// // // // // // //       setLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <div
// // // // // // //       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
// // // // // // //       style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
// // // // // // //     >
// // // // // // //       <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative">
// // // // // // //         <button
// // // // // // //           onClick={onClose}
// // // // // // //           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
// // // // // // //         >
// // // // // // //           ✕
// // // // // // //         </button>
// // // // // // //         <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
// // // // // // //           {step === 1 ? `Ask a Question to ${expert.fullName}` : "Step 2: Enter Contact Info"}
// // // // // // //         </h2>
// // // // // // //         {success ? (
// // // // // // //           <p className="text-green-500">Question submitted successfully! Closing...</p>
// // // // // // //         ) : (
// // // // // // //           <form onSubmit={step === 1 ? (e) => e.preventDefault() : handleSubmit} className="space-y-4">
// // // // // // //             {step === 1 ? (
// // // // // // //               <>
// // // // // // //                 <div>
// // // // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// // // // // // //                     Write your question here
// // // // // // //                   </label>
// // // // // // //                   <textarea
// // // // // // //                     value={question}
// // // // // // //                     onChange={(e) => setQuestion(e.target.value)}
// // // // // // //                     className={`mt-1 p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.question ? "border-red-500" : ""}`}
// // // // // // //                     rows="4"
// // // // // // //                     placeholder="Enter your question"
// // // // // // //                     required
// // // // // // //                   />
// // // // // // //                   {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
// // // // // // //                 </div>
// // // // // // //                 <button
// // // // // // //                   type="button"
// // // // // // //                   onClick={handleNext}
// // // // // // //                   className="w-full bg-[var(--primary)] text-white p-3 rounded-xl hover:bg-[#4a0150] transition font-semibold"
// // // // // // //                 >
// // // // // // //                   Next
// // // // // // //                 </button>
// // // // // // //               </>
// // // // // // //             ) : (
// // // // // // //               <>
// // // // // // //                 <div>
// // // // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
// // // // // // //                   <input
// // // // // // //                     type="text"
// // // // // // //                     value={name}
// // // // // // //                     onChange={(e) => setName(e.target.value)}
// // // // // // //                     className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.name ? "border-red-500" : ""}`}
// // // // // // //                     placeholder="Enter your name"
// // // // // // //                     required
// // // // // // //                   />
// // // // // // //                   {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
// // // // // // //                 </div>
// // // // // // //                 <div>
// // // // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
// // // // // // //                   <input
// // // // // // //                     type="email"
// // // // // // //                     value={email}
// // // // // // //                     onChange={(e) => setEmail(e.target.value)}
// // // // // // //                     className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.email ? "border-red-500" : ""}`}
// // // // // // //                     placeholder="Enter your email"
// // // // // // //                     required
// // // // // // //                   />
// // // // // // //                   {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
// // // // // // //                 </div>
// // // // // // //                 <div>
// // // // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
// // // // // // //                   <input
// // // // // // //                     type="tel"
// // // // // // //                     value={phone}
// // // // // // //                     onChange={(e) => setPhone(e.target.value)}
// // // // // // //                     className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.phone ? "border-red-500" : ""}`}
// // // // // // //                     placeholder="Enter your phone number"
// // // // // // //                     required
// // // // // // //                   />
// // // // // // //                   {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
// // // // // // //                 </div>
// // // // // // //                 {errors.form && <p className="text-red-500 text-sm mt-1">{errors.form}</p>}
// // // // // // //                 <button
// // // // // // //                   type="submit"
// // // // // // //                   disabled={loading}
// // // // // // //                   className={`w-full bg-[var(--primary)] text-white p-3 rounded-xl hover:bg-[#4a0150] transition font-semibold ${
// // // // // // //                     loading ? "opacity-50 cursor-not-allowed" : ""
// // // // // // //                   }`}
// // // // // // //                 >
// // // // // // //                   {loading ? "Submitting..." : "Submit"}
// // // // // // //                 </button>
// // // // // // //               </>
// // // // // // //             )}
// // // // // // //           </form>
// // // // // // //         )}
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }



// // // // // // "use client";

// // // // // // import { useState, useEffect } from "react";
// // // // // // import { collection, addDoc, getFirestore } from "firebase/firestore";
// // // // // // import { getAuth, onAuthStateChanged } from "firebase/auth";
// // // // // // import { app } from "@/lib/firebase";
// // // // // // import PhoneInput from "react-phone-input-2";
// // // // // // import "react-phone-input-2/lib/style.css";
// // // // // // import { ToastContainer, toast } from "react-toastify";
// // // // // // import "react-toastify/dist/ReactToastify.css";

// // // // // // const db = getFirestore(app);
// // // // // // const auth = getAuth(app);

// // // // // // export default function AskQuestionModal({ expert, onClose, initialQuestion }) {
// // // // // //   const [question, setQuestion] = useState(initialQuestion || "");
// // // // // //   const [name, setName] = useState("");
// // // // // //   const [email, setEmail] = useState("");
// // // // // //   const [phone, setPhone] = useState("");
// // // // // //   const [errors, setErrors] = useState({});
// // // // // //   const [loading, setLoading] = useState(false);
// // // // // //   const [success, setSuccess] = useState(false);
// // // // // //   const [hasSubmitted, setHasSubmitted] = useState(false);
// // // // // //   const [user, setUser] = useState(null);

// // // // // //   // Load user details from localStorage or Firebase Auth
// // // // // //   useEffect(() => {
// // // // // //     const savedData = localStorage.getItem("userFormData");
// // // // // //     if (savedData) {
// // // // // //       const parsedData = JSON.parse(savedData);
// // // // // //       console.log("AskQuestionModal: Loaded from localStorage:", parsedData); // Debug
// // // // // //       setName(parsedData.name || "");
// // // // // //       setEmail(parsedData.email || "");
// // // // // //       setPhone(parsedData.phone || "");
// // // // // //       setHasSubmitted(true);
// // // // // //     }

// // // // // //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// // // // // //       if (currentUser) {
// // // // // //         console.log("AskQuestionModal: Auth user:", currentUser); // Debug
// // // // // //         setUser(currentUser);
// // // // // //         setName(currentUser.displayName || "");
// // // // // //         setEmail(currentUser.email || "");
// // // // // //         setPhone(currentUser.phoneNumber || "");
// // // // // //         setHasSubmitted(true);
// // // // // //       }
// // // // // //     });

// // // // // //     return () => unsubscribe();
// // // // // //   }, []);

// // // // // //   const validateForm = () => {
// // // // // //     const newErrors = {};
// // // // // //     if (!question.trim()) newErrors.question = "Question is required.";
// // // // // //     if (!(hasSubmitted || user)) {
// // // // // //       if (!name.trim()) newErrors.name = "Name is required.";
// // // // // //       if (!email.trim()) newErrors.email = "Email is required.";
// // // // // //       else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
// // // // // //       if (!phone.trim()) newErrors.phone = "Phone number is required.";
// // // // // //       else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
// // // // // //     }
// // // // // //     if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
// // // // // //     setErrors(newErrors);
// // // // // //     return Object.keys(newErrors).length === 0;
// // // // // //   };

// // // // // //   const handleSubmit = async (e) => {
// // // // // //     e.preventDefault();
// // // // // //     console.log("AskQuestionModal: handleSubmit called:", { question, name, email, phone }); // Debug
// // // // // //     if (!validateForm()) {
// // // // // //       toast.error("Please fill out all required fields correctly.");
// // // // // //       return;
// // // // // //     }

// // // // // //     setLoading(true);
// // // // // //     try {
// // // // // //       const docRef = await addDoc(collection(db, "Questions"), {
// // // // // //         expertId: expert.id,
// // // // // //         expertName: expert.fullName || "Unknown Expert",
// // // // // //         expertEmail: expert.email || "",
// // // // // //         question,
// // // // // //         userName: name,
// // // // // //         userEmail: email,
// // // // // //         userPhone: phone,
// // // // // //         status: "pending",
// // // // // //         createdAt: new Date().toISOString(),
// // // // // //         reply: null,
// // // // // //       });

// // // // // //       const response = await fetch("/api/send-question-emails", {
// // // // // //         method: "POST",
// // // // // //         headers: {
// // // // // //           "Content-Type": "application/json",
// // // // // //         },
// // // // // //         body: JSON.stringify({
// // // // // //           userEmail: email,
// // // // // //           userName: name,
// // // // // //           expertEmail: expert.email || "",
// // // // // //           expertName: expert.fullName || "Unknown Expert",
// // // // // //           question,
// // // // // //           userPhone: phone,
// // // // // //         }),
// // // // // //       });

// // // // // //       if (!response.ok) {
// // // // // //         throw new Error("Failed to send emails");
// // // // // //       }

// // // // // //       if (!hasSubmitted && !user) {
// // // // // //         localStorage.setItem(
// // // // // //           "userFormData",
// // // // // //           JSON.stringify({
// // // // // //             name,
// // // // // //             email,
// // // // // //             phone,
// // // // // //             purpose: "General Query", // Default purpose
// // // // // //           })
// // // // // //         );
// // // // // //         setHasSubmitted(true);
// // // // // //       }

// // // // // //       setSuccess(true);
// // // // // //       setTimeout(() => {
// // // // // //         onClose();
// // // // // //       }, 2000);
// // // // // //     } catch (error) {
// // // // // //       console.error("AskQuestionModal: Error submitting question:", error.message);
// // // // // //       toast.error("Failed to submit question. Please try again.");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <div
// // // // // //       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
// // // // // //       style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
// // // // // //     >
// // // // // //       <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative">
// // // // // //         <button
// // // // // //           onClick={onClose}
// // // // // //           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
// // // // // //         >
// // // // // //           ✕
// // // // // //         </button>
// // // // // //         <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
// // // // // //           Ask a Question to {expert?.fullName || "Expert"}
// // // // // //         </h2>
// // // // // //         {success ? (
// // // // // //           <p className="text-green-500 text-center">
// // // // // //             Question submitted successfully! Closing...
// // // // // //           </p>
// // // // // //         ) : (
// // // // // //           <form onSubmit={handleSubmit} className="space-y-4">
// // // // // //             <div>
// // // // // //               <label className="block text-sm font-medium text-gray-700 mb-1">
// // // // // //                 Write your question here
// // // // // //               </label>
// // // // // //               <textarea
// // // // // //                 value={question}
// // // // // //                 onChange={(e) => setQuestion(e.target.value)}
// // // // // //                 className={`mt-1 p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
// // // // // //                   errors.question ? "border-red-500" : ""
// // // // // //                 }`}
// // // // // //                 rows="4"
// // // // // //                 placeholder="Enter your question"
// // // // // //                 required
// // // // // //               />
// // // // // //               {errors.question && (
// // // // // //                 <p className="text-red-500 text-sm mt-1">{errors.question}</p>
// // // // // //               )}
// // // // // //             </div>
// // // // // //             {!(hasSubmitted || user) && (
// // // // // //               <>
// // // // // //                 <div>
// // // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// // // // // //                     Name
// // // // // //                   </label>
// // // // // //                   <input
// // // // // //                     type="text"
// // // // // //                     value={name}
// // // // // //                     onChange={(e) => setName(e.target.value)}
// // // // // //                     className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
// // // // // //                       errors.name ? "border-red-500" : ""
// // // // // //                     }`}
// // // // // //                     placeholder="Enter your name"
// // // // // //                     required
// // // // // //                   />
// // // // // //                   {errors.name && (
// // // // // //                     <p className="text-red-500 text-sm mt-1">{errors.name}</p>
// // // // // //                   )}
// // // // // //                 </div>
// // // // // //                 <div>
// // // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// // // // // //                     Email
// // // // // //                   </label>
// // // // // //                   <input
// // // // // //                     type="email"
// // // // // //                     value={email}
// // // // // //                     onChange={(e) => setEmail(e.target.value)}
// // // // // //                     className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
// // // // // //                       errors.email ? "border-red-500" : ""
// // // // // //                     }`}
// // // // // //                     placeholder="Enter your email"
// // // // // //                     required
// // // // // //                   />
// // // // // //                   {errors.email && (
// // // // // //                     <p className="text-red-500 text-sm mt-1">{errors.email}</p>
// // // // // //                   )}
// // // // // //                 </div>
// // // // // //                 <div>
// // // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// // // // // //                     Phone
// // // // // //                   </label>
// // // // // //                   <PhoneInput
// // // // // //                     country={"in"}
// // // // // //                     value={phone}
// // // // // //                     onChange={setPhone}
// // // // // //                     placeholder="Enter phone number"
// // // // // //                     inputProps={{
// // // // // //                       id: "phone",
// // // // // //                       className: `w-full p-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
// // // // // //                         errors.phone ? "border-red-500" : ""
// // // // // //                       }`,
// // // // // //                       required: true,
// // // // // //                     }}
// // // // // //                   />
// // // // // //                   {errors.phone && (
// // // // // //                     <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
// // // // // //                   )}
// // // // // //                 </div>
// // // // // //               </>
// // // // // //             )}
// // // // // //             {errors.form && (
// // // // // //               <p className="text-red-500 text-sm mt-1">{errors.form}</p>
// // // // // //             )}
// // // // // //             <button
// // // // // //               type="submit"
// // // // // //               disabled={loading}
// // // // // //               className={`w-full bg-[var(--primary)] text-white p-3 rounded-xl hover:bg-[#4a0150] transition font-semibold ${
// // // // // //                 loading ? "opacity-50 cursor-not-allowed" : ""
// // // // // //               }`}
// // // // // //             >
// // // // // //               {loading ? "Submitting..." : "Submit Question"}
// // // // // //             </button>
// // // // // //           </form>
// // // // // //         )}
// // // // // //       </div>
// // // // // //       <ToastContainer position="top-right" autoClose={3000} />
// // // // // //     </div>
// // // // // //   );
// // // // // // }

// // // // // "use client";

// // // // // import { useState, useEffect } from "react";
// // // // // import { collection, addDoc, getFirestore } from "firebase/firestore";
// // // // // import { getAuth, onAuthStateChanged } from "firebase/auth";
// // // // // import { app } from "@/lib/firebase";
// // // // // import PhoneInput from "react-phone-input-2";
// // // // // import "react-phone-input-2/lib/style.css";
// // // // // import { ToastContainer, toast } from "react-toastify";
// // // // // import "react-toastify/dist/ReactToastify.css";

// // // // // const db = getFirestore(app);
// // // // // const auth = getAuth(app);

// // // // // export default function AskQuestionModal({ expert, onClose, initialQuestion }) {
// // // // //   const [question, setQuestion] = useState(initialQuestion || "");
// // // // //   const [name, setName] = useState("");
// // // // //   const [email, setEmail] = useState("");
// // // // //   const [phone, setPhone] = useState("");
// // // // //   const [errors, setErrors] = useState({});
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [success, setSuccess] = useState(false);
// // // // //   const [hasSubmitted, setHasSubmitted] = useState(false);
// // // // //   const [user, setUser] = useState(null);

// // // // //   // Load user details from localStorage or Firebase Auth
// // // // //   useEffect(() => {
// // // // //     const savedData = localStorage.getItem("userFormData");
// // // // //     if (savedData) {
// // // // //       const parsedData = JSON.parse(savedData);
// // // // //       console.log("AskQuestionModal: Loaded from localStorage:", parsedData);
// // // // //       setName(parsedData.name || "");
// // // // //       setEmail(parsedData.email || "");
// // // // //       setPhone(parsedData.phone || "");
// // // // //       setHasSubmitted(true);
// // // // //     }

// // // // //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// // // // //       if (currentUser) {
// // // // //         console.log("AskQuestionModal: Auth user:", currentUser);
// // // // //         setUser(currentUser);
// // // // //         setName(currentUser.displayName || "");
// // // // //         setEmail(currentUser.email || "");
// // // // //         setPhone(currentUser.phoneNumber || "");
// // // // //         setHasSubmitted(true);
// // // // //       }
// // // // //     });

// // // // //     return () => unsubscribe();
// // // // //   }, []);

// // // // //   // Update question when initialQuestion changes
// // // // //   useEffect(() => {
// // // // //     console.log("AskQuestionModal: initialQuestion updated:", initialQuestion);
// // // // //     setQuestion(initialQuestion || "");
// // // // //   }, [initialQuestion]);

// // // // //   // Clear question when modal closes
// // // // //   useEffect(() => {
// // // // //     return () => {
// // // // //       console.log("AskQuestionModal: Cleaning up on close");
// // // // //       setQuestion("");
// // // // //       setErrors({});
// // // // //     };
// // // // //   }, []);

// // // // //   const validateForm = () => {
// // // // //     const newErrors = {};
// // // // //     if (!question.trim()) newErrors.question = "Question is required.";
// // // // //     if (!(hasSubmitted || user)) {
// // // // //       if (!name.trim()) newErrors.name = "Name is required.";
// // // // //       if (!email.trim()) newErrors.email = "Email is required.";
// // // // //       else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
// // // // //       if (!phone.trim()) newErrors.phone = "Phone number is required.";
// // // // //       else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
// // // // //     }
// // // // //     if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
// // // // //     setErrors(newErrors);
// // // // //     return Object.keys(newErrors).length === 0;
// // // // //   };

// // // // //   const handleSubmit = async (e) => {
// // // // //     e.preventDefault();
// // // // //     console.log("AskQuestionModal: handleSubmit called:", { question, name, email, phone, expert });
// // // // //     if (!validateForm()) {
// // // // //       toast.error("Please fill out all required fields correctly.");
// // // // //       return;
// // // // //     }

// // // // //     setLoading(true);
// // // // //     try {
// // // // //       const docRef = await addDoc(collection(db, "Questions"), {
// // // // //         expertId: expert.id,
// // // // //         expertName: expert.fullName || "Unknown Expert",
// // // // //         expertEmail: expert.email || "no-email@placeholder.com",
// // // // //         question,
// // // // //         userName: name,
// // // // //         userEmail: email,
// // // // //         userPhone: phone,
// // // // //         status: "pending",
// // // // //         createdAt: new Date().toISOString(),
// // // // //         reply: null,
// // // // //       });

// // // // //       if (expert.email) {
// // // // //         const response = await fetch("/api/send-question-emails", {
// // // // //           method: "POST",
// // // // //           headers: {
// // // // //             "Content-Type": "application/json",
// // // // //           },
// // // // //           body: JSON.stringify({
// // // // //             userEmail: email,
// // // // //             userName: name,
// // // // //             expertEmail: expert.email,
// // // // //             expertName: expert.fullName || "Unknown Expert",
// // // // //             question,
// // // // //             userPhone: phone,
// // // // //           }),
// // // // //         });

// // // // //         if (!response.ok) {
// // // // //           const errorData = await response.json();
// // // // //           throw new Error(`Failed to send emails: ${errorData.error || "Unknown error"}`);
// // // // //         }
// // // // //       } else {
// // // // //         console.warn("AskQuestionModal: Skipping email sending due to missing expert.email");
// // // // //         toast.warn("Question submitted, but expert email is missing. Notification not sent to expert.");
// // // // //       }

// // // // //       if (!hasSubmitted && !user) {
// // // // //         localStorage.setItem(
// // // // //           "userFormData",
// // // // //           JSON.stringify({
// // // // //             name,
// // // // //             email,
// // // // //             phone,
// // // // //             purpose: "General Query",
// // // // //           })
// // // // //         );
// // // // //         setHasSubmitted(true);
// // // // //       }

// // // // //       // Clear form fields after successful submission
// // // // //       setQuestion("");
// // // // //       if (!hasSubmitted && !user) {
// // // // //         setName("");
// // // // //         setEmail("");
// // // // //         setPhone("");
// // // // //       }
// // // // //       setErrors({});

// // // // //       setSuccess(true);
// // // // //       setTimeout(() => {
// // // // //         onClose();
// // // // //       }, 2000);
// // // // //     } catch (error) {
// // // // //       console.error("AskQuestionModal: Error submitting question:", error.message);
// // // // //       toast.error(`Failed to submit question: ${error.message}`);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <div
// // // // //       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
// // // // //       style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
// // // // //     >
// // // // //       <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative">
// // // // //         <button
// // // // //           onClick={onClose}
// // // // //           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
// // // // //         >
// // // // //           ✕
// // // // //         </button>
// // // // //         <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
// // // // //           Ask a Question to {expert?.fullName || "Expert"}
// // // // //         </h2>
// // // // //         {success ? (
// // // // //           <p className="text-green-500 text-center">
// // // // //             Question submitted successfully! Closing...
// // // // //           </p>
// // // // //         ) : (
// // // // //           <form onSubmit={handleSubmit} className="space-y-4">
// // // // //             <div>
// // // // //               <label className="block text-sm font-medium text-gray-700 mb-1">
// // // // //                 Write your question here
// // // // //               </label>
// // // // //               <textarea
// // // // //                 value={question}
// // // // //                 onChange={(e) => setQuestion(e.target.value)}
// // // // //                 className={`mt-1 p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
// // // // //                   errors.question ? "border-red-500" : ""
// // // // //                 }`}
// // // // //                 rows="4"
// // // // //                 placeholder="Enter your question"
// // // // //                 required
// // // // //               />
// // // // //               {errors.question && (
// // // // //                 <p className="text-red-500 text-sm mt-1">{errors.question}</p>
// // // // //               )}
// // // // //             </div>
// // // // //             {!(hasSubmitted || user) && (
// // // // //               <>
// // // // //                 <div>
// // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// // // // //                     Name
// // // // //                   </label>
// // // // //                   <input
// // // // //                     type="text"
// // // // //                     value={name}
// // // // //                     onChange={(e) => setName(e.target.value)}
// // // // //                     className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
// // // // //                       errors.name ? "border-red-500" : ""
// // // // //                     }`}
// // // // //                     placeholder="Enter your name"
// // // // //                     required
// // // // //                   />
// // // // //                   {errors.name && (
// // // // //                     <p className="text-red-500 text-sm mt-1">{errors.name}</p>
// // // // //                   )}
// // // // //                 </div>
// // // // //                 <div>
// // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// // // // //                     Email
// // // // //                   </label>
// // // // //                   <input
// // // // //                     type="email"
// // // // //                     value={email}
// // // // //                     onChange={(e) => setEmail(e.target.value)}
// // // // //                     className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
// // // // //                       errors.email ? "border-red-500" : ""
// // // // //                     }`}
// // // // //                     placeholder="Enter your email"
// // // // //                     required
// // // // //                   />
// // // // //                   {errors.email && (
// // // // //                     <p className="text-red-500 text-sm mt-1">{errors.email}</p>
// // // // //                   )}
// // // // //                 </div>
// // // // //                 <div>
// // // // //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// // // // //                     Phone
// // // // //                   </label>
// // // // //                   <PhoneInput
// // // // //                     country={"in"}
// // // // //                     value={phone}
// // // // //                     onChange={setPhone}
// // // // //                     placeholder="Enter phone number"
// // // // //                     inputProps={{
// // // // //                       id: "phone",
// // // // //                       className: `w-full p-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ml-8 ${
// // // // //                         errors.phone ? "border-red-500" : ""
// // // // //                       }`,
// // // // //                       required: true,
// // // // //                     }}
// // // // //                   />
// // // // //                   {errors.phone && (
// // // // //                     <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
// // // // //                   )}
// // // // //                 </div>
// // // // //               </>
// // // // //             )}
// // // // //             {errors.form && (
// // // // //               <p className="text-red-500 text-sm mt-1">{errors.form}</p>
// // // // //             )}
// // // // //             <button
// // // // //               type="submit"
// // // // //               disabled={loading}
// // // // //               className={`w-full bg-[var(--primary)] text-white p-3 rounded-xl hover:bg-[#4a0150] transition font-semibold ${
// // // // //                 loading ? "opacity-50 cursor-not-allowed" : ""
// // // // //               }`}
// // // // //             >
// // // // //               {loading ? "Submitting..." : "Submit Question"}
// // // // //             </button>
// // // // //           </form>
// // // // //         )}
// // // // //       </div>
// // // // //       <ToastContainer position="top-right" autoClose={3000} />
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // "use client";

// // // // import { useState, useEffect } from "react";
// // // // import { collection, addDoc, getFirestore } from "firebase/firestore";
// // // // import { getAuth, onAuthStateChanged } from "firebase/auth";
// // // // import { app } from "@/lib/firebase";
// // // // import PhoneInput from "react-phone-input-2";
// // // // import "react-phone-input-2/lib/style.css";
// // // // import { ToastContainer, toast } from "react-toastify";
// // // // import "react-toastify/dist/ReactToastify.css";

// // // // const db = getFirestore(app);
// // // // const auth = getAuth(app);

// // // // export default function AskQuestionModal({ expert, onClose, initialQuestion }) {
// // // //   const [question, setQuestion] = useState(initialQuestion || "");
// // // //   const [name, setName] = useState("");
// // // //   const [email, setEmail] = useState("");
// // // //   const [phone, setPhone] = useState("");
// // // //   const [errors, setErrors] = useState({});
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [success, setSuccess] = useState(false);
// // // //   const [hasSubmitted, setHasSubmitted] = useState(false);
// // // //   const [user, setUser] = useState(null);

// // // //   // Load user details from localStorage or Firebase Auth
// // // //   useEffect(() => {
// // // //     const savedData = localStorage.getItem("userFormData");
// // // //     if (savedData) {
// // // //       const parsedData = JSON.parse(savedData);
// // // //       console.log("AskQuestionModal: Loaded from localStorage:", parsedData);
// // // //       setName(parsedData.name || "");
// // // //       setEmail(parsedData.email || "");
// // // //       setPhone(parsedData.phone || "");
// // // //       setHasSubmitted(true);
// // // //     }

// // // //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// // // //       if (currentUser) {
// // // //         console.log("AskQuestionModal: Auth user:", currentUser);
// // // //         setUser(currentUser);
// // // //         setName(currentUser.displayName || "");
// // // //         setEmail(currentUser.email || "");
// // // //         setPhone(currentUser.phoneNumber || "");
// // // //         setHasSubmitted(true);
// // // //       }
// // // //     });

// // // //     return () => unsubscribe();
// // // //   }, []);

// // // //   // Update question when initialQuestion changes
// // // //   useEffect(() => {
// // // //     console.log("AskQuestionModal: initialQuestion updated:", initialQuestion);
// // // //     setQuestion(initialQuestion || "");
// // // //   }, [initialQuestion]);

// // // //   // Clear question when modal closes
// // // //   useEffect(() => {
// // // //     return () => {
// // // //       console.log("AskQuestionModal: Cleaning up on close");
// // // //       setQuestion("");
// // // //       setErrors({});
// // // //     };
// // // //   }, []);

// // // //   const validateForm = () => {
// // // //     const newErrors = {};
// // // //     if (!question.trim()) newErrors.question = "Question is required.";
// // // //     if (!(hasSubmitted || user)) {
// // // //       if (!name.trim()) newErrors.name = "Name is required.";
// // // //       if (!email.trim()) newErrors.email = "Email is required.";
// // // //       else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
// // // //       if (!phone.trim()) newErrors.phone = "Phone number is required.";
// // // //       else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
// // // //     }
// // // //     if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
// // // //     setErrors(newErrors);
// // // //     return Object.keys(newErrors).length === 0;
// // // //   };

// // // //   const handleSubmit = async (e) => {
// // // //     e.preventDefault();
// // // //     console.log("AskQuestionModal: handleSubmit called:", { question, name, email, phone, expert });
// // // //     if (!validateForm()) {
// // // //       toast.error("Please fill out all required fields correctly.");
// // // //       return;
// // // //     }

// // // //     setLoading(true);
// // // //     try {
// // // //       const docRef = await addDoc(collection(db, "Questions"), {
// // // //         expertId: expert.id,
// // // //         expertName: expert.fullName || "Unknown Expert",
// // // //         expertEmail: expert.email || "no-email@placeholder.com",
// // // //         question,
// // // //         userName: name,
// // // //         userEmail: email,
// // // //         userPhone: phone,
// // // //         status: "pending",
// // // //         createdAt: new Date().toISOString(),
// // // //         reply: null,
// // // //       });

// // // //       if (expert.email) {
// // // //         const response = await fetch("/api/send-question-emails", {
// // // //           method: "POST",
// // // //           headers: {
// // // //             "Content-Type": "application/json",
// // // //           },
// // // //           body: JSON.stringify({
// // // //             userEmail: email,
// // // //             userName: name,
// // // //             expertEmail: expert.email,
// // // //             expertName: expert.fullName || "Unknown Expert",
// // // //             question,
// // // //             userPhone: phone,
// // // //           }),
// // // //         });

// // // //         if (!response.ok) {
// // // //           const errorData = await response.json();
// // // //           throw new Error(`Failed to send emails: ${errorData.error || "Unknown error"}`);
// // // //         }
// // // //       } else {
// // // //         console.warn("AskQuestionModal: Skipping email sending due to missing expert.email");
// // // //         toast.warn("Question submitted, but expert email is missing. Notification not sent to expert.");
// // // //       }

// // // //       if (!hasSubmitted && !user) {
// // // //         localStorage.setItem(
// // // //           "userFormData",
// // // //           JSON.stringify({
// // // //             name,
// // // //             email,
// // // //             phone,
// // // //             purpose: "General Query",
// // // //           })
// // // //         );
// // // //         setHasSubmitted(true);
// // // //       }

// // // //       // Clear form fields after successful submission
// // // //       setQuestion("");
// // // //       if (!hasSubmitted && !user) {
// // // //         setName("");
// // // //         setEmail("");
// // // //         setPhone("");
// // // //       }
// // // //       setErrors({});

// // // //       setSuccess(true);
// // // //       setTimeout(() => {
// // // //         onClose();
// // // //       }, 2000);
// // // //     } catch (error) {
// // // //       console.error("AskQuestionModal: Error submitting question:", error.message);
// // // //       toast.error(`Failed to submit question: ${error.message}`);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-gray-900/30 to-black/30 flex items-center justify-center z-50">
// // // //       <div className="bg-transparent backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-lg relative border border-white/10">
// // // //         <button
// // // //           onClick={onClose}
// // // //           className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl font-bold"
// // // //         >
// // // //           ✕
// // // //         </button>
// // // //         <h2 className="text-3xl font-bold bg-clip-text text-primary">
// // // //           Ask {expert?.fullName || "Expert"} a Question
// // // //         </h2>
// // // //         {success ? (
// // // //           <p className="text-green-400 text-center font-medium text-lg animate-pulse">
// // // //             Question submitted successfully! Closing...
// // // //           </p>
// // // //         ) : (
// // // //           <form onSubmit={handleSubmit} className="space-y-6">
// // // //             <div>
// // // //               <label className="block text-sm font-semibold text-primary mb-2">
// // // //                 Your Question
// // // //               </label>
// // // //               <textarea
// // // //                 value={question}
// // // //                 onChange={(e) => setQuestion(e.target.value)}
// // // //                 className={`mt-1 p-4 w-full border rounded-xl bg-white/5 text-primary placeholder-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
// // // //                   errors.question ? "border-red-500" : "border-white/20"
// // // //                 }`}
// // // //                 rows="5"
// // // //                 placeholder="Type your question here..."
// // // //                 required
// // // //               />
// // // //               {errors.question && (
// // // //                 <p className="text-red-400 text-sm mt-2">{errors.question}</p>
// // // //               )}
// // // //             </div>
// // // //             {!(hasSubmitted || user) && (
// // // //               <>
// // // //                 <div>
// // // //                   <label className="block text-sm font-semibold text-white/90 mb-2">
// // // //                     Full Name
// // // //                   </label>
// // // //                   <input
// // // //                     type="text"
// // // //                     value={name}
// // // //                     onChange={(e) => setName(e.target.value)}
// // // //                     className={`p-4 w-full border rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 ${
// // // //                       errors.name ? "border-red-500" : "border-white/20"
// // // //                     }`}
// // // //                     placeholder="Enter your name"
// // // //                     required
// // // //                   />
// // // //                   {errors.name && (
// // // //                     <p className="text-red-400 text-sm mt-2">{errors.name}</p>
// // // //                   )}
// // // //                 </div>
// // // //                 <div>
// // // //                   <label className="block text-sm font-semibold text-white/90 mb-2">
// // // //                     Email Address
// // // //                   </label>
// // // //                   <input
// // // //                     type="email"
// // // //                     value={email}
// // // //                     onChange={(e) => setEmail(e.target.value)}
// // // //                     className={`p-4 w-full border rounded-xl bg-white/5 text-primary placeholder-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
// // // //                       errors.email ? "border-red-500" : "border-white/20"
// // // //                     }`}
// // // //                     placeholder="Enter your email"
// // // //                     required
// // // //                   />
// // // //                   {errors.email && (
// // // //                     <p className="text-red-400 text-sm mt-2">{errors.email}</p>
// // // //                   )}
// // // //                 </div>
// // // //                 <div>
// // // //                   <label className="block text-sm font-semibold text-white/90 mb-2">
// // // //                     Phone Number
// // // //                   </label>
// // // //                   <PhoneInput
// // // //                     country={"in"}
// // // //                     value={phone}
// // // //                     onChange={setPhone}
// // // //                     placeholder="Enter phone number"
// // // //                     inputProps={{
// // // //                       id: "phone",
// // // //                       className: `w-full p-4 border rounded-xl bg-white/5 text-primary placeholder-white/50 focus:ring-2 focus:ring-primary focus:border-transparent pl-12 transition-all duration-300 ${
// // // //                         errors.phone ? "border-red-500" : "border-white/20"
// // // //                       }`,
// // // //                       required: true,
// // // //                     }}
// // // //                   />
// // // //                   {errors.phone && (
// // // //                     <p className="text-red-400 text-sm mt-2">{errors.phone}</p>
// // // //                   )}
// // // //                 </div>
// // // //               </>
// // // //             )}
// // // //             {errors.form && (
// // // //               <p className="text-red-400 text-sm mt-2">{errors.form}</p>
// // // //             )}
// // // //             <button
// // // //               type="submit"
// // // //               disabled={loading}
// // // //               className={`w-full bg-gradient-to-r from-primary to-secondary text-primary p-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
// // // //                 loading ? "opacity-70 cursor-not-allowed" : ""
// // // //               }`}
// // // //             >
// // // //               {loading ? "Submitting..." : "Submit Question"}
// // // //             </button>
// // // //           </form>
// // // //         )}
// // // //       </div>
// // // //       <ToastContainer position="top-right" autoClose={3000} theme="dark" />
// // // //     </div>
// // // //   );
// // // // }

// // // "use client";

// // // import { useState, useEffect } from "react";
// // // import { collection, addDoc, getFirestore } from "firebase/firestore";
// // // import { getAuth, onAuthStateChanged } from "firebase/auth";
// // // import { app } from "@/lib/firebase";
// // // import PhoneInput from "react-phone-input-2";
// // // import "react-phone-input-2/lib/style.css";
// // // import { ToastContainer, toast } from "react-toastify";
// // // import "react-toastify/dist/ReactToastify.css";

// // // const db = getFirestore(app);
// // // const auth = getAuth(app);

// // // export default function AskQuestionModal({ expert, onClose, initialQuestion }) {
// // //   const [question, setQuestion] = useState(initialQuestion || "");
// // //   const [name, setName] = useState("");
// // //   const [email, setEmail] = useState("");
// // //   const [phone, setPhone] = useState("");
// // //   const [errors, setErrors] = useState({});
// // //   const [loading, setLoading] = useState(false);
// // //   const [success, setSuccess] = useState(false);
// // //   const [hasSubmitted, setHasSubmitted] = useState(false);
// // //   const [user, setUser] = useState(null);

// // //   // Load user details from localStorage or Firebase Auth
// // //   useEffect(() => {
// // //     const savedData = localStorage.getItem("userFormData");
// // //     if (savedData) {
// // //       const parsedData = JSON.parse(savedData);
// // //       console.log("AskQuestionModal: Loaded from localStorage:", parsedData);
// // //       setName(parsedData.name || "");
// // //       setEmail(parsedData.email || "");
// // //       setPhone(parsedData.phone || "");
// // //       setHasSubmitted(true);
// // //     }

// // //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// // //       if (currentUser) {
// // //         console.log("AskQuestionModal: Auth user:", currentUser);
// // //         setUser(currentUser);
// // //         setName(currentUser.displayName || "");
// // //         setEmail(currentUser.email || "");
// // //         setPhone(currentUser.phoneNumber || "");
// // //         setHasSubmitted(true);
// // //       }
// // //     });

// // //     return () => unsubscribe();
// // //   }, []);

// // //   // Update question when initialQuestion changes
// // //   useEffect(() => {
// // //     console.log("AskQuestionModal: initialQuestion updated:", initialQuestion);
// // //     setQuestion(initialQuestion || "");
// // //   }, [initialQuestion]);

// // //   // Clear question when modal closes
// // //   useEffect(() => {
// // //     return () => {
// // //       console.log("AskQuestionModal: Cleaning up on close");
// // //       setQuestion("");
// // //       setErrors({});
// // //     };
// // //   }, []);

// // //   const validateForm = () => {
// // //     const newErrors = {};
// // //     if (!question.trim()) newErrors.question = "Question is required.";
// // //     if (!(hasSubmitted || user)) {
// // //       if (!name.trim()) newErrors.name = "Name is required.";
// // //       if (!email.trim()) newErrors.email = "Email is required.";
// // //       else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
// // //       if (!phone.trim()) newErrors.phone = "Phone number is required.";
// // //       else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
// // //     }
// // //     if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
// // //     setErrors(newErrors);
// // //     return Object.keys(newErrors).length === 0;
// // //   };

// // //   const validateEmailPayload = (payload) => {
// // //     const requiredFields = ["userEmail", "userName", "expertEmail", "expertName", "question", "userPhone"];
// // //     const missingFields = requiredFields.filter((field) => !payload[field] || payload[field].trim() === "");
// // //     return missingFields.length === 0 ? null : `Missing required fields: ${missingFields.join(", ")}`;
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     console.log("AskQuestionModal: handleSubmit called:", { question, name, email, phone, expert });
// // //     if (!validateForm()) {
// // //       toast.error("Please fill out all required fields correctly.");
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       const docRef = await addDoc(collection(db, "Questions"), {
// // //         expertId: expert.id,
// // //         expertName: expert.fullName || "Unknown Expert",
// // //         expertEmail: expert.email || "no-email@placeholder.com",
// // //         question,
// // //         userName: name,
// // //         userEmail: email,
// // //         userPhone: phone,
// // //         status: "pending",
// // //         createdAt: new Date().toISOString(),
// // //         reply: null,
// // //       });

// // //       if (expert.email) {
// // //         const emailPayload = {
// // //           userEmail: email,
// // //           userName: name,
// // //           expertEmail: expert.email,
// // //           expertName: expert.fullName || "Unknown Expert",
// // //           question,
// // //           userPhone: phone,
// // //         };

// // //         console.log("AskQuestionModal: Email payload:", emailPayload);

// // //         const validationError = validateEmailPayload(emailPayload);
// // //         if (validationError) {
// // //           throw new Error(validationError);
// // //         }

// // //         const response = await fetch("/api/send-question-emails", {
// // //           method: "POST",
// // //           headers: {
// // //             "Content-Type": "application/json",
// // //           },
// // //           body: JSON.stringify(emailPayload),
// // //         });

// // //         if (!response.ok) {
// // //           const errorData = await response.json();
// // //           throw new Error(`Failed to send emails: ${errorData.error || "Unknown error"}`);
// // //         }
// // //       } else {
// // //         console.warn("AskQuestionModal: Skipping email sending due to missing expert.email");
// // //         toast.warn("Question submitted, but expert email is missing. Notification not sent to expert.");
// // //       }

// // //       if (!hasSubmitted && !user) {
// // //         localStorage.setItem(
// // //           "userFormData",
// // //           JSON.stringify({
// // //             name,
// // //             email,
// // //             phone,
// // //             purpose: "General Query",
// // //           })
// // //         );
// // //         setHasSubmitted(true);
// // //       }

// // //       setQuestion("");
// // //       if (!hasSubmitted && !user) {
// // //         setName("");
// // //         setEmail("");
// // //         setPhone("");
// // //       }
// // //       setErrors({});

// // //       setSuccess(true);
// // //       setTimeout(() => {
// // //         onClose();
// // //       }, 2000);
// // //     } catch (error) {
// // //       console.error("AskQuestionModal: Error submitting question:", error.message);
// // //       toast.error(`Failed to submit question: ${error.message}`);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="fixed inset-0 bg-gradient-to-br from-gray-100/80 via-white/80 to-gray-100/80 flex items-center justify-center z-50">
// // //       <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-lg relative border border-gray-200/50">
// // //         <button
// // //           onClick={onClose}
// // //           className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors text-xl font-bold"
// // //           aria-label="Close modal"
// // //         >
// // //           ✕
// // //         </button>
// // //         <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500 mb-6">
// // //           Ask {expert?.fullName || "Expert"} a Question
// // //         </h2>
// // //         {success ? (
// // //           <p className="text-green-500 text-center font-medium text-lg animate-pulse">
// // //             Question submitted successfully! Closing...
// // //           </p>
// // //         ) : (
// // //           <form onSubmit={handleSubmit} className="space-y-6">
// // //             <div>
// // //               <label className="block text-sm font-semibold text-gray-800 mb-2">
// // //                 Your Question
// // //               </label>
// // //               <textarea
// // //                 value={question}
// // //                 onChange={(e) => setQuestion(e.target.value)}
// // //                 className={`mt-1 p-4 w-full border rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 ${
// // //                   errors.question ? "border-red-500" : "border-gray-200"
// // //                 }`}
// // //                 rows="5"
// // //                 placeholder="Type your question here..."
// // //                 required
// // //               />
// // //               {errors.question && (
// // //                 <p className="text-red-500 text-sm mt-2">{errors.question}</p>
// // //               )}
// // //             </div>
// // //             {!(hasSubmitted || user) && (
// // //               <>
// // //                 <div>
// // //                   <label className="block text-sm font-semibold text-gray-800 mb-2">
// // //                     Full Name
// // //                   </label>
// // //                   <input
// // //                     type="text"
// // //                     value={name}
// // //                     onChange={(e) => setName(e.target.value)}
// // //                     className={`p-4 w-full border rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 ${
// // //                       errors.name ? "border-red-500" : "border-gray-200"
// // //                     }`}
// // //                     placeholder="Enter your name"
// // //                     required
// // //                   />
// // //                   {errors.name && (
// // //                     <p className="text-red-500 text-sm mt-2">{errors.name}</p>
// // //                   )}
// // //                 </div>
// // //                 <div>
// // //                   <label className="block text-sm font-semibold text-gray-800 mb-2">
// // //                     Email Address
// // //                   </label>
// // //                   <input
// // //                     type="email"
// // //                     value={email}
// // //                     onChange={(e) => setEmail(e.target.value)}
// // //                     className={`p-4 w-full border rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 ${
// // //                       errors.email ? "border-red-500" : "border-gray-200"
// // //                     }`}
// // //                     placeholder="Enter your email"
// // //                     required
// // //                   />
// // //                   {errors.email && (
// // //                     <p className="text-red-500 text-sm mt-2">{errors.email}</p>
// // //                   )}
// // //                 </div>
// // //                 <div>
// // //                   <label className="block text-sm font-semibold text-gray-800 mb-2">
// // //                     Phone Number
// // //                   </label>
// // //                   <PhoneInput
// // //                     country={"in"}
// // //                     value={phone}
// // //                     onChange={(phone) => setPhone(`+${phone}`)} // Ensure phone includes country code
// // //                     placeholder="Enter phone number"
// // //                     inputProps={{
// // //                       id: "phone",
// // //                       className: `w-full p-4 border rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-transparent pl-12 transition-all duration-300 ${
// // //                         errors.phone ? "border-red-500" : "border-gray-200"
// // //                       }`,
// // //                       required: true,
// // //                     }}
// // //                   />
// // //                   {errors.phone && (
// // //                     <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
// // //                   )}
// // //                 </div>
// // //               </>
// // //             )}
// // //             {errors.form && (
// // //               <p className="text-red-500 text-sm mt-2">{errors.form}</p>
// // //             )}
// // //             <button
// // //               type="submit"
// // //               disabled={loading}
// // //               className={`w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white p-4 rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 ${
// // //                 loading ? "opacity-70 cursor-not-allowed" : ""
// // //               }`}
// // //             >
// // //               {loading ? "Submitting..." : "Submit Question"}
// // //             </button>
// // //           </form>
// // //         )}
// // //       </div>
// // //       <ToastContainer position="top-right" autoClose={3000} theme="light" />
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useState, useEffect } from "react";
// // import { collection, addDoc, getFirestore } from "firebase/firestore";
// // import { getAuth, onAuthStateChanged } from "firebase/auth";
// // import { app } from "@/lib/firebase";
// // import PhoneInput from "react-phone-input-2";
// // import "react-phone-input-2/lib/style.css";
// // import { ToastContainer, toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";

// // const db = getFirestore(app);
// // const auth = getAuth(app);

// // export default function AskQuestionModal({ expert, onClose, initialQuestion }) {
// //   const [question, setQuestion] = useState(initialQuestion || "");
// //   const [name, setName] = useState("");
// //   const [email, setEmail] = useState("");
// //   const [phone, setPhone] = useState("");
// //   const [errors, setErrors] = useState({});
// //   const [loading, setLoading] = useState(false);
// //   const [success, setSuccess] = useState(false);
// //   const [hasSubmitted, setHasSubmitted] = useState(false);
// //   const [user, setUser] = useState(null);

// //   // Load user details from localStorage or Firebase Auth
// //   useEffect(() => {
// //     const savedData = localStorage.getItem("userFormData");
// //     if (savedData) {
// //       const parsedData = JSON.parse(savedData);
// //       console.log("AskQuestionModal: Loaded from localStorage:", parsedData);
// //       setName(parsedData.name || "");
// //       setEmail(parsedData.email || "");
// //       setPhone(parsedData.phone || "");
// //       setHasSubmitted(true);
// //     }

// //     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
// //       if (currentUser) {
// //         console.log("AskQuestionModal: Auth user:", currentUser);
// //         setUser(currentUser);
// //         setName(currentUser.displayName || "");
// //         setEmail(currentUser.email || "");
// //         setPhone(currentUser.phoneNumber || "");
// //         setHasSubmitted(true);
// //       }
// //     });

// //     return () => unsubscribe();
// //   }, []);

// //   // Update question when initialQuestion changes
// //   useEffect(() => {
// //     console.log("AskQuestionModal: initialQuestion updated:", initialQuestion);
// //     setQuestion(initialQuestion || "");
// //   }, [initialQuestion]);

// //   // Clear question when modal closes
// //   useEffect(() => {
// //     return () => {
// //       console.log("AskQuestionModal: Cleaning up on close");
// //       setQuestion("");
// //       setErrors({});
// //     };
// //   }, []);

// //   const validateForm = () => {
// //     const newErrors = {};
// //     if (!question.trim()) newErrors.question = "Question is required.";
// //     if (!(hasSubmitted || user)) {
// //       if (!name.trim()) newErrors.name = "Name is required.";
// //       if (!email.trim()) newErrors.email = "Email is required.";
// //       else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
// //       if (!phone.trim()) newErrors.phone = "Phone number is required.";
// //       else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
// //     }
// //     if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     console.log("AskQuestionModal: handleSubmit called:", { question, name, email, phone, expert });
// //     if (!validateForm()) {
// //       toast.error("Please fill out all required fields correctly.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const docRef = await addDoc(collection(db, "Questions"), {
// //         expertId: expert.id,
// //         expertName: expert.fullName || "Unknown Expert",
// //         expertEmail: expert.email || "no-email@placeholder.com",
// //         question,
// //         userName: name,
// //         userEmail: email,
// //         userPhone: phone,
// //         status: "pending",
// //         createdAt: new Date().toISOString(),
// //         reply: null,
// //       });

// //       if (expert.email) {
// //         const response = await fetch("/api/send-question-emails", {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             userEmail: email,
// //             userName: name,
// //             expertEmail: expert.email,
// //             expertName: expert.fullName || "Unknown Expert",
// //             question,
// //             userPhone: phone,
// //           }),
// //         });

// //         if (!response.ok) {
// //           const errorData = await response.json();
// //           throw new Error(`Failed to send emails: ${errorData.error || "Unknown error"}`);
// //         }
// //       } else {
// //         console.warn("AskQuestionModal: Skipping email sending due to missing expert.email");
// //         toast.warn("Question submitted, but expert email is missing. Notification not sent to expert.");
// //       }

// //       if (!hasSubmitted && !user) {
// //         localStorage.setItem(
// //           "userFormData",
// //           JSON.stringify({
// //             name,
// //             email,
// //             phone,
// //             purpose: "General Query",
// //           })
// //         );
// //         setHasSubmitted(true);
// //       }

// //       // Clear form fields after successful submission
// //       setQuestion("");
// //       if (!hasSubmitted && !user) {
// //         setName("");
// //         setEmail("");
// //         setPhone("");
// //       }
// //       setErrors({});

// //       setSuccess(true);
// //       setTimeout(() => {
// //         onClose();
// //       }, 2000);
// //     } catch (error) {
// //       console.error("AskQuestionModal: Error submitting question:", error.message);
// //       toast.error(`Failed to submit question: ${error.message}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-gray-900/30 to-black/30 flex items-center justify-center z-50">
// //       <div className="bg-transparent backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-lg relative border border-white/10">
// //         <button
// //           onClick={onClose}
// //           className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl font-bold"
// //         >
// //           ✕
// //         </button>
// //         <h2 className="text-3xl font-bold bg-clip-text text-primary">
// //           Ask {expert?.fullName || "Expert"} a Question
// //         </h2>
// //         {success ? (
// //           <p className="text-green-400 text-center font-medium text-lg animate-pulse">
// //             Question submitted successfully! Closing...
// //           </p>
// //         ) : (
// //           <form onSubmit={handleSubmit} className="space-y-6">
// //             <div>
// //               <label className="block text-sm font-semibold text-primary mb-2">
// //                 Your Question
// //               </label>
// //               <textarea
// //                 value={question}
// //                 onChange={(e) => setQuestion(e.target.value)}
// //                 className={`mt-1 p-4 w-full border rounded-xl bg-white/5 text-primary placeholder-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
// //                   errors.question ? "border-red-500" : "border-white/20"
// //                 }`}
// //                 rows="5"
// //                 placeholder="Type your question here..."
// //                 required
// //               />
// //               {errors.question && (
// //                 <p className="text-red-400 text-sm mt-2">{errors.question}</p>
// //               )}
// //             </div>
// //             {!(hasSubmitted || user) && (
// //               <>
// //                 <div>
// //                   <label className="block text-sm font-semibold text-white/90 mb-2">
// //                     Full Name
// //                   </label>
// //                   <input
// //                     type="text"
// //                     value={name}
// //                     onChange={(e) => setName(e.target.value)}
// //                     className={`p-4 w-full border rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 ${
// //                       errors.name ? "border-red-500" : "border-white/20"
// //                     }`}
// //                     placeholder="Enter your name"
// //                     required
// //                   />
// //                   {errors.name && (
// //                     <p className="text-red-400 text-sm mt-2">{errors.name}</p>
// //                   )}
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-semibold text-white/90 mb-2">
// //                     Email Address
// //                   </label>
// //                   <input
// //                     type="email"
// //                     value={email}
// //                     onChange={(e) => setEmail(e.target.value)}
// //                     className={`p-4 w-full border rounded-xl bg-white/5 text-primary placeholder-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
// //                       errors.email ? "border-red-500" : "border-white/20"
// //                     }`}
// //                     placeholder="Enter your email"
// //                     required
// //                   />
// //                   {errors.email && (
// //                     <p className="text-red-400 text-sm mt-2">{errors.email}</p>
// //                   )}
// //                 </div>
// //                 <div>
// //                   <label className="block text-sm font-semibold text-white/90 mb-2">
// //                     Phone Number
// //                   </label>
// //                   <PhoneInput
// //                     country={"in"}
// //                     value={phone}
// //                     onChange={setPhone}
// //                     placeholder="Enter phone number"
// //                     inputProps={{
// //                       id: "phone",
// //                       className: `w-full p-4 border rounded-xl bg-white/5 text-primary placeholder-white/50 focus:ring-2 focus:ring-primary focus:border-transparent pl-12 transition-all duration-300 ${
// //                         errors.phone ? "border-red-500" : "border-white/20"
// //                       }`,
// //                       required: true,
// //                     }}
// //                   />
// //                   {errors.phone && (
// //                     <p className="text-red-400 text-sm mt-2">{errors.phone}</p>
// //                   )}
// //                 </div>
// //               </>
// //             )}
// //             {errors.form && (
// //               <p className="text-red-400 text-sm mt-2">{errors.form}</p>
// //             )}
// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className={`w-full bg-gradient-to-r from-primary to-secondary text-primary p-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
// //                 loading ? "opacity-70 cursor-not-allowed" : ""
// //               }`}
// //             >
// //               {loading ? "Submitting..." : "Submit Question"}
// //             </button>
// //           </form>
// //         )}
// //       </div>
// //       <ToastContainer position="top-right" autoClose={3000} theme="dark" />
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import { collection, addDoc, getFirestore } from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { app } from "@/lib/firebase";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const db = getFirestore(app);
// const auth = getAuth(app);

// export default function AskQuestionModal({ expert, onClose, initialQuestion }) {
//   const [question, setQuestion] = useState(initialQuestion || "");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [hasSubmitted, setHasSubmitted] = useState(false);
//   const [user, setUser] = useState(null);

//   // Load user details from localStorage or Firebase Auth
//   useEffect(() => {
//     const savedData = localStorage.getItem("userFormData");
//     if (savedData) {
//       const parsedData = JSON.parse(savedData);
//       console.log("AskQuestionModal: Loaded from localStorage:", parsedData);
//       setName(parsedData.name || "");
//       setEmail(parsedData.email || "");
//       setPhone(parsedData.phone || "");
//       setHasSubmitted(true);
//     }

//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       if (currentUser) {
//         console.log("AskQuestionModal: Auth user:", currentUser);
//         setUser(currentUser);
//         setName(currentUser.displayName || "");
//         setEmail(currentUser.email || "");
//         setPhone(currentUser.phoneNumber || "");
//         setHasSubmitted(true);
//       }
//     });

//     return () => unsubscribe();
//   }, []);

//   // Update question when initialQuestion changes
//   useEffect(() => {
//     console.log("AskQuestionModal: initialQuestion updated:", initialQuestion);
//     setQuestion(initialQuestion || "");
//   }, [initialQuestion]);

//   // Clear question when modal closes
//   useEffect(() => {
//     return () => {
//       console.log("AskQuestionModal: Cleaning up on close");
//       setQuestion("");
//       setErrors({});
//     };
//   }, []);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!question.trim()) newErrors.question = "Question is required.";
//     if (!(hasSubmitted || user)) {
//       if (!name.trim()) newErrors.name = "Name is required.";
//       if (!email.trim()) newErrors.email = "Email is required.";
//       else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
//       if (!phone.trim()) newErrors.phone = "Phone number is required.";
//       else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
//     }
//     if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("AskQuestionModal: handleSubmit called:", { question, name, email, phone, expert });
//     if (!validateForm()) {
//       toast.error("Please fill out all required fields correctly.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const docRef = await addDoc(collection(db, "Questions"), {
//         expertId: expert.id,
//         expertName: expert.fullName || "Unknown Expert",
//         expertEmail: expert.email || "no-email@placeholder.com",
//         question,
//         userName: name,
//         userEmail: email,
//         userPhone: phone,
//         status: "pending",
//         createdAt: new Date().toISOString(),
//         reply: null,
//       });

//       if (expert.email) {
//         const response = await fetch("/api/send-question-emails", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             userEmail: email,
//             userName: name,
//             expertEmail: expert.email,
//             expertName: expert.fullName || "Unknown Expert",
//             question,
//             userPhone: phone,
//           }),
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(`Failed to send emails: ${errorData.error || "Unknown error"}`);
//         }
//       } else {
//         console.warn("AskQuestionModal: Skipping email sending due to missing expert.email");
//         toast.warn("Question submitted, but expert email is missing. Notification not sent to expert.");
//       }

//       if (!hasSubmitted && !user) {
//         localStorage.setItem(
//           "userFormData",
//           JSON.stringify({
//             name,
//             email,
//             phone,
//             purpose: "General Query",
//           })
//         );
//         setHasSubmitted(true);
//       }

//       // Clear form fields after successful submission
//       setQuestion("");
//       if (!hasSubmitted && !user) {
//         setName("");
//         setEmail("");
//         setPhone("");
//       }
//       setErrors({});

//       setSuccess(true);
//       setTimeout(() => {
//         onClose();
//       }, 2000);
//     } catch (error) {
//       console.error("AskQuestionModal: Error submitting question:", error.message);
//       toast.error(`Failed to submit question: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//       style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//     >
//       <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
//         >
//           ✕
//         </button>
//         <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
//           Ask a Question to {expert?.fullName || "Expert"}
//         </h2>
//         {success ? (
//           <p className="text-green-500 text-center">
//             Question submitted successfully! Closing...
//           </p>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Write your question here
//               </label>
//               <textarea
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 className={`mt-1 p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
//                   errors.question ? "border-red-500" : ""
//                 }`}
//                 rows="4"
//                 placeholder="Enter your question"
//                 required
//               />
//               {errors.question && (
//                 <p className="text-red-500 text-sm mt-1">{errors.question}</p>
//               )}
//             </div>
//             {!(hasSubmitted || user) && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Name
//                   </label>
//                   <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
//                       errors.name ? "border-red-500" : ""
//                     }`}
//                     placeholder="Enter your name"
//                     required
//                   />
//                   {errors.name && (
//                     <p className="text-red-500 text-sm mt-1">{errors.name}</p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${
//                       errors.email ? "border-red-500" : ""
//                     }`}
//                     placeholder="Enter your email"
//                     required
//                   />
//                   {errors.email && (
//                     <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//                   )}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Phone
//                   </label>
//                   <PhoneInput
//                     country={"in"}
//                     value={phone}
//                     onChange={setPhone}
//                     placeholder="Enter phone number"
//                     inputProps={{
//                       id: "phone",
//                       className: `w-full p-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ml-8 ${
//                         errors.phone ? "border-red-500" : ""
//                       }`,
//                       required: true,
//                     }}
//                   />
//                   {errors.phone && (
//                     <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
//                   )}
//                 </div>
//               </>
//             )}
//             {errors.form && (
//               <p className="text-red-500 text-sm mt-1">{errors.form}</p>
//             )}
//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full bg-[var(--primary)] text-white p-3 rounded-xl hover:bg-[#4a0150] transition font-semibold ${
//                 loading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               {loading ? "Submitting..." : "Submit Question"}
//             </button>
//           </form>
//         )}
//       </div>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore(app);
const auth = getAuth(app);

export default function AskQuestionModal({ expert, onClose, initialQuestion }) {
  const [question, setQuestion] = useState(initialQuestion || "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [user, setUser] = useState(null);

  // Load user details from localStorage or Firebase Auth
  useEffect(() => {
    const savedData = localStorage.getItem("userFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      console.log("AskQuestionModal: Loaded from localStorage:", parsedData);
      setName(parsedData.name || "");
      setEmail(parsedData.email || "");
      setPhone(parsedData.phone || "");
      setHasSubmitted(true); // Mark as submitted if data exists
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("AskQuestionModal: Auth user:", currentUser);
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setPhone(currentUser.phoneNumber || "");
        setHasSubmitted(true); // Mark as submitted for authenticated users
      }
    });

    return () => unsubscribe();
  }, []);

  // Update question when initialQuestion changes
  useEffect(() => {
    console.log("AskQuestionModal: initialQuestion updated:", initialQuestion);
    setQuestion(initialQuestion || "");
  }, [initialQuestion]);

  // Clear question when modal closes
  useEffect(() => {
    return () => {
      console.log("AskQuestionModal: Cleaning up on close");
      setQuestion("");
      setErrors({});
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!question.trim()) newErrors.question = "Question is required.";
    if (!(hasSubmitted || user)) {
      if (!name.trim()) newErrors.name = "Name is required.";
      if (!email.trim()) newErrors.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
      if (!phone.trim()) newErrors.phone = "Phone number is required.";
      else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
    }
    if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailPayload = (payload) => {
    const requiredFields = ["userEmail", "userName", "expertEmail", "expertName", "question", "userPhone"];
    const missingFields = requiredFields.filter((field) => !payload[field] || payload[field].trim() === "");
    return missingFields.length === 0 ? null : `Missing or empty fields: ${missingFields.join(", ")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AskQuestionModal: handleSubmit called:", { question, name, email, phone, expert });
    if (!validateForm()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "Questions"), {
        expertId: expert.id,
        expertName: expert.fullName || "Unknown Expert",
        expertEmail: expert.email || "no-email@placeholder.com",
        question,
        userName: name,
        userEmail: email,
        userPhone: phone,
        status: "pending",
        createdAt: new Date().toISOString(),
        reply: null,
      });

      // Save user data to localStorage after first submission
      if (!hasSubmitted && !user) {
        const userData = { name, email, phone, purpose: "General Query" };
        console.log("AskQuestionModal: Saving user data to localStorage:", userData);
        localStorage.setItem("userFormData", JSON.stringify(userData));
        setHasSubmitted(true);
      }

      if (expert.email && expert.email.trim() && /\S+@\S+\.\S+/.test(expert.email)) {
        const emailPayload = {
          userEmail: email,
          userName: name,
          expertEmail: expert.email,
          expertName: expert.fullName || "Unknown Expert",
          question,
          userPhone: phone,
        };

        console.log("AskQuestionModal: Email payload:", emailPayload);

        const validationError = validateEmailPayload(emailPayload);
        if (validationError) {
          throw new Error(validationError);
        }

        const response = await fetch("/api/send-question-emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to send emails: ${errorData.error || "Unknown error"}`);
        }
      } else {
        console.warn("AskQuestionModal: Skipping email sending due to missing or invalid expert.email:", expert.email);
        toast.warn("Question submitted, but expert email is missing or invalid. Notification not sent to expert.");
      }

      setQuestion("");
      if (!hasSubmitted && !user) {
        setName("");
        setEmail("");
        setPhone("");
      }
      setErrors({});

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("AskQuestionModal: Error submitting question:", error.message);
      toast.error(`Failed to submit question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-gray-900/30 to-black/30 flex items-center justify-center z-50">
      <div className="bg-transparent backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-lg relative border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-3xl font-bold bg-clip-text text-primary">
          Ask {expert?.fullName || "Expert"} a Question
        </h2>
        {success ? (
          <p className="text-green-400 text-center font-medium text-lg animate-pulse">
            Question submitted successfully! Closing...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`mt-1 p-4 w-full border rounded-xl bg-white/5 text-primary placeholder-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                  errors.question ? "border-red-500" : "border-white/20"
                }`}
                rows="5"
                placeholder="Type your question here..."
                required
              />
              {errors.question && (
                <p className="text-red-400 text-sm mt-2">{errors.question}</p>
              )}
            </div>
            {!(hasSubmitted || user) && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`p-4 w-full border rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 ${
                      errors.name ? "border-red-500" : "border-white/20"
                    }`}
                    placeholder="Enter your name"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-2">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`p-4 w-full border rounded-xl bg-white/5 text-primary placeholder-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                      errors.email ? "border-red-500" : "border-white/20"
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-2">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Phone Number
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={phone}
                    onChange={(phone) => setPhone(`+${phone}`)} // Ensure phone includes country code
                    placeholder="Enter phone number"
                    inputProps={{
                      id: "phone",
                      className: `w-full p-4 border rounded-xl bg-white/5 text-primary placeholder-white/50 focus:ring-2 focus:ring-primary focus:border-transparent pl-12 transition-all duration-300 ${
                        errors.phone ? "border-red-500" : "border-white/20"
                      }`,
                      required: true,
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-2">{errors.phone}</p>
                  )}
                </div>
              </>
            )}
            {errors.form && (
              <p className="text-red-400 text-sm mt-2">{errors.form}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-primary to-secondary text-primary p-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Question"}
            </button>
          </form>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}