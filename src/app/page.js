'use client';

import {useState} from 'react';
import {Toaster, toast} from 'react-hot-toast';

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
        return /\S+@\S+\.\S+/.test(value) ? '' : 'Enter a valid email address';

      case 'phoneNumber':
        return /^\+?[0-9]{7,15}$/.test(value) ? '' : 'Enter a valid phone number';

      default:
        return '';
    }
  };


  const handleChange = (e) => {
    
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value })); 
  
  }

  /* This is the method that handles the form submission, 
  if fields are validated successfully, that data is pushed to the GTM
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateFields(key, formData[key]);
      if (errorMsg) newErrors[key] = errorMsg;
    });

    const hasErrors = Object.keys(newErrors).length > 0;

    if (hasErrors) {
      setErrorMessages(newErrors);
    
      // Push to GTM on failed submission
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'form_submission_error',
        ...formData,
        errors: newErrors,
      });

      toast.error('Please correct the highlighted fields.');
      return;
    }

    const query = new URLSearchParams();
    if (formData.firstName) query.append('search', formData.firstName);
    if (formData.phoneNumber) query.append('search', formData.phoneNumber);

    const url = `https://api.talkfurther.com/api/chat/leads?${query.toString()}`;

    /* If this data is valid, push to Zapier
    BUT, check if the lead already exists first */
    try {
      // First, check if the lead already exists
      const check_lead_response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Api-Key VIaVhMhV.n6V9Dq0nQhzsgB1OACYpbvmCIhPUfY94', // Your API key here
        },
        body: JSON.stringify({
          community_id: "142430"
        }),
      }) 

      const check_lead_result = await check_lead_response.json();
      if (!check_lead_response.ok) {
        throw new Error(`Failed to search leads: ${check_lead_result.error || check_lead_response.statusText}`);
      }

      const leads = check_lead_result?.results || []; // Volume and key names depend on API response
      const exists = leads.some(lead =>
        (email && lead.email === email) ||
        (phoneNumber && lead.phone === phoneNumber)
      );

      if (exists) {
        toast.success('Lead already exists in Zapier!')
      }
      else {
        const create_lead_response = await fetch('https://api.talkfurther.com/api/chat/leads/ingestion/zapier-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer VIaVhMhV.n6V9Dq0nQhzsgB1OACYpbvmCIhPUfY94', // Your API key here
          },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phoneNumber,
            community_id: "142430",  // Your community ID
          }),
        });
        if (create_lead_response.ok) {
          toast.success('Form submitted and sent to Zapier!');
        }
        else {
          throw new Error('Zapier request failed');
        }
      }
  }
  catch (err) {
    // Log failure in GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'form_submission_error',
      ...formData,
      errorMessage: err.message,
    });

    toast.error('Zapier request failed. Try again later.');
  }
  setFormData({ firstName: '', lastName: '', email: '', phoneNumber: '' });
  setErrorMessages({});
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
            className="text-slate-950 font-bold border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="text-slate-950 font-bold border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="text-slate-950 font-bold border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="text-slate-950 font-bold border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold"
        >
          Submit
        </button>
      </form>
    </main>
  );
}