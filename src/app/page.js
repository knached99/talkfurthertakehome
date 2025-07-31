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

  // will use this state to show or hide the loading indicator on form submission 

  const [submitting, setSubmitting] = useState(false); 

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
    setSubmitting(true);

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
      setSubmitting(false);
      return;
    }

    const { firstName, lastName, email } = formData;
    const phoneNumber = formData.phoneNumber.replace(/\D/g, '');
    
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
        setSubmitting(false);
        return;
      }

      const leads = checkLeadData.results || [];

      const leadExists = leads.some(
          (lead) =>
          (email && lead.email?.toLowerCase() === email.toLowerCase()) ||
          (phoneNumber && lead.phone?.replace(/\D/g, '') === phoneNumber)
      );

      if (leadExists) {
        toast.success('You are already in Zapier!');
        setSubmitting(false);
      } 
      
      else {
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
          setSubmitting(false);
          return;
         
        }

        toast.success('Thank you, your information has been sent over to Zapier!');

        /* After data has been successfully sent over to Zapier, 
          we will send it into the Google Tag Manager (GTM for short)
        */ 
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'lead_form_submitted', 
          firstName, 
          lastName, 
          email, 
          phoneNumber,
        });


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

    finally {
      setSubmitting(false);
    }

  };
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-6 border border-blue-100"
      >
        <h2 className="text-2xl font-bold text-slate-900 text-center">Fire up the magic with GTM & Zapier!</h2>
        <p className="text-lg font-semibold text-indigo-600 mb-2 text-justify">Fill out the form below and watch GTM and Zapier do their happy dance!</p>
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
          disabled={submitting}
          className={`w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 hover:cursor-pointer text-white py-3 rounded-xl font-semibold transition-all ${
            submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {submitting && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              ></path>
            </svg>
          )}
          {submitting ? 'Please Wait...' : 'Submit'}
        </button>

      </form>
    </main>
  );
}