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

export default function Step2_Services({
  formData,
  errors,
  handleMultiChange,
}) {
  const { profileType } = formData;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
        <span className="bg-[var(--primary)] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
        {profileType === 'expert' ? 'Expertise' : 'Specialisations'}
      </h2>

      <div className="grid grid-cols-1 gap-6">
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
                        '&:focus-within': { borderColor: '#36013F', boxShadow: '0 0 0 2px #36013F' }
                    })
                }}
            />
            {errors.expertise && <p className="text-xs text-red-600 mt-1 font-medium">{errors.expertise}</p>}
        </div>
      </div>
    </div>
  );
}