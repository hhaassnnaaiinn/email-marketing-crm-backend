/**
 * HTML Template for unsubscribe success page
 */
const getUnsubscribeSuccessPage = (email) => `
  <html>
    <head>
      <title>Successfully Unsubscribed</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success-icon { color: #28a745; font-size: 48px; margin-bottom: 20px; }
        .email { font-weight: bold; color: #333; }
        .btn { display: inline-block; padding: 12px 24px; margin: 10px; text-decoration: none; border-radius: 4px; font-weight: bold; background-color: #007bff; color: white; }
        .btn:hover { opacity: 0.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">✓</div>
        <h1>Successfully Unsubscribed</h1>
        <p>The email address <span class="email">${email}</span> has been successfully unsubscribed from our mailing list.</p>
        <p>You will no longer receive emails from us.</p>
        
        <div style="margin: 30px 0;">
          <a href="javascript:window.close()" class="btn">Close Window</a>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 30px;">
          If you have any questions or would like to resubscribe, please contact us.
        </p>
      </div>
    </body>
  </html>
`;

module.exports = getUnsubscribeSuccessPage; 