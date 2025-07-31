import {NextResponse} from 'next/server';
import nodemailer from 'nodemailer'; // for task 3 

const API_KEY = process.env.TALKFURTHER_API_KEY; 
const GET_BASE_URL = 'https://api.talkfurther.com/api/chat/leads';
const POST_BASE_URL = 'https://api.talkfurther.com/api/chat/leads/ingestion/zapier-webhook';


// We will be using mailhog as the email provider 

const emailTransporter = nodemailer.createTransport({

    host: 'localhost', 
    port: 1025, 
    secure: false 
});

export async function GET(request) {
    try {
      const { searchParams } = new URL(request.url);
  
      const firstName = searchParams.get('firstName');
      const lastName = searchParams.get('lastName');
      const email = searchParams.get('email');
      const phoneNumber = searchParams.get('phoneNumber');
  
      const query = new URLSearchParams();
  
      if (firstName) query.append('search', firstName);
      if (phoneNumber) query.append('search', phoneNumber);
  
      const response = await fetch(`${GET_BASE_URL}?${query.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Api-Key ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();

      /* 
        for task 3, we will check for duplicate numbers, 
        so if a lead with the same phone number resubmits themselves,
         a new lead is not created. Instead an email notification is sent
        out to notify that a lead has revisited the form.
      */

        const normalizedNumber = phoneNumber?.replace(/\D/g, '');
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
  
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      console.error("GET request error: ", error);
      return NextResponse.json({ error: 'Failed to check for leads' }, { status: 500 });
    }
  }


export async function POST(request) {

    try {

        const body = await request.json();
        
        const {first_name: firstName, last_name: lastName, email, phone: phoneNumber, community_id} = body; 

        const response = await fetch(`${POST_BASE_URL}`, {

        method: 'POST',
        headers: {

            'Content-Type': 'application/json', 
            'Authorization': `Api-Key ${process.env.TALKFURTHER_API_KEY}`,
        },

        body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            phone: phoneNumber,
            community_id,
          }),
        });

        if(!response.ok) {

            const statusMessage = await response.text();

            return NextResponse.json({error: `Failed to generate a lead`, details: statusMessage}, {status: response.status});
        }

        return NextResponse.json({message: 'Lead created successfully'}, {status: 200});

    }

    catch(error) {

        return NextResponse.json({error: 'Unexpected server error encountered', details: error.message}, {status: 500});
    }
}