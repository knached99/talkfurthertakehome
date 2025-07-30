Task 1

First, I created the web form. I did this using React to create a simple design that was aesthetically pleasing. In page.js, I coded the web form; I created validations for each of the form fields and created handlers for events including onSubmit and onChange.

Once I created the form, I set up Google Analytics to keep track of user data. In Google Analytics, I went into the Admin dashboard and created a Property. This gave me a place to store all my measurement and user data. Once I finished this, it gave me a measurement id. I used this measurement id to create a tag for Google Analytics submission events in Google Tag Manager.

To link the web form and Google Tag Manager together, I inserted a script for the specific tag in layout.js. This creates a data layer in the web page that gets activated when I submit data in the form. When this happends, the data layer will retrieve all the form data and send it to Google Analytics.

Task 2

In order to verify if a user exists in Zapier and to add their information if it is not present, I made two separate API calls. These API calls both require a community_id, "142430", which indicates which community they belong to in the Zapier system. If both calls succeed, a Toast will open up indicating success. Else, if an error happens at any step, an error pop-up will appear

First, I changed the logic in layout.js so that the call to the data layer only happens if the tag does not exist yet in Zapier. The first API call is a GET call to `https://api.talkfurther.com/api/chat/leads?${query.toString()}`, which will check if the email and phone number query already exists for a specific lead. A lead has information about a specific user in Zapier. If that lead exists, then there is no need to update information.

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

The second API call is `https://api.talkfurther.com/api/chat/leads/ingestion/zapier-webhook`, which will run a POST call to update a lead for a user with their first name, last name, email, and phone number.

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
