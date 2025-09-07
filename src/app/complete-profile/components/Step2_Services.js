
import dynamic from 'next/dynamic';

const loadComponent = (importFn, name) =>
  dynamic(
    () =>
      importFn().catch((err) => {
        console.error(`Failed to load ${name}:`, err);
        return () => <div className="text-red-500">Error loading {name} component.</div>;
      }),
    {
      ssr: false,
      loading: () => <div>Loading {name}...</div>,
    }
  );

const CreatableSelect = loadComponent(() => import('react-select/creatable'), 'CreatableSelect');

const expertiseOptions = [
  { value: 'Visa and Documentation Services', label: 'Visa and Documentation Services' },
  { value: 'Air/Flight Ticketing and Management', label: 'Air/Flight Ticketing and Management' },
  { value: 'Transfer and Car Rentals', label: 'Transfer and Car Rentals' },
  { value: 'Holiday Packages', label: 'Holiday Packages' },
  { value: 'Hotel Bookings', label: 'Hotel Bookings' },
  { value: 'MICE Logistics Arrangements', label: 'MICE Logistics Arrangements' },
  { value: 'FRRO Assistance', label: 'FRRO Assistance' },
  { value: 'Luxury Cruise Trip Planning', label: 'Luxury Cruise Trip Planning' },
];

export default function Step2_Services({
  formData,
  errors,
  setFormData,
  setErrors,
  handleArrayChange,
  removeField,
  addField,
  selectedExpertise,
  handleExpertiseChange,
  handleExpertiseKeyDown,
  addExpertise,
  removeExpertise,
}) {
  const { profileType } = formData;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--primary)]">
        {profileType === 'expert' ? '🎯 Services, Expertise & Regions' : '🎯 Services & Specialisations'}
      </h2>
      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {profileType === 'expert' ? 'What I Can Help You With' : 'Services Offered (e.g., Honeymoon, Visa Assistance)'}
        </label>
        {formData.services.map((service, index) => (
          <div key={index} className="flex gap-2 items-center mb-2">
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-xl ${errors.services ? 'border-red-500' : ''}`}
              placeholder="Enter service (e.g., Visa Documentation)"
              value={service}
              onChange={e => handleArrayChange(index, 'services', e.target.value)}
            />
            {formData.services.length > 1 && (
               <button
                type="button"
                className="text-red-500 text-sm hover:text-red-700"
                onClick={() => removeField('services', index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField('services')}
          className="text-sm text-[var(--primary)] hover:underline mt-2"
        >
          + Add More
        </button>
        {errors.services && <p className="text-sm text-red-600 mt-1">{errors.services}</p>}
      </div>
      {/* Expertise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {profileType === 'expert' ? 'Expertise Areas (Up to 5)' : 'Specialisations (Up to 5)'}
        </label>
        <div className="flex gap-2 mb-2">
          <CreatableSelect
            instanceId="expertise-select"
            options={expertiseOptions}
            value={selectedExpertise}
            onChange={handleExpertiseChange}
            onKeyDown={handleExpertiseKeyDown}
            placeholder="Select or type expertise (e.g., Adventure Travel)"
            className={`w-full ${errors.expertise ? 'border-red-500' : ''}`}
            classNamePrefix="react-select"
            formatCreateLabel={inputValue => `Add "${inputValue}"`}
          />
          <button
            type="button"
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl cursor-pointer"
            onClick={addExpertise}
            disabled={!selectedExpertise}
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.expertise.map(exp => (
            <span
              key={exp}
              className="bg-[var(--primary)] text-white px-2 py-1 rounded-full text-sm flex items-center"
            >
              {exp}
              <button type="button" className="ml-2 text-white" onClick={() => removeExpertise(exp)}>
                ✕
              </button>
            </span>
          ))}
        </div>
        {errors.expertise && <p className="text-sm text-red-600 mt-1">{errors.expertise}</p>}
      </div>
      {/* Regions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {profileType === 'expert' ? 'Regions You Specialize In' : 'Destination Specialisations'}
        </label>
        <select
          multiple
          className={`w-full px-4 py-3 border rounded-xl ${errors.regions ? 'border-red-500' : ''}`}
          onChange={e => {
            const options = Array.from(e.target.selectedOptions).map(o => o.value);
            if (options.length > 5) {
              setErrors(prev => ({ ...prev, regions: 'You can select up to 5 regions.' }));
              return;
            }
            setFormData(prev => ({ ...prev, regions: options }));
            setErrors(prev => ({ ...prev, regions: '' }));
          }}
          value={formData.regions}
        >
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
        <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select up to 5 regions</p>
        {errors.regions && <p className="text-sm text-red-600 mt-1">{errors.regions}</p>}
      </div>
    </div>
  )
}
