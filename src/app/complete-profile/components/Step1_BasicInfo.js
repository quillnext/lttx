
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with error handling
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

const PhoneInput = loadComponent(() => import("react-phone-input-2"), "PhoneInput");
const DatePicker = loadComponent(() => import("react-datepicker"), "DatePicker");
const Select = loadComponent(() => import('react-select'), "Select");

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
  setApiError,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--primary)] mb-6 flex items-center gap-2">
        <span className="bg-[var(--primary)] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
        Basic Information
      </h2>
      
      {/* 12 Column Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Row 1: Phone (4), Username (4), Full Name (4) */}
        <div className="md:col-span-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
          <PhoneInput
            country={"in"}
            value={formData.phone}
            onChange={phone => {
              setFormData(prev => ({ ...prev, phone }));
              fetchLeadByPhone(phone);
            }}
            placeholder="Enter phone"
            inputProps={{
              id: 'phone',
              className: `w-full p-3 pl-14 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200'}`,
              required: true,
            }}
            containerClass="!w-full"
            buttonClass="!bg-gray-100 !border-gray-200 !rounded-l-xl hover:!bg-gray-200"
          />
          {errors.phone && <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone}</p>}
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="username"
            placeholder="e.g., travelwithjohn"
            className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none ${errors.username ? 'border-red-500' : 'border-gray-200'}`}
            value={formData.username}
            onChange={handleChange}
            disabled={!!profileId}
          />
          <div className="flex justify-between mt-1 h-4">
             <p className="text-[10px] text-gray-400 truncate max-w-[60%]">xmytravel.com/experts/...</p>
             {usernameStatus && (
                <p className={`text-[10px] font-medium ${usernameStatus.includes('available') ? 'text-green-600' : 'text-red-600'}`}>
                {usernameStatus}
                </p>
            )}
          </div>
          {errors.username && errors.username !== 'Username is already taken' && (
            <p className="text-xs text-red-600 mt-0 font-medium">{errors.username}</p>
          )}
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">{formData.profileType === 'expert' ? 'Full Name' : 'Agency Name'} <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="fullName"
            placeholder={formData.profileType === 'expert' ? "John Doe" : "Agency Name"}
            className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`}
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <p className="text-xs text-red-600 mt-1 font-medium">{errors.fullName}</p>}
        </div>

        {/* Row 2: Email (4), DOB/Years (3), Response (2), Pricing (3) */}
        <div className="md:col-span-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            name="email"
            placeholder="john@example.com"
            className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>}
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-bold text-gray-700 mb-1">{formData.profileType === 'expert' ? 'Date of Birth' : 'Years Active'} <span className="text-red-500">*</span></label>
          {formData.profileType === 'expert' ? (
            <DatePicker
              selected={formData.dateOfBirth}
              onChange={date => {
                setFormData(prev => ({ ...prev, dateOfBirth: date }));
                setErrors(prev => ({ ...prev, dateOfBirth: '' }));
              }}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-200'}`}
              maxDate={new Date()}
              showYearDropdown
              yearDropdownItemNumber={100}
              scrollableYearDropdown
            />
          ) : (
            <input
              type="text"
              name="yearsActive"
              placeholder="e.g., 5+"
              className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none ${errors.yearsActive ? 'border-red-500' : 'border-gray-200'}`}
              value={formData.yearsActive}
              onChange={handleChange}
            />
          )}
          {formData.profileType === 'expert' && errors.dateOfBirth && <p className="text-xs text-red-600 mt-1 font-medium">{errors.dateOfBirth}</p>}
          {formData.profileType !== 'expert' && errors.yearsActive && <p className="text-xs text-red-600 mt-1 font-medium">{errors.yearsActive}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Response Time <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="responseTime"
            placeholder="e.g. 2h"
            className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none ${errors.responseTime ? 'border-red-500' : 'border-gray-200'}`}
            value={formData.responseTime}
            onChange={handleChange}
          />
          {errors.responseTime && <p className="text-xs text-red-600 mt-1 font-medium">{errors.responseTime}</p>}
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-bold text-gray-700 mb-1">Pricing <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="pricing"
            placeholder="e.g. ₹500/call"
            className={`w-full px-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none ${errors.pricing ? 'border-red-500' : 'border-gray-200'}`}
            value={formData.pricing}
            onChange={handleChange}
          />
          {errors.pricing && <p className="text-xs text-red-600 mt-1 font-medium">{errors.pricing}</p>}
        </div>

        {/* Row 3: Location (6), Languages (6) */}
        <div className="md:col-span-6">
          <label className="block text-sm font-bold text-gray-700 mb-1">Location <span className="text-red-500">*</span></label>
          <Select
            instanceId="location-select"
            options={cityOptions}
            value={cityOptions.find(option => option.value === formData.location) || null}
            onChange={selected => handleSingleChange(selected, 'location')}
            placeholder="Search City..."
            className={`w-full ${errors.location ? 'border-red-500 rounded-xl' : ''}`}
            styles={{
                control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '0.2rem',
                    borderColor: errors.location ? '#ef4444' : '#e5e7eb',
                    backgroundColor: '#f9fafb',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#d1d5db' },
                    '&:focus-within': { borderColor: 'var(--primary)', boxShadow: '0 0 0 2px var(--primary)' }
                })
            }}
            isDisabled={cityOptions.length === 0 && !formData.location}
            isSearchable={true}
            onInputChange={inputValue => {
              if (inputValue) {
                fetch(`/api/cities?search=${encodeURIComponent(inputValue)}`)
                  .then(res => res.ok ? res.json() : Promise.reject(new Error(`Failed`)))
                  .then(data => {
                    if (!data.error) {
                        const sortedCities = [...data].sort((a, b) => a.label.localeCompare(b.label));
                        setCityOptions(sortedCities);
                    }
                  })
                  .catch(err => console.error(err));
              }
            }}
          />
          {errors.location && <p className="text-xs text-red-600 mt-1 font-medium">{errors.location}</p>}
        </div>

        <div className="md:col-span-6">
          <label className="block text-sm font-bold text-gray-700 mb-1">Languages Spoken <span className="text-red-500">*</span></label>
          <Select
            instanceId="language-select"
            isMulti
            options={languageOptions}
            value={languageOptions.filter(option => formData.languages.includes(option.value))}
            onChange={selected => handleMultiChange(selected, 'languages')}
            placeholder="Select languages..."
            className={`w-full ${errors.languages ? 'border-red-500 rounded-xl' : ''}`}
            styles={{
                control: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    padding: '0.2rem',
                    borderColor: errors.languages ? '#ef4444' : '#e5e7eb',
                    backgroundColor: '#f9fafb',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#d1d5db' },
                    '&:focus-within': { borderColor: 'var(--primary)', boxShadow: '0 0 0 2px var(--primary)' }
                })
            }}
            isDisabled={languageOptions.length === 0}
          />
          {errors.languages && <p className="text-xs text-red-600 mt-1 font-medium">{errors.languages}</p>}
        </div>

      </div>
    </div>
  );
}
