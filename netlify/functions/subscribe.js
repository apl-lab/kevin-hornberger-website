// netlify/functions/subscribe.js
//
// Proxies the website signup form to Mailchimp v3 API.
// The API key never touches the browser — it's read from Netlify env vars.
//
// Required Netlify environment variables:
//   MAILCHIMP_API_KEY   — Mailchimp API key (ends with -<server>, e.g. "...-us20")
//   MAILCHIMP_SERVER    — Server prefix, e.g. "us20"
//   MAILCHIMP_LIST_ID   — Audience (list) ID, e.g. "e18a7982d6"
//
// Form sends JSON: { firstName, lastName, email, phone, smsOptIn }
// Tags applied to every signup: volunteer-lead, website-signup

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const SERVER  = process.env.MAILCHIMP_SERVER;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;

  if (!API_KEY || !SERVER || !LIST_ID) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration missing. Check Netlify env vars.',
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { firstName, lastName, email, phone, zip, smsOptIn, interests } = payload;

  if (!email || !email.includes('@')) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'A valid email address is required' }),
    };
  }

  // Build the Mailchimp payload
  const merge_fields = {
    FNAME: (firstName || '').trim(),
    LNAME: (lastName  || '').trim(),
  };

  // ZIP code → the audience's existing "Zip" field (merge tag MMERGE3).
  if (zip && String(zip).trim() !== '') {
    merge_fields.MMERGE3 = String(zip).trim();
  }

  // Phone: the audience currently has no PHONE merge field, so we capture the
  // opt-in intent as a tag rather than risk a failed signup. (Add a PHONE field
  // in Mailchimp later to store the number itself for SMS.)
  const phoneTags = [];
  if (smsOptIn) {
    phoneTags.push('sms-opt-in');
    if (phone && phone.trim() !== '') phoneTags.push('phone: ' + phone.trim());
  }

  // Interests the supporter selected become tags so the team can segment them.
  const interestTags = Array.isArray(interests)
    ? interests.map(t => String(t).trim()).filter(Boolean).slice(0, 25)
    : [];

  const mailchimpBody = {
    email_address: email.trim(),
    status: 'subscribed',
    merge_fields,
    tags: ['volunteer-lead', 'website-signup', ...interestTags, ...phoneTags],
  };

  const url = `https://${SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
  const auth = 'Basic ' + Buffer.from('any:' + API_KEY).toString('base64');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailchimpBody),
    });

    const data = await response.json();

    if (!response.ok) {
      // "Member Exists" — treat as success so already-subscribed users see a thank you
      if (data.title === 'Member Exists') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            alreadySubscribed: true,
          }),
        };
      }
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data.detail || data.title || 'Subscription failed',
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Network error' }),
    };
  }
};
