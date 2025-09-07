
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from 'next/link';

export default function Step3_Experience({
  formData,
  errors,
  handleExperienceChange,
  removeExperience,
  addExperience,
  handleChange,
  handleFile,
  imagePreview,
  agreed,
  setAgreed,
  referralCodeStatus,
  setShowCropModal
}) {
  const { profileType } = formData;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--primary)]">
        {profileType === 'expert' ? '📚 Experience & Credentials' : '🏢 Trust & Credentials'}
      </h2>
      
      {profileType === 'expert' ? (
        <>
          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
            {formData.experience.map((exp, index) => (
              <div key={index} className="space-y-2 mb-4 border p-4 rounded-xl bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Enter job title (e.g., Travel Consultant)"
                      className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                      value={exp.title}
                      onChange={e => handleExperienceChange(index, 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Enter company (e.g., MakeMyTrip)"
                      className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                      value={exp.company}
                      onChange={e => handleExperienceChange(index, 'company', e.target.value)}
                    />
                  </div>
                  <div>
                    <DatePicker
                      selected={exp.startDate}
                      onChange={date => handleExperienceChange(index, 'startDate', date)}
                      dateFormat="yyyy-MM"
                      placeholderText="Select start date (YYYY-MM)"
                      className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                      maxDate={new Date()}
                      showMonthYearPicker
                    />
                    <p className="text-sm text-gray-500 mt-1">e.g., 2020-01</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DatePicker
                      selected={exp.endDate !== 'Present' ? exp.endDate : null}
                      onChange={date => handleExperienceChange(index, 'endDate', date)}
                      dateFormat="yyyy-MM"
                      placeholderText="Select end date (YYYY-MM)"
                      className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                      maxDate={new Date()}
                      showMonthYearPicker
                      disabled={exp.endDate === 'Present'}
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={exp.endDate === 'Present'}
                        onChange={e => handleExperienceChange(index, 'endDate', e.target.checked ? 'Present' : null)}
                      />
                      Present
                    </label>
                  </div>
                </div>
                 {formData.experience.length > 1 && (
                    <button
                        type="button"
                        className="text-red-500 text-sm hover:text-red-700"
                        onClick={() => removeExperience(index)}
                    >
                        ✕ Remove
                    </button>
                 )}
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="text-sm text-[var(--primary)] hover:underline mt-2"
            >
              + Add Experience
            </button>
            {errors.experience && <p className="text-sm text-red-600 mt-1">{errors.experience}</p>}
          </div>
          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
            <input
              type="text"
              name="certifications"
              className={`w-full px-4 py-2 border rounded-xl ${errors.certifications ? 'border-red-500' : ''}`}
              placeholder="Enter certifications (e.g., Aussie Specialist, VisitBritain)"
              value={formData.certifications}
              onChange={handleChange}
            />
            {errors.certifications && <p className="text-sm text-red-600 mt-1">{errors.certifications}</p>}
            <p className="text-sm text-gray-500 mt-1">e.g., Aussie Specialist, VisitBritain, Fremden Visa Coach</p>
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Licence / IATA / GST No. (if any)</label>
          <input
            type="text"
            name="licenseNumber"
            className={`w-full px-4 py-2 border rounded-xl ${errors.licenseNumber ? 'border-red-500' : ''}`}
            placeholder="Enter your agency's registration number"
            value={formData.licenseNumber}
            onChange={handleChange}
          />
          {errors.licenseNumber && <p className="text-sm text-red-600 mt-1">{errors.licenseNumber}</p>}
          <p className="text-sm text-gray-500 mt-1">Providing this enhances trust with travelers.</p>
        </div>
      )}

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
        <input
          type="text"
          name="tagline"
          placeholder={profileType === 'expert' ? "Enter tagline (e.g., Europe Travel Expert)" : "Enter agency tagline (e.g., Crafting Unforgettable Journeys)"}
          className={`w-full px-4 py-3 border rounded-xl ${errors.tagline ? 'border-red-500' : ''}`}
          value={formData.tagline}
          onChange={handleChange}
          maxLength={150}
        />
        <p className="text-sm text-gray-500 mt-1">(max 150 characters)</p>
        {errors.tagline && <p className="text-sm text-red-600 mt-1">{errors.tagline}</p>}
      </div>

      {/* About Me / Us */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{profileType === 'expert' ? 'About Me' : 'About Us'}</label>
        <textarea
          placeholder={profileType === 'expert' ? "e.g., 10+ years guiding travellers across Europe" : "e.g., We are a boutique travel agency specializing in..."}
          className={`w-full px-4 py-3 border rounded-xl ${errors.about ? 'border-red-500' : ''}`}
          rows="4"
          name="about"
          value={formData.about}
          onChange={handleChange}
        ></textarea>
        {errors.about && <p className="text-sm text-red-600 mt-1">{errors.about}</p>}
        <p className="text-sm text-gray-500 mt-1">Provide a brief overview of your expertise and experience.</p>
      </div>

      {/* Photo / Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{profileType === 'expert' ? 'Upload Profile Photo' : 'Upload Agency Logo'}</label>
        <input
          type="file"
          className={`w-full border rounded-xl px-4 py-2 ${errors.photo ? 'border-red-500' : ''}`}
          onChange={handleFile}
          accept="image/jpeg,image/png"
        />
        {errors.photo && <p className="text-sm text-red-600 mt-1">{errors.photo}</p>}
        <p className="text-sm text-gray-500 mt-1">Upload a professional photo or logo (JPG, PNG)</p>
        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--primary)]">
              <img
                src={imagePreview}
                alt="Profile photo preview"
                className="object-cover w-full h-full"
              />
            </div>
            <button
              type="button"
              className="mt-2 text-sm text-[var(--primary)] hover:underline"
              onClick={() => setShowCropModal(true)}
            >
              Edit Crop
            </button>
          </div>
        )}
      </div>

      {/* Referral */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">Referral Information</label>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Were you referred by someone?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="referred"
                value="Yes"
                checked={formData.referred === 'Yes'}
                onChange={handleChange}
                className={`${errors.referred ? 'ring-2 ring-red-500' : ''}`}
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
                className={`${errors.referred ? 'ring-2 ring-red-500' : ''}`}
              />
              No
            </label>
          </div>
          {errors.referred && <p className="text-sm text-red-600 mt-1">{errors.referred}</p>}
        </div>
        {formData.referred === 'Yes' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
            <input
              type="text"
              name="referralCode"
              placeholder="Enter referral code"
              className={`w-full px-4 py-2 border rounded-xl ${errors.referralCode ? 'border-red-500' : ''}`}
              value={formData.referralCode}
              onChange={handleChange}
            />
            {referralCodeStatus && (
              <p className={`text-sm mt-1 ${referralCodeStatus.includes('Referred by') ? 'text-green-600' : 'text-red-600'}`}>
                {referralCodeStatus}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              A verification call might be made to your referrer to confirm your recommendation.
            </p>
            {errors.referralCode && errors.referralCode !== 'Invalid referral code' && (
              <p className="text-sm text-red-600 mt-1">{errors.referralCode}</p>
            )}
          </div>
        )}
        {formData.referred === 'No' && (
          <p className="text-sm text-gray-700 mt-2">
            Your profile approval may take a little longer. A short interview might be scheduled before activation.
          </p>
        )}
      </div>
      {/* Declaration */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">Final Declaration</label>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className={`mt-1 ${errors.agreed ? 'ring-2 ring-red-500' : ''}`}
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
          />
          <span>
            I confirm that the information provided is accurate and complies with{' '}
            <strong>Xmytravel Experts'</strong> professional and ethical standards. I also agree to the{' '}
            <Link
              href="/privacy-policy"
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.agreed && <p className="text-sm text-red-600 mt-1">{errors.agreed}</p>}
      </div>
    </div>
  )
}
