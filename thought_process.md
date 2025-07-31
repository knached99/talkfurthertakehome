Task 1

First, I created the web form. I did this using NextJS and TailwindCSS to create a simple design that was aesthetically pleasing and mobile responsive. In page.js, I coded the web form; I created validations for each of the form fields and created handlers for events including onSubmit and onChange.

Once I created the form, I set up Google Analytics to keep track of user data. In Google Analytics, I went into the Admin dashboard and created a Property. This gave me a place to store all my measurement and user data. Once I finished this, it gave me a measurement id. I used this measurement id to create a tag for Google Analytics submission events in Google Tag Manager.

To link the web form and Google Tag Manager together, I inserted a script for the specific tag in layout.js. This creates a data layer in the web page that gets activated when I submit data in the form. When this happends, the data layer will retrieve all the form data and send it to Google Analytics.

Task 2

In order to verify if a user exists in Zapier and to add their information if it is not present, I made two separate API calls. These API calls both require a community_id, "142430", which indicates which community they belong to in the Zapier system. If both calls succeed, a Toast will open up indicating success. Else, if an error happens at any step, an error pop-up will appear

First, I changed the logic in layout.js so that the call to the data layer only happens if the tag does not exist yet in Zapier. The first API call is a GET call to `https://api.talkfurther.com/api/chat/leads?${query.toString()}`, which will check if the email and phone number query already exists for a specific lead. A lead has information about a specific user in Zapier. If that lead exists, then there is no need to update information.

      const check_lead_response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Api-Key {REDACTED}',
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
            'Authorization': 'Api-Key {REDACTED}',
          },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phoneNumber,
            community_id: "142430", 
          }),
        });


As part of task 2, we also need to insert data into Google Sheets if the validation fails for 
email and phone number. To accomplish this, the first thing I did was create a new sheet by visiting sheets.google.com 

I then created a new sheet and titled it ```talkfurtherassessment```, 
to link that sheet with my web app, I had to add a script by navigating to the navbar in Google sheets and looking for "Extensions", 
after clicking on that, I clicked on "Apps Script", I give that script a title and copy + paste the code from this site: 
https://measureschool.com/google-sheets-tracking-google-tag-manager/

into the code editor, 

I then deploy it by clicking on "Deploy", then "New Deployment" and fill out the fields and then click on "Deploy"

I then modify my code in ```page.js``` and add the following on line 20:

``` 
const googleSheetURL = new URL(
    'https://script.google.com/macros/s/AKfycbx87mJclbp1j4tJJnBUpEFfo2W5lKv_UQx05KbrhDn8vooHYOeFMsKJ7puA5l4Tccmxfg/exec'
  ); 

```
From lines 115 to 133 I make a get request to the sheet and insert the following data:

```
 const sheetURL = new URL(googleSheetURL);

      sheetURL.searchParams.append('firstName', firstName);
      sheetURL.searchParams.append('lastName', lastName);
      sheetURL.searchParams.append('email', email);
      sheetURL.searchParams.append('phoneNumber', phoneNumber);

      try {

        await fetch(sheetURL.toString(), {

          method: 'GET', 
          mode: 'no-cors', 
        });
      }

      catch(err) {
        console.warn('Google Sheets insertion failed: ', err);
      }
```

For Task 3, I added deduplication logic in my Zapier integration. 
The goal here is to check if a lead with the same phone number submits the form again, the system should not create a new lead but instead it should send
 an email notification to alert us that the lead has revisited the form.



I wrote this logic in my GET request in ``` route.js ``` 

the below code snippet checks if the entered number is found in a lead, if so, 
send out the email notification via MailHog. 


```
const isNumberDuplicate = data.results?.some((lead) => 
            lead.phone?.replace(/\D/g, '') === normalizedNumber
        );

  if(isNumberDuplicate) {

            try {
                await emailTransporter.sendMail({
                  from: '"Lead Alerts" <talkfurther@assessment.com>',
                  to: 'talkfurthercandidate@email.com',
                  subject: 'Duplicate Lead Resubmitted',
                  text: `The following lead resubmitted the form:
              Name: ${firstName} ${lastName}
              Email: ${email}
              Phone: ${phoneNumber}`,
                });
              } catch (error) {
                console.error('Error sending email:', error);
                toast.error('An error occurred while sending the email notification');
              }
        } 
```