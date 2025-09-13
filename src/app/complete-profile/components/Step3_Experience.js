import dynamic from 'next/dynamic';
import Link from 'next/link';

const loadComponent = (importFn, name) =>
  dynamic(
    () =>
      importFn()
        .then((mod) => mod.default || mod)
        .catch((err) => {
          console.error(`Failed to load ${name}:`, err);
          return { default: () => <div className="text-red-500">Error loading ${name} component.</div> };
        }),
    {
      ssr: false,
      loading: () => <div>Loading ${name}...</div>,
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
      <h2 className="text-2xl font-semibold text-[var(--primary)]">
        {profileType === 'expert' ? '📜 Experience & Certifications' : '📜 Agency Details & Certifications'}
      </h2>

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {profileType === 'expert' ? 'Profile Photo' : 'Agency Logo'}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={e => handleFile(e, 'photo')}
            className="w-full px-4 py-2 border rounded-xl"
            id="photo-upload"
            disabled={!!profileId}
          />
          {imagePreview && (
            <div className="relative w-20 h-20">
              <img
                src={imagePreview}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-full"
              />
              {!profileId && (
                <button
                  type="button"
                  onClick={() => setShowCropModal(true)}
                  className="absolute top-0 right-0 bg-[var(--primary)] text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ✎
                </button>
              )}
            </div>
          )}
        </div>
        {errors.photo && <p className="text-sm text-red-600 mt-1">{errors.photo}</p>}
      </div>

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input
          type="text"
          name="tagline"
          placeholder="Enter a catchy tagline (e.g., Your Journey, Our Expertise)"
          className={`w-full px-4 py-3 border rounded-xl ${errors.tagline ? 'border-red-500' : ''}`}
          value={formData.tagline}
          onChange={handleChange}
        />
        <p className="text-sm text-gray-500 mt-1">Max 150 characters</p>
        {errors.tagline && <p className="text-sm text-red-600 mt-1">{errors.tagline}</p>}
      </div>

      {/* About */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {profileType === 'expert' ? 'About Me' : 'About Agency'}
        </label>
        <textarea
          name="about"
          placeholder={profileType === 'expert' ? 'Tell us about yourself and your experience' : 'Describe your agency and its mission'}
          className={`w-full px-4 py-3 border rounded-xl ${errors.about ? 'border-red-500' : ''}`}
          value={formData.about}
          onChange={handleChange}
          rows={4}
        />
        {errors.about && <p className="text-sm text-red-600 mt-1">{errors.about}</p>}
      </div>

      {profileType === 'expert' ? (
        <>
          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
            {formData.experience.map((exp, index) => (
              <div key={index} className="border p-4 rounded-xl mb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Travel Consultant"
                      className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                      value={exp.title}
                      onChange={e => handleExperienceChange(index, 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="e.g., ABC Travel Agency"
                      className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                      value={exp.company}
                      onChange={e => handleExperienceChange(index, 'company', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <DatePicker
                      selected={exp.startDate}
                      onChange={date => handleExperienceChange(index, 'startDate', date)}
                      dateFormat="yyyy-MM"
                      placeholderText="Select start date (YYYY-MM)"
                      className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                      maxDate={new Date()}
                      showMonthYearPicker
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        selected={exp.endDate === 'Present' ? null : exp.endDate}
                        onChange={date => handleExperienceChange(index, 'endDate', date)}
                        dateFormat="yyyy-MM"
                        placeholderText="Select end date (YYYY-MM)"
                        className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                        maxDate={new Date()}
                        showMonthYearPicker
                        disabled={exp.endDate === 'Present'}
                      />
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={exp.endDate === 'Present'}
                          onChange={e =>
                            handleExperienceChange(index, 'endDate', e.target.checked ? 'Present' : null)
                          }
                        />
                        <span className="text-sm">Present</span>
                      </label>
                    </div>
                  </div>
                </div>
                {formData.experience.length > 1 && (
                  <button
                    type="button"
                    className="text-red-500 text-sm hover:text-red-700"
                    onClick={() => removeExperience(index)}
                  >
                    Remove Experience
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="text-sm text-[var(--primary)] hover:text-gray-800"
            >
              + Add another experience
            </button>
            {errors.experience && <p className="text-sm text-red-600 mt-1">{errors.experience}</p>}
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
            <textarea
              name="certifications"
              placeholder="List your certifications (e.g., IATA, TIDS)"
              className={`w-full px-4 py-3 border rounded-xl ${errors.certifications ? 'border-red-500' : ''}`}
              value={formData.certifications}
              onChange={handleChange}
              rows={3}
            />
            {errors.certifications && <p className="text-sm text-red-600 mt-1">{errors.certifications}</p>}
          </div>
        </>
      ) : (
        <>
          {/* Registered Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
            <textarea
              name="registeredAddress"
              placeholder="Enter registered address of the agency"
              className={`w-full px-4 py-3 border rounded-xl ${errors.registeredAddress ? 'border-red-500' : ''}`}
              value={formData.registeredAddress}
              onChange={handleChange}
              rows={3}
            />
            {errors.registeredAddress && <p className="text-sm text-red-600 mt-1">{errors.registeredAddress}</p>}
          </div>

          {/* Website (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website (Optional)</label>
            <input
              type="url"
              name="website"
              placeholder="Enter agency website (e.g., https://example.com)"
              className={`w-full px-4 py-3 border rounded-xl ${errors.website ? 'border-red-500' : ''}`}
              value={formData.website}
              onChange={handleChange}
            />
            {errors.website && <p className="text-sm text-red-600 mt-1">{errors.website}</p>}
          </div>

          {/* Number of Employees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
            <input
              type="number"
              name="employeeCount"
              placeholder="Enter number of employees"
              className={`w-full px-4 py-3 border rounded-xl ${errors.employeeCount ? 'border-red-500' : ''}`}
              value={formData.employeeCount}
              onChange={handleChange}
              min="1"
            />
            {errors.employeeCount && <p className="text-sm text-red-600 mt-1">{errors.employeeCount}</p>}
          </div>

          {/* License Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              placeholder="Enter agency license number"
              className={`w-full px-4 py-3 border rounded-xl ${errors.licenseNumber ? 'border-red-500' : ''}`}
              value={formData.licenseNumber}
              onChange={handleChange}
            />
            {errors.licenseNumber && <p className="text-sm text-red-600 mt-1">{errors.licenseNumber}</p>}
          </div>

          {/* Association Membership Certificates (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Association Membership Certificates (Optional, up to 5)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={e => handleFile(e, 'certificates')}
              className="w-full px-4 py-2 border rounded-xl"
            />
            {certificatePreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {certificatePreviews.map((preview, index) => (
                  <div key={index} className="relative w-20 h-20">
                    {preview.endsWith('.pdf') ? (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                        <span className="text-sm text-gray-600">PDF</span>
                      </div>
                    ) : (
                      <img
                        src={preview}
                        alt={`Certificate ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index, 'certificates')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.certificates && <p className="text-sm text-red-600 mt-1">{errors.certificates}</p>}
          </div>

          {/* Office/Establishment Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office/Establishment Photos (up to 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleFile(e, 'officePhotos')}
              className="w-full px-4 py-2 border rounded-xl"
            />
            {officePhotoPreviews.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {officePhotoPreviews.map((preview, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={preview}
                      alt={`Office Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index, 'officePhotos')}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.officePhotos && <p className="text-sm text-red-600 mt-1">{errors.officePhotos}</p>}
          </div>
        </>
      )}

      {/* Referral */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Were you referred by someone?</label>
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="referred"
              value="Yes"
              checked={formData.referred === 'Yes'}
              onChange={handleChange}
            />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="referred"
              value="No"
              checked={formData.referred === 'No'}
              onChange={handleChange}
            />
            No
          </label>
        </div>
        {formData.referred === 'Yes' && (
          <div>
            <input
              type="text"
              name="referralCode"
              placeholder="Enter referral code"
              className={`w-full px-4 py-3 border rounded-xl ${errors.referralCode ? 'border-red-500' : ''}`}
              value={formData.referralCode}
              onChange={handleChange}
            />
            {referralCodeStatus && (
              <p className={`text-sm mt-1 ${referralCodeStatus.includes('Invalid') ? 'text-red-600' : 'text-green-600'}`}>
                {referralCodeStatus}
              </p>
            )}
            {errors.referralCode && <p className="text-sm text-red-600 mt-1">{errors.referralCode}</p>}
          </div>
        )}
        {errors.referred && <p className="text-sm text-red-600 mt-1">{errors.referred}</p>}
      </div>

      {/* Terms Agreement */}
      <div className="pt-4 border-t">
         <label className="block text-sm font-medium text-gray-700 mb-1">Final Declaration</label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="h-4 w-4"
          />
         <span>
            I confirm that the information provided is accurate and complies with{' '}
            <strong>Xmytravel Experts'</strong> professional and ethical standards. I also agree to the{' '}
            <Link
              href="/privacy-policy"
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
            >Privacy Policy</Link>
          </span>
        </label>
        {errors.agreed && <p className="text-sm text-red-600 mt-1">{errors.agreed}</p>}
      </div>
    </div>
  );
}