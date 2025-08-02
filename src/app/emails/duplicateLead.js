function getDuplicateLeadEmail({ firstName, lastName, email, phoneNumber }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Duplicate Lead Resubmitted</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: Arial, sans-serif;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          padding: 24px;
        }
        h2 {
          font-size: 18px;
          color: #1e293b;
          margin-bottom: 16px;
        }
        p {
          font-size: 15px;
          color: #334155;
          margin: 8px 0;
        }
        .lead-details {
          background-color: #f1f5f9;
          border-radius: 4px;
          padding: 16px;
          margin: 16px 0;
        }
        .lead-details p {
          margin: 6px 0;
          color: #0f172a;
        }
        .footer {
          font-size: 13px;
          color: #64748b;
          margin-top: 24px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h2>Duplicate Lead Resubmitted</h2>
        <p>A lead has resubmitted the form. See their info below:</p>
        <div class="lead-details">
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phoneNumber}</p>
        </div>
        <p class="footer">This is an automated message. Please verify in Zapier to avoid duplication</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = { getDuplicateLeadEmail };
