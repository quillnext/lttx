'use client'
import React, { useState } from 'react';

export default function JoinUsSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    resume: null,
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Log form data to console (backend to be implemented later)
      console.log('Form Submitted:', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        resume: formData.resume ? formData.resume.name : 'No resume uploaded',
      });

      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        resume: null,
      });
    } catch (error) {
      alert('Submission failed. Try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-[#F4D35E] w-full rounded-3xl shadow-lg md:p-10 text-[#36013F] p-6 mb-20" id="join-us" >
      <div className="text-center mb-8 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-primary mb-4">
          Join Us
        </h2>
        <p className="text-primary">
          Whether you’re a traveler seeking truth or a professional ready to share it — Xmytravel is your platform.
        </p>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#36013F] bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-2 w-[300px]">Success!</h3>
            <p className="text-gray-700">Your form has been submitted.</p>
            <button
              className="mt-4 px-6 py-2 bg-[#36013F] text-white rounded-full hover:bg-[#4e1a60] transition"
              onClick={() => setShowSuccess(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid space-y-4 md:gap-x-4 md:grid-cols-2 grid-cols-1 items-start px-0 md:px-10">
        <input
          name="name"
          type="text"
          required
          placeholder="Full Name:"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email Address:"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password:"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        />
        <select
          name="role"
          required
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        >
          <option value="" disabled>
            Who are you?
          </option>
          <option value="Traveler">Traveler</option>
          <option value="Expert">Expert</option>
        </select>
        <input
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2"
        />
        <p className="text-primary text-sm col-span-2">
          Optional: Upload Resume (for Experts)
        </p>

        <div className="col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-10 py-3 rounded-full font-medium transition ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-[#36013F] text-white hover:bg-[#4e1a60]'
            }`}
          >
            {loading ? 'Submitting...' : 'Sign Up Now'}
          </button>
        </div>
      </form>
    </div>
  );
}