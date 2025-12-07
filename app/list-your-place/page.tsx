'use client';

import { useState } from 'react';

const steps = [
  { id: 1, name: 'Location', active: true },
  { id: 2, name: 'Occasion', active: false },
  { id: 3, name: 'Amenities', active: false },
  { id: 4, name: 'Pricing', active: false },
  { id: 5, name: 'Photos', active: false },
  { id: 6, name: 'Details', active: false },
  { id: 7, name: 'Profile', active: false },
  { id: 8, name: 'Publish', active: false },
];

export default function ListYourPlacePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [country, setCountry] = useState('Philippines');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingUnit, setBuildingUnit] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const countries = ['Philippines', 'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Vietnam'];
  const states = ['Metro Manila', 'Cebu', 'Davao', 'Laguna', 'Cavite', 'Bulacan'];

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Save & Exit */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-end">
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Save & exit
          </button>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar - Progress Steps */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 min-h-screen py-8">
          <div className="px-6">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`mb-6 cursor-pointer transition-colors ${
                  step.id === currentStep
                    ? 'text-blue-600'
                    : step.id < currentStep
                    ? 'text-gray-600'
                    : 'text-gray-400'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      step.id === currentStep
                        ? 'bg-blue-600 text-white'
                        : step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      step.id === currentStep ? 'text-blue-600' : ''
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-8 py-8">
          {/* Step Indicator */}
          <div className="mb-6">
            <span className="text-gray-600 text-sm">Step {currentStep}/8</span>
          </div>

          {/* Location Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Location</h1>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for your property location"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          {/* Property Location Form Fields */}
          <div className="space-y-6 mb-8">
            {/* Country/Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country/Region
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* State/Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  showErrors && !state ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select state/province</option>
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {showErrors && !state && (
                <p className="mt-1 text-sm text-blue-600">Please enter state to continue</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  showErrors && !city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city"
              />
              {showErrors && !city && (
                <p className="mt-1 text-sm text-red-600">Please enter city to continue</p>
              )}
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street address
              </label>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  showErrors && !streetAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter street address"
              />
              {showErrors && !streetAddress && (
                <p className="mt-1 text-sm text-red-600">Please enter street address to continue</p>
              )}
            </div>

            {/* Building, floor or unit number (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building, floor or unit number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={buildingUnit}
                onChange={(e) => setBuildingUnit(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter building, floor or unit number"
              />
            </div>

            {/* ZIP/Postal code (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal code <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter ZIP/postal code"
              />
            </div>
          </div>

          {/* Map Container */}
          <div className="mb-8 border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15505.0973452802!2d100.5014414!3d13.7563309!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d6032280d61f3%3A0x10100b2de25049e0!2sBangkok%2C%20Thailand!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Back
            </button>
            <button
              onClick={() => {
                if (!state || !city || !streetAddress) {
                  setShowErrors(true);
                } else {
                  setShowErrors(false);
                  // Proceed to next step
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
