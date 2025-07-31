import {NextResponse} from 'next/server';


const API_KEY = process.env.TALKFURTHER_API_KEY; 
const GET_BASE_URL = 'https://api.talkfurther.com/api/chat/leads';
const POST_BASE_URL = 'https://api.talkfurther.com/api/chat/leads/ingestion/zapier-webhook';


export async function GET(request) {
    try {
      const { searchParams } = new URL(request.url);
  
      const firstName = searchParams.get('firstName');
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