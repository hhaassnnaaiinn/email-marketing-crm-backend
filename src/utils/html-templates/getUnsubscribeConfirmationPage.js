/**
 * HTML Template for unsubscribe confirmation page
 */
const getUnsubscribeConfirmationPage = (email, id) => `
  <html>
    <head>
      <title>Unsubscribe Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .email { font-weight: bold; color: #333; }
        .btn { display: inline-block; padding: 12px 24px; margin: 10px; text-decoration: none; border-radius: 4px; font-weight: bold; }
        .btn-danger { background-color: #dc3545; color: white; }
        .btn-secondary { background-color: #6c757d; color: white; }
        .btn:hover { opacity: 0.8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Unsubscribe Confirmation</h1>
        <p>Are you sure you want to unsubscribe <span class="email">${email}</span> from our mailing list?</p>
        <p>You will no longer receive emails from us.</p>
        
        <form method="POST" action="/api/email/direct-unsubscribe" style="margin: 20px 0;">
          <input type="hidden" name="email" value="${email}">
          <input type="hidden" name="contactId" value="${id}">
          <input type="hidden" name="userId" value="${id}">
          <input type="hidden" name="reason" value="Unsubscribed via email link">
          
          <button type="submit" class="btn btn-danger">Yes, Unsubscribe Me</button>
          <a href="javascript:history.back()" class="btn btn-secondary">Cancel</a>
        </form>
        
        <p style="font-size: 12px; color: #666; margin-top: 30px;">
          If you have any questions, please contact us.
        </p>
      </div>
    </body>
  </html>
`;

module.exports = getUnsubscribeConfirmationPage; 