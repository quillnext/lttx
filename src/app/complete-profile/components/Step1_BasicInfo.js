
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

export default function Step1_BasicInfo({
  formData,
  errors,
  handleChange,
  handleSingleChange,
  handleMultiChange,
  cityOptions,
  setCityOptions,
  languageOptions,
  usernameStatus,
  profileId,
  fetchLeadByPhone,
  setFormData,
  setErrors,
  setApiError
}) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="block text-lg font-semibold text-gray-800 mb-3">What type of profile are you creating?</h3>
        <div className="flex border border-gray-300 rounded-xl p-1 bg-gray-100">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, profileType: 'expert' }))}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
              formData.profileType === 'expert' ? 'bg-white shadow text-[var(--primary)]' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Individual Expert
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, profileType: 'agency' }))}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
              formData.profileType === 'agency' ? 'bg-white shadow text-[var(--primary)]' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Travel Agency
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-[var(--primary)]">👤 Basic Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <PhoneInput
            country={"in"}
            value={formData.phone}
            onChange={phone => {
              setFormData(prev => ({ ...prev, phone }));
              fetchLeadByPhone(phone);
            }}
            placeholder="Enter phone number (e.g., +91 9876543210)"
            inputProps={{
              id: 'phone',
              className: `w-full p-3 px-12 border rounded-xl bg-white ${errors.phone ? 'border-red-500' : ''}`,
              required: true,
              autoFocus: false,
            }}
          />
          {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
        </div>
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter username (e.g., travelwithjohn)"
            className={`w-full px-4 py-3 border rounded-xl ${errors.username ? 'border-red-500' : ''}`}
            value={formData.username}
            onChange={handleChange}
            disabled={!!profileId}
          />
          {usernameStatus && (
            <p className={`text-sm mt-1 ${usernameStatus.includes('available') ? 'text-green-600' : 'text-red-600'}`}>
              {usernameStatus}
            </p>
          )}
          {errors.username && errors.username !== 'Username is already taken' && (
            <p className="text-sm text-red-600 mt-1">{errors.username}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">e.g., travelwithjohn</p>
        </div>
        {/* Full Name / Agency Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{formData.profileType === 'expert' ? 'Full Name' : 'Agency Name'}</label>
          <input
            type="text"
            name="fullName"
            placeholder={formData.profileType === 'expert' ? "Enter full name (e.g., John Doe)" : "Enter agency name"}
            className={`w-full px-4 py-3 border rounded-xl ${errors.fullName ? 'border-red-500' : ''}`}
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email (e.g., john@example.com)"
            className={`w-full px-4 py-3 border rounded-xl ${errors.email ? 'border-red-500' : ''}`}
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>
        {/* Date of Birth or Years Active */}
        {formData.profileType === 'expert' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <DatePicker
              selected={formData.dateOfBirth}
              onChange={date => {
                setFormData(prev => ({ ...prev, dateOfBirth: date }));
                setErrors(prev => ({ ...prev, dateOfBirth: '' }));
              }}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select date of birth (YYYY-MM-DD)"
              className={`w-full px-4 py-3 border rounded-xl ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              maxDate={new Date()}
              showYearDropdown
              yearDropdownItemNumber={100}
              scrollableYearDropdown
            />
            {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years Active</label>
            <input
              type="text"
              name="yearsActive"
              placeholder="e.g., 5+ years"
              className={`w-full px-4 py-3 border rounded-xl ${errors.yearsActive ? 'border-red-500' : ''}`}
              value={formData.yearsActive}
              onChange={handleChange}
            />
            {errors.yearsActive && <p className="text-sm text-red-600 mt-1">{errors.yearsActive}</p>}
          </div>
        )}
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <Select
            instanceId="location-select"
            options={cityOptions}
            value={cityOptions.find(option => option.value === formData.location) || null}
            onChange={selected => handleSingleChange(selected, 'location')}
            placeholder="Select a location (e.g., Mumbai, India)"
            className={`w-full ${errors.location ? 'border-red-500' : ''}`}
            classNamePrefix="react-select"
            isDisabled={cityOptions.length === 0}
            isSearchable={true}
            onInputChange={inputValue => {
              if (inputValue) {
                fetch(`/api/cities?search=${encodeURIComponent(inputValue)}`)
                  .then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch cities: ${res.status}`);
                    return res.json();
                  })
                  .then(data => {
                    const sortedCities = data.sort((a, b) => {
                      const isAIndia = a.country === 'India';
                      const isBIndia = b.country === 'India';
                      if (isAIndia && !isBIndia) return -1;
                      if (!isAIndia && isBIndia) return 1;
                      if (isAIndia && isBIndia) {
                        const cityA = a.label.replace(', India', '');
                        const cityB = b.label.replace(', India', '');
                        return cityA.localeCompare(cityB);
                      }
                      return a.label.localeCompare(b.label);
                    });
                    setCityOptions(sortedCities);
                  })
                  .catch(err => {
                    console.error('Error fetching cities:', err);
                    setApiError('Failed to fetch city options. Please try again.');
                  });
              }
            }}
          />
          {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
        </div>
        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
          <Select
            instanceId="language-select"
            isMulti
            options={languageOptions}
            value={languageOptions.filter(option => formData.languages.includes(option.value))}
            onChange={selected => handleMultiChange(selected, 'languages')}
            placeholder="Select up to 5 languages (e.g., English, Hindi)"
            className={`w-full ${errors.languages ? 'border-red-500' : ''}`}
            classNamePrefix="react-select"
            isDisabled={languageOptions.length === 0}
          />
          {errors.languages && <p className="text-sm text-red-600 mt-1">{errors.languages}</p>}
        </div>
        {/* Response Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
          <input
            type="text"
            name="responseTime"
            placeholder="Enter response time (e.g., Within 12 hours)"
            className={`w-full px-4 py-3 border rounded-xl ${errors.responseTime ? 'border-red-500' : ''}`}
            value={formData.responseTime}
            onChange={handleChange}
          />
          {errors.responseTime && <p className="text-sm text-red-600 mt-1">{errors.responseTime}</p>}
        </div>
        {/* Pricing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pricing</label>
          <input
            type="text"
            name="pricing"
            placeholder="Enter pricing (e.g., ₹2000/session)"
            className={`w-full px-4 py-3 border rounded-xl ${errors.pricing ? 'border-red-500' : ''}`}
            value={formData.pricing}
            onChange={handleChange}
          />
          {errors.pricing && <p className="text-sm text-red-600 mt-1">{errors.pricing}</p>}
        </div>
      </div>
    </div>
  )
}
