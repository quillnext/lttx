import dynamic from 'next/dynamic';

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

const CreatableSelect = loadComponent(() => import('react-select/creatable'), 'CreatableSelect');
const Select = loadComponent(() => import('react-select'), 'Select');

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

const regionOptions = [
  { value: 'North America', label: 'North America' },
  { value: 'South America', label: 'South America' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Africa', label: 'Africa' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Antarctica', label: 'Antarctica' },
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
  setSelectedExpertise,
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
          className="mt-2 text-sm text-[var(--primary)] hover:text-gray-800"
        >
          + Add another service
        </button>
        {errors.services && <p className="text-sm text-red-600 mt-1">{errors.services}</p>}
      </div>
      {/* Regions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {profileType === 'expert' ? 'Regions I Can Help With' : 'Regions Served'}
        </label>
        <Select
          instanceId="region-select"
          isMulti
          options={regionOptions}
          value={regionOptions.filter(option => formData.regions.includes(option.value))}
          onChange={selected => {
            const values = selected ? selected.map(opt => opt.value) : [];
            if (values.length > 5) {
              setErrors(prev => ({ ...prev, regions: 'You can select up to 5 regions.' }));
              return;
            }
            setFormData(prev => ({ ...prev, regions: values }));
            setErrors(prev => ({ ...prev, regions: '' }));
          }}
          placeholder="Select up to 5 regions (e.g., Europe, Asia)"
          className={`w-full ${errors.regions ? 'border-red-500' : ''}`}
          classNamePrefix="react-select"
        />
        {errors.regions && <p className="text-sm text-red-600 mt-1">{errors.regions}</p>}
      </div>
      {/* Expertise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {profileType === 'expert' ? 'Areas of Expertise' : 'Specialisations'}
        </label>
        <div className="flex gap-2 items-center">
          <CreatableSelect
            instanceId="expertise-select"
            options={expertiseOptions}
            value={selectedExpertise}
            onChange={handleExpertiseChange}
            onKeyDown={handleExpertiseKeyDown}
            placeholder="Select or type expertise (e.g., Visa Assistance)"
            className="w-full"
            classNamePrefix="react-select"
            isClearable
          />
          <button
            type="button"
            onClick={addExpertise}
            className="px-4 py-2 text-sm font-semibold text-white bg-[var(--primary)] rounded-xl hover:bg-opacity-90"
          >
            Add
          </button>
        </div>
        {formData.expertise.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.expertise.map((exp, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-[var(--primary)] text-white rounded-full text-sm"
              >
                {exp}
                <button
                  type="button"
                  onClick={() => removeExpertise(exp)}
                  className="text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.expertise && <p className="text-sm text-red-600 mt-1">{errors.expertise}</p>}
      </div>
    </div>
  );
}