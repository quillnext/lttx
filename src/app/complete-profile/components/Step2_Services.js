
import dynamic from 'next/dynamic';

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
  { value: 'north-america', label: 'North America' },
  { value: 'central-america', label: 'Central America' },
  { value: 'caribbean', label: 'Caribbean' },
  { value: 'south-america', label: 'South America' },

  { value: 'western-europe', label: 'Western Europe' },
  { value: 'eastern-europe', label: 'Eastern Europe' },
  { value: 'northern-europe', label: 'Northern Europe' },
  { value: 'southern-europe', label: 'Southern Europe' },

  { value: 'south-asia', label: 'South Asia' },
  { value: 'southeast-asia', label: 'Southeast Asia' },
  { value: 'east-asia', label: 'East Asia' },
  { value: 'central-asia', label: 'Central Asia' },
  { value: 'west-asia', label: 'West Asia' },

  { value: 'north-africa', label: 'North Africa' },
  { value: 'west-africa', label: 'West Africa' },
  { value: 'east-africa', label: 'East Africa' },
  { value: 'central-africa', label: 'Central Africa' },
  { value: 'southern-africa', label: 'Southern Africa' },

  { value: 'australia-nz', label: 'Australia & New Zealand' },
  { value: 'pacific-islands', label: 'Pacific Islands' },
  { value: 'antarctica', label: 'Antarctica' },

  
  { value: 'mena', label: 'MENA' },
  { value: 'emea', label: 'EMEA' },
  { value: 'apac', label: 'APAC' },
  { value: 'latam', label: 'LATAM' },
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
      <h2 className="text-2xl font-semibold text-[var(--primary)] mb-6 flex items-center gap-2">
        <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
        {profileType === 'expert' ? 'Expertise & Regions' : 'Services & Specialisations'}
      </h2>

      {/* Services Grid */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {profileType === 'expert' ? 'What I Can Help You With' : 'Services Offered'} <span className="text-red-500">*</span>
        </label>
        
        {/* Changed from flex col to grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {formData.services.map((service, index) => (
            <div key={index} className="flex relative">
                <input
                type="text"
                className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.services ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="e.g., Visa"
                value={service}
                onChange={e => handleArrayChange(index, 'services', e.target.value)}
                />
                {formData.services.length > 1 && (
                <button
                    type="button"
                    className="absolute right-2 top-2 text-red-400 hover:text-red-600 bg-white/80 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    onClick={() => removeField('services', index)}
                >
                    ✕
                </button>
                )}
            </div>
            ))}
            
            {/* Add Button as a card */}
            <button
                type="button"
                onClick={() => addField('services')}
                className="w-full px-4 py-3 border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
                <span>+ Add Service</span>
            </button>
        </div>
        {errors.services && <p className="text-xs text-red-600 mt-2 font-medium">{errors.services}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regions - Full width inside 2 col grid */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
            {profileType === 'expert' ? 'Regions I Can Help With' : 'Regions Served'} <span className="text-red-500">*</span>
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
            placeholder="Select up to 5 regions..."
            className={`w-full ${errors.regions ? 'border-red-500 rounded-xl' : ''}`}
            styles={{
                control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '0.2rem',
                    borderColor: errors.regions ? '#ef4444' : '#e5e7eb',
                    backgroundColor: '#f9fafb',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#d1d5db' },
                    '&:focus-within': { borderColor: '#3b82f6', boxShadow: '0 0 0 2px #3b82f6' }
                })
            }}
            />
            {errors.regions && <p className="text-xs text-red-600 mt-1 font-medium">{errors.regions}</p>}
        </div>

        {/* Expertise - Full width inside 2 col grid */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
            {profileType === 'expert' ? 'Areas of Expertise' : 'Specialisations'} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center">
            <div className="flex-grow">
                <CreatableSelect
                    instanceId="expertise-select"
                    options={expertiseOptions}
                    value={selectedExpertise}
                    onChange={handleExpertiseChange}
                    onKeyDown={handleExpertiseKeyDown}
                    placeholder="Select or type..."
                    className="w-full"
                    styles={{
                        control: (base) => ({
                            ...base,
                            borderRadius: '0.75rem',
                            padding: '0.2rem',
                            borderColor: errors.expertise ? '#ef4444' : '#e5e7eb',
                            backgroundColor: '#f9fafb',
                            boxShadow: 'none',
                            '&:hover': { borderColor: '#d1d5db' },
                            '&:focus-within': { borderColor: '#3b82f6', boxShadow: '0 0 0 2px #3b82f6' }
                        })
                    }}
                    isClearable
                />
            </div>
            <button
                type="button"
                onClick={addExpertise}
                className="px-6 py-3 text-sm font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition shadow-sm"
            >
                Add
            </button>
            </div>
            
            {formData.expertise.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
                {formData.expertise.map((exp, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium"
                >
                    {exp}
                    <button
                    type="button"
                    onClick={() => removeExpertise(exp)}
                    className="text-blue-400 hover:text-blue-600"
                    >
                    ✕
                    </button>
                </div>
                ))}
            </div>
            )}
            {errors.expertise && <p className="text-xs text-red-600 mt-1 font-medium">{errors.expertise}</p>}
        </div>
      </div>
    </div>
  );
}
