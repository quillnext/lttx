// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// export default function AdminLogin() {
//   const [credentials, setCredentials] = useState({ userId: "", password: "" });
//   const [error, setError] = useState("");
//   const router = useRouter();

//   const handleChange = (e) => {
//     setCredentials({ ...credentials, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validUser = credentials.userId === process.env.NEXT_PUBLIC_ADMIN_USER;
//     const validPass = credentials.password === process.env.NEXT_PUBLIC_ADMIN_PASS;

//     if (validUser && validPass) {
//       const res = await fetch("/api/login", { method: "POST" });
//       if (res.ok) {
//         router.push("/dashboard/profiles");
//       } else {
//         setError("Server error. Please try again.");
//       }
//     } else {
//       setError("Invalid User ID or Password");
//     }
//   };

//   return (
//     <div className="flex justify-center items-center h-screen bg-[#F4D35E] px-4">
//      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-t-8 border-[#36013F]">
//   <div className="flex justify-center mb-6">
//     <Image
//             src="/dashboardlogo.svg"
//             alt="Xmytravel Logo"
//             width={160}
//             height={40}
//             priority
//           />
//   </div>
//   <h2 className="text-2xl font-bold text-center text-[#36013F] mb-4">Admin Login</h2>
//   {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}


//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <input
//               type="text"
//               name="userId"
//               placeholder="User ID"
//               value={credentials.userId}
//               onChange={handleChange}
//               className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
//               required
//             />
//           </div>

//           <div>
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={credentials.password}
//               onChange={handleChange}
//               className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-[#36013F] hover:bg-[#4a1a5f] text-white py-3 rounded-xl font-semibold transition"
//           >
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ userId: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const validUser = credentials.userId === process.env.NEXT_PUBLIC_ADMIN_USER;
      const validPass = credentials.password === process.env.NEXT_PUBLIC_ADMIN_PASS;

      if (validUser && validPass) {
        const res = await fetch("/api/login", { method: "POST" });
        if (res.ok) {
          router.push("/dashboard/profiles");
        } else {
          setError("Server error. Please try again.");
        }
      } else {
        setError("Invalid User ID or Password");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#F4D35E] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-t-8 border-[#36013F]">
        <div className="flex justify-center mb-6">
          <Image
            src="/dashboardlogo.svg"
            alt="Xmytravel Logo"
            width={160}
            height={40}
            priority
          />
        </div>
        <h2 className="text-2xl font-bold text-center text-[#36013F] mb-4">Admin Login</h2>
        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="userId"
              placeholder="User ID"
              value={credentials.userId}
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#36013F] hover:bg-[#4a1a5f] text-white py-3 rounded-xl font-semibold transition flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}