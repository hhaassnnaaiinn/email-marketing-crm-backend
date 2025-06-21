/**
 * HTML Template for server error page
 */
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

module.exports = getServerErrorPage; 