
"use client";

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

const serviceOptions = [
  { value: 'Visa Assistance', label: 'Visa Assistance' },
  { value: 'Custom Itineraries', label: 'Custom Itineraries' },
  { value: 'Flight Bookings', label: 'Flight Bookings' },
  { value: 'Hotel Sourcing', label: 'Hotel Sourcing' },
  { value: 'Local Guidance', label: 'Local Guidance' },
];

const regionOptions = [
  { value: 'North America', label: 'North America' },
  { value: 'South America', label: 'South America' },
  { value: 'Western Europe', label: 'Western Europe' },
  { value: 'Eastern Europe', label: 'Eastern Europe' },
  { value: 'South Asia', label: 'South Asia' },
  { value: 'Southeast Asia', label: 'Southeast Asia' },
  { value: 'Middle East', label: 'Middle East' },
  { value: 'Australia & NZ', label: 'Australia & NZ' },
];

export default function Step2_Services({
  formData,
  errors,
  handleMultiChange,
}) {
  const { profileType } = formData;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--primary)] mb-6 flex items-center gap-2">
        <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
        {profileType === 'expert' ? 'Expertise & Regions' : 'Services & Specialisations'}
      </h2>

      {/* Services as Tags */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {profileType === 'expert' ? 'What I Can Help You With' : 'Services Offered'} <span className="text-red-500">*</span>
        </label>
        <CreatableSelect
            isMulti
            options={serviceOptions}
            value={formData.services.map(s => ({ value: s, label: s }))}
            onChange={selected => handleMultiChange(selected, 'services')}
            placeholder="Select or create services..."
            className={`w-full ${errors.services ? 'border-red-500 rounded-xl' : ''}`}
            styles={{
                control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '0.2rem',
                    borderColor: errors.services ? '#ef4444' : '#e5e7eb',
                    backgroundColor: '#f9fafb',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#d1d5db' },
                    '&:focus-within': { borderColor: '#3b82f6', boxShadow: '0 0 0 2px #3b82f6' }
                })
            }}
        />
        {errors.services && <p className="text-xs text-red-600 mt-1 font-medium">{errors.services}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regions as Tags */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
            {profileType === 'expert' ? 'Regions I Can Help With' : 'Regions Served'} <span className="text-red-500">*</span>
            </label>
            <CreatableSelect
            isMulti
            options={regionOptions}
            value={formData.regions.map(r => ({ value: r, label: r }))}
            onChange={selected => handleMultiChange(selected, 'regions')}
            placeholder="Select or create regions..."
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

        {/* Expertise as Tags */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
            {profileType === 'expert' ? 'Areas of Expertise' : 'Specialisations'} <span className="text-red-500">*</span>
            </label>
            <CreatableSelect
                isMulti
                options={expertiseOptions}
                value={formData.expertise.map(e => ({ value: e, label: e }))}
                onChange={selected => handleMultiChange(selected, 'expertise')}
                placeholder="Select or create expertise..."
                className={`w-full ${errors.expertise ? 'border-red-500 rounded-xl' : ''}`}
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
            />
            {errors.expertise && <p className="text-xs text-red-600 mt-1 font-medium">{errors.expertise}</p>}
        </div>
      </div>
    </div>
  );
}
