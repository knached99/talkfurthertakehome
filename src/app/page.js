'use client';

import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export default function Home() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const [errorMessages, setErrorMessages] = useState({});

  const validateFields = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim() === '' ? 'This field is required' : '';

      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value.trim())
          ? ''
          : 'Enter a valid email address (e.g., example@domain.com)';

      case 'phoneNumber':
        const usPhoneRegex = /^(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
        return usPhoneRegex.test(value.trim())
          ? ''
          : 'Enter a valid US phone number (e.g., 1234567890, 123-456-7890, (123) 456-7890)';

      default:
        return '';
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  /* This method submits user data to GTM and 
  Zapier after successfully validating the inputs */
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrorMessages = {};

    Object.keys(formData).forEach((key) => {
      const errorMessage = validateFields(key, formData[key]);
      if (errorMessage) newErrorMessages[key] = errorMessage;
    });

    if (Object.keys(newErrorMessages).length > 0) {
      setErrorMessages(newErrorMessages);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'form_submission_error',
        ...formData,
        errors: newErrorMessages,
      });

      toast.error('Please correct the highlighted fields');
      return;
    }

    const { firstName, lastName, email, phoneNumber } = formData;

    try {
      const checkLeadResponse = await fetch(
        '/api/submit-lead?' +
          new URLSearchParams({ firstName, phoneNumber }),
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const checkLeadData = await checkLeadResponse.json();

      if (!checkLeadResponse.ok) {
        toast.error(
          "An unexpected error was encountered! Don't worry, our team is on the fix!"
        );
        console.error(
          `Lead search failed: ${checkLeadData.error || checkLeadResponse.statusText}`
        );
        return;
      }

      const leads = checkLeadData.results || [];

      const leadExists = leads.some(
        (lead) =>
          (email && lead.email === email) ||
          (phoneNumber && lead.phone === phoneNumber)
      );

      if (leadExists) {
        toast.success('You are already in Zapier!');
      } else {
        const createLeadResponse = await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            phone: phoneNumber,
            community_id: '142430',
          }),
        });

        if (!createLeadResponse.ok) {
          const error = await createLeadResponse.text();

          console.error('Zapier API Error: ', {
            status: createLeadResponse.status,
            statusText: createLeadResponse.statusText,
            body: error,
          });

          toast.error('Whoops! Something went wrong while creating the lead!');
          return;
        }

        toast.success('Thank you, your information has been sent over to Zapier!');

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
        });
        setErrorMessages({});
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Something went wrong. Please try again later.');
    }
  };
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 border border-blue-100"
      >
        <h2 className="text-2xl font-bold text-slate-900 text-center">Trigger Google Tag Manager!</h2>
        <p className="text-lg font-normal mb-2 text-slate-950 text-justify">Fill out the form below and GTM will get your data right away!</p>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className={`text-slate-950 font-bold border rounded xl px-4 py-3 focus:outline-none focus:ring-2 ${errorMessages.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
          />

          {errorMessages.firstName && (<p className="text-red-500 text-md mt-1">{errorMessages.firstName}</p>)}

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className={`text-slate-950 font-bold border rounded xl px-4 py-3 focus:outline-none focus:ring-2 ${errorMessages.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
          />

          {errorMessages.lastName && (<p className="text-red-500 text-md mt-1">{errorMessages.lastName}</p>)}

          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`text-slate-950 font-bold border rounded xl px-4 py-3 focus:outline-none focus:ring-2 ${errorMessages.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
          />

          {errorMessages.email && (<p className="text-red-500 text-md mt-1">{errorMessages.email}</p>)}

          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`text-slate-950 font-bold border rounded xl px-4 py-3 focus:outline-none focus:ring-2 ${errorMessages.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
          />

        {errorMessages.phoneNumber && (<p className="text-red-500 text-md mt-1">{errorMessages.phoneNumber}</p>)}
        
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 hover:cursor-pointer transition-all font-semibold"
        >
          Submit
        </button>
      </form>
    </main>
  );
}