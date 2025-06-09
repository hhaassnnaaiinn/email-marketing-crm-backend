/**
 * HTML Templates for unsubscribe functionality
 */

const getUnsubscribeErrorPage = (message = 'Invalid Unsubscribe Link') => `
  <html>
    <head>
      <title>Unsubscribe Error</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .error-icon { color: #dc3545; font-size: 48px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">⚠️</div>
        <h1>Unsubscribe Error</h1>
        <p>${message}</p>
      </div>
    </body>
  </html>
`;

const getUnsubscribeConfirmationPage = (email, userId) => `
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
          <input type="hidden" name="userId" value="${userId}">
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

const getServerErrorPage = (message = 'An error occurred while processing your request.') => `
  <html>
    <head>
      <title>Error</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .error-icon { color: #dc3545; font-size: 48px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">❌</div>
        <h1>Error</h1>
        <p>${message}</p>
        <p>Please try again later or contact support.</p>
      </div>
    </body>
  </html>
`;

module.exports = {
  getUnsubscribeErrorPage,
  getUnsubscribeConfirmationPage,
  getAlreadyUnsubscribedPage,
  getUnsubscribeSuccessPage,
  getServerErrorPage
}; 