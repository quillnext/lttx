"use client";

import { useState } from "react";

export default function EditProfileForm({ initialData, onSave }) {
  const [formData, setFormData] = useState({ ...initialData });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFormData((prev) => ({ ...prev, regions: options }));
  };

  const handleFile = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleArrayChange = (index, key, value) => {
    const updated = [...formData[key]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [key]: updated }));
  };

  const addField = (key) => {
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const removeField = (key, index) => {
    const updated = formData[key].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [key]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-5xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-[#36013F] mb-8 font-serif">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            "fullName",
            "email",
            "phone",
            "tagline",
            "location",
            "languages",
            "responseTime",
            "pricing",
          ].map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label htmlFor={field} className="text-sm font-medium text-gray-700 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="input px-4 py-3 border rounded-xl w-full"
              />
            </div>
          ))}
          <div className="col-span-full">
            <label className="text-sm font-medium text-gray-700">Profile Photo</label>
            <input type="file" onChange={handleFile} className="file-input mt-1 px-4 py-3 border rounded-xl w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="about" className="text-sm font-medium text-gray-700">About Me</label>
          <textarea name="about" id="about" value={formData.about} onChange={handleChange} className="textarea px-4 py-3 border rounded-xl w-full"></textarea>
        </div>

        <div>
          <label className="section-label">Services</label>
          {formData.services.map((s, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                value={s}
                onChange={(e) => handleArrayChange(i, "services", e.target.value)}
                className="input flex-grow px-4 py-3 border rounded-xl w-full"
              />
              <button type="button" onClick={() => removeField("services", i)} className="text-red-500">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => addField("services")} className="text-sm text-blue-600 mt-2">+ Add Service</button>
        </div>

        <div>
          <label className="section-label">Regions</label>
          <select multiple value={formData.regions} onChange={handleMultiChange} className="select px-4 py-3 border rounded-xl w-full">
             <option value="south-asia">South Asia</option>
                  <option value="southeast-asia">Southeast Asia</option>
                  <option value="east-asia">East Asia</option>
                  <option value="central-asia">Central Asia</option>
                  <option value="west-asia">West Asia</option>
                  <option value="north-africa">North Africa</option>
                  <option value="west-africa">West Africa</option>
                  <option value="east-africa">East Africa</option>
                  <option value="central-africa">Central Africa</option>
                  <option value="southern-africa">Southern Africa</option>
                  <option value="north-america">North America</option>
                  <option value="central-america">Central America</option>
                  <option value="caribbean">Caribbean</option>
                  <option value="south-america">South America</option>
                  <option value="western-europe">Western Europe</option>
                  <option value="eastern-europe">Eastern Europe</option>
                  <option value="northern-europe">Northern Europe</option>
                  <option value="southern-europe">Southern Europe</option>
                  <option value="australia-nz">Australia & New Zealand</option>
                  <option value="pacific-islands">Pacific Islands</option>
                  <option value="mena">MENA</option>
                  <option value="emea">EMEA</option>
                  <option value="apac">APAC</option>
                  <option value="latam">LATAM</option>
          </select>
        </div>

        <div>
          <label className="section-label">Experience</label>
          {formData.experience.map((exp, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                value={exp}
                onChange={(e) => handleArrayChange(i, "experience", e.target.value)}
                className="input flex-grow px-4 py-3 border rounded-xl w-full "
              />
              <button type="button" onClick={() => removeField("experience", i)} className="text-red-500">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => addField("experience")} className="text-sm text-blue-600 mt-2">+ Add Experience</button>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="companies" className="text-sm font-medium text-gray-700">Companies</label>
          <input name="companies" id="companies" value={formData.companies} onChange={handleChange} className="input px-4 py-3 border rounded-xl w-full" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="certifications" className="text-sm font-medium text-gray-700">Certifications</label>
          <input name="certifications" id="certifications" value={formData.certifications} onChange={handleChange} className="input px-4 py-3 border rounded-xl w-full" />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-[#36013F] hover:bg-[#4b1760] text-white px-6 py-3 rounded-xl font-semibold">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .input {
          @apply border border-gray-300 p-3 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F4D35E];
        }
        .textarea {
          @apply border border-gray-300 p-3 rounded-xl w-full text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#F4D35E];
        }
        .select {
          @apply border border-gray-300 p-3 rounded-xl w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F4D35E];
        }
        .file-input {
          @apply border border-gray-300 p-2 rounded-xl w-full text-sm;
        }
        .section-label {
          @apply block mb-2 text-sm font-semibold text-gray-800;
        }
      `}</style>
    </div>
  );
}