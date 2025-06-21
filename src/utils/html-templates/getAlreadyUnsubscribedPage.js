/**
 * HTML Template for already unsubscribed page
 */
const getAlreadyUnsubscribedPage = (email) => `
  <html>
    <head>
      <title>Already Unsubscribed</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .info-icon { color: #17a2b8; font-size: 48px; margin-bottom: 20px; }
        .email { font-weight: bold; color: #333; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="info-icon">ℹ️</div>
        <h1>Already Unsubscribed</h1>
        <p>The email address <span class="email">${email}</span> has already been unsubscribed from our mailing list.</p>
        <p>You will no longer receive emails from us.</p>
      </div>
    </body>
  </html>
`;

module.exports = getAlreadyUnsubscribedPage; 