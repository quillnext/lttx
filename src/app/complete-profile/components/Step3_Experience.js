
import dynamic from 'next/dynamic';
import Link from 'next/link';

const loadComponent = (importFn, name) =>
  dynamic(
    () =>
      importFn()
        .then((mod) => mod.default || mod)
        .catch((err) => {
          console.error(`Failed to load ${name}:`, err);
          return { default: () => <div className="text-red-500">Error loading {name} component.</div> };
        }),
    {
      ssr: false,
      loading: () => <div>Loading {name}...</div>,
    }
  );

const DatePicker = loadComponent(() => import("react-datepicker"), "DatePicker");

export default function Step3_Experience({
  formData,
  errors,
  handleExperienceChange,
  removeExperience,
  addExperience,
  handleChange,
  handleFile,
  removeFile,
  imagePreview,
  certificatePreviews,
  officePhotoPreviews,
  agreed,
  setAgreed,
  referralCodeStatus,
  profileId,
  setShowCropModal,
}) {
  const { profileType } = formData;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--primary)] mb-6 flex items-center gap-2">
        <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
        {profileType === 'expert' ? 'Experience & Details' : 'Agency Details'}
      </h2>

      {/* Row 1: Photo & Main Info */}
      <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Photo */}
          <div className="w-full lg:w-auto flex-shrink-0 flex flex-col items-center lg:items-start">
            <label className="block text-sm font-bold text-gray-700 mb-2">
            {profileType === 'expert' ? 'Profile Photo' : 'Agency Logo'} <span className="text-red-500">*</span>
            </label>
            <div className="relative w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 group">
                {imagePreview ? (
                    <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-gray-400 text-4xl">📷</span>
                )}
                {!profileId && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium">Change</span>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFile(e, 'photo')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    id="photo-upload"
                    disabled={!!profileId}
                />
            </div>
            {imagePreview && !profileId && (
                <button
                    type="button"
                    onClick={() => setShowCropModal(true)}
                    className="text-xs text-green-600 font-semibold hover:underline mt-2"
                >
                    Crop / Adjust
                </button>
            )}
            {errors.photo && <p className="text-xs text-red-600 mt-1 font-medium">{errors.photo}</p>}
          </div>

          {/* Tagline & About */}
          <div className="flex-1 space-y-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tagline <span className="text-red-500">*</span></label>
                <input
                type="text"
                name="tagline"
                placeholder="e.g., Expert in European Luxury Travel"
                className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none ${errors.tagline ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.tagline}
                onChange={handleChange}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{formData.tagline.length}/150</p>
                {errors.tagline && <p className="text-xs text-red-600 font-medium">{errors.tagline}</p>}
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                {profileType === 'expert' ? 'About Me' : 'About Agency'} <span className="text-red-500">*</span>
                </label>
                <textarea
                name="about"
                placeholder={profileType === 'expert' ? 'Briefly describe your experience and travel philosophy...' : 'Describe your agency history and mission...'}
                className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none ${errors.about ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.about}
                onChange={handleChange}
                rows={3}
                />
                {errors.about && <p className="text-xs text-red-600 mt-1 font-medium">{errors.about}</p>}
            </div>
          </div>
      </div>

      {profileType === 'expert' ? (
        <>
          {/* Experience */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
            <label className="block text-lg font-bold text-gray-800 mb-4">Work Experience <span className="text-red-500">*</span></label>
            {formData.experience.map((exp, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3 relative group">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="Title"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white"
                      value={exp.title}
                      onChange={e => handleExperienceChange(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="Company"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white"
                      value={exp.company}
                      onChange={e => handleExperienceChange(index, 'company', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                    <div className="w-full">
                        <DatePicker
                        selected={exp.startDate}
                        onChange={date => handleExperienceChange(index, 'startDate', date)}
                        dateFormat="yyyy-MM"
                        placeholderText="Select Month"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white"
                        maxDate={new Date()}
                        showMonthYearPicker
                        wrapperClassName="w-full"
                        />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-grow w-full">
                        <DatePicker
                            selected={exp.endDate === 'Present' ? null : exp.endDate}
                            onChange={date => handleExperienceChange(index, 'endDate', date)}
                            dateFormat="yyyy-MM"
                            placeholderText="Select Month"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white disabled:bg-gray-100"
                            maxDate={new Date()}
                            showMonthYearPicker
                            disabled={exp.endDate === 'Present'}
                            wrapperClassName="w-full"
                        />
                      </div>
                      <label className="flex items-center gap-1 cursor-pointer bg-gray-100 px-2 py-2 rounded-lg border border-gray-200 shrink-0">
                        <input
                          type="checkbox"
                          checked={exp.endDate === 'Present'}
                          onChange={e =>
                            handleExperienceChange(index, 'endDate', e.target.checked ? 'Present' : null)
                          }
                          className="accent-green-600"
                        />
                        <span className="text-xs font-medium">Present</span>
                      </label>
                    </div>
                  </div>
                </div>
                {formData.experience.length > 1 && (
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50 shadow-md border border-gray-200"
                    onClick={() => removeExperience(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="mt-2 w-full py-3 border-2 border-dashed border-green-200 bg-green-50 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition-colors"
            >
              + Add another experience
            </button>
            {errors.experience && <p className="text-xs text-red-600 mt-2 font-medium">{errors.experience}</p>}
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Certifications <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="certifications"
              placeholder="e.g., IATA, TIDS, Specialist Certifications"
              className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none ${errors.certifications ? 'border-red-500' : 'border-gray-200'}`}
              value={formData.certifications}
              onChange={handleChange}
            />
            {errors.certifications && <p className="text-xs text-red-600 mt-1 font-medium">{errors.certifications}</p>}
          </div>
        </>
      ) : (
        <>
          {/* Agency Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
             <div className="md:col-span-12">
                <label className="block text-sm font-bold text-gray-700 mb-1">Registered Address <span className="text-red-500">*</span></label>
                <input
                type="text"
                name="registeredAddress"
                placeholder="Full registered address..."
                className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none ${errors.registeredAddress ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.registeredAddress}
                onChange={handleChange}
                />
                {errors.registeredAddress && <p className="text-xs text-red-600 mt-1 font-medium">{errors.registeredAddress}</p>}
             </div>

             <div className="md:col-span-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Website</label>
                <input
                type="url"
                name="website"
                placeholder="https://agency.com"
                className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none ${errors.website ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.website}
                onChange={handleChange}
                />
                {errors.website && <p className="text-xs text-red-600 mt-1 font-medium">{errors.website}</p>}
             </div>

             <div className="md:col-span-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">No. of Employees <span className="text-red-500">*</span></label>
                <input
                type="number"
                name="employeeCount"
                className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none ${errors.employeeCount ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.employeeCount}
                onChange={handleChange}
                min="1"
                />
                {errors.employeeCount && <p className="text-xs text-red-600 mt-1 font-medium">{errors.employeeCount}</p>}
             </div>

             <div className="md:col-span-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">License (IATA/GST) <span className="text-red-500">*</span></label>
                <input
                type="text"
                name="licenseNumber"
                placeholder="Registration Number"
                className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none ${errors.licenseNumber ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.licenseNumber}
                onChange={handleChange}
                />
                {errors.licenseNumber && <p className="text-xs text-red-600 mt-1 font-medium">{errors.licenseNumber}</p>}
             </div>
          </div>

          {/* Uploads - Grouped in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Association Certificates (Optional)</label>
                <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Choose Files
                        <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={e => handleFile(e, 'certificates')}
                        className="hidden"
                        />
                    </label>
                    <span className="text-xs text-gray-400">{formData.certificates.length} files selected</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                    {certificatePreviews.map((preview, index) => (
                    <div key={index} className="relative w-14 h-14 border rounded-lg overflow-hidden group">
                        {preview.endsWith('.pdf') ? (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-xs text-gray-500 font-bold">PDF</div>
                        ) : (
                        <img src={preview} className="w-full h-full object-cover" alt="cert" />
                        )}
                        <button type="button" onClick={() => removeFile(index, 'certificates')} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs">✕</button>
                    </div>
                    ))}
                </div>
             </div>

             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Office Photos <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Choose Photos
                        <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => handleFile(e, 'officePhotos')}
                        className="hidden"
                        />
                    </label>
                    <span className="text-xs text-gray-400">{formData.officePhotos.length} photos selected</span>
                </div>
                 <div className="flex flex-wrap gap-2 mt-3">
                    {officePhotoPreviews.map((preview, index) => (
                    <div key={index} className="relative w-14 h-14 border rounded-lg overflow-hidden group">
                        <img src={preview} className="w-full h-full object-cover" alt="office" />
                        <button type="button" onClick={() => removeFile(index, 'officePhotos')} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs">✕</button>
                    </div>
                    ))}
                </div>
                {errors.officePhotos && <p className="text-xs text-red-600 mt-1 font-medium">{errors.officePhotos}</p>}
             </div>
          </div>
        </>
      )}

      {/* Referral */}
      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
        <label className="block text-sm font-bold text-purple-900 mb-2">Were you referred by someone?</label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="referred"
              value="Yes"
              checked={formData.referred === 'Yes'}
              onChange={handleChange}
              className="accent-purple-600"
            />
            <span className="text-sm font-medium">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="referred"
              value="No"
              checked={formData.referred === 'No'}
              onChange={handleChange}
              className="accent-purple-600"
            />
            <span className="text-sm font-medium">No</span>
          </label>
        </div>
        {formData.referred === 'Yes' && (
          <div>
            <input
              type="text"
              name="referralCode"
              placeholder="Enter referral code"
              className={`w-full px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-purple-500 outline-none ${errors.referralCode ? 'border-red-500' : 'border-purple-200'}`}
              value={formData.referralCode}
              onChange={handleChange}
            />
            {referralCodeStatus && (
              <p className={`text-xs mt-1 font-medium ${referralCodeStatus.includes('Invalid') ? 'text-red-600' : 'text-green-600'}`}>
                {referralCodeStatus}
              </p>
            )}
            {errors.referralCode && <p className="text-xs text-red-600 mt-1 font-medium">{errors.referralCode}</p>}
          </div>
        )}
        {errors.referred && <p className="text-xs text-red-600 mt-1 font-medium">{errors.referred}</p>}
      </div>

      {/* Terms Agreement */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 accent-[var(--primary)] cursor-pointer"
          />
         <span className="text-sm text-gray-600 leading-snug">
            I confirm that the information provided is accurate and complies with{' '}
            <strong>Xmytravel Experts'</strong> professional and ethical standards. I also agree to the{' '}
            <Link
              href="/privacy-policy"
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
            >Privacy Policy</Link>.
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-red-600 mt-2 font-medium ml-8">{errors.agreed}</p>}
      </div>
    </div>
  );
}
