 # CRM for Email Marketing - API Documentation
 
 ## Table of Contents
 1. [Overview](#overview)
 2. [Authentication](#authentication)
 3. [Base URL](#base-url)
 4. [Error Handling](#error-handling)
 5. [Endpoints](#endpoints)
    - [Authentication](#authentication-endpoints)
    - [Users](#user-endpoints)
    - [Contacts](#contact-endpoints)
    - [Templates](#template-endpoints)
    - [Campaigns](#campaign-endpoints)
    - [AWS Settings](#aws-settings-endpoints)
    - [Email](#email-endpoints)
 
 ## Overview
 
 This API provides a comprehensive CRM system for email marketing with features including contact management, email templates, campaign creation, and AWS SES integration for email delivery.
 
 ## Authentication
 
 The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
 
 ```
 Authorization: Bearer <your-jwt-token>
 ```
 
 ## Base URL
 
 ```
 http://localhost:5000/api
 ```
 
 ## Error Handling
 
 All endpoints return consistent error responses:
 
 ```json
 {
   "success": false,
   "message": "Error description",
   "error": "Detailed error message (development only)"
 }
 ```
 
 Common HTTP status codes:
 - `200` - Success
 - `201` - Created
 - `400` - Bad Request
 - `401` - Unauthorized
 - `404` - Not Found
 - `500` - Internal Server Error
 
 ---
 
 ## Endpoints
 
 ### Authentication Endpoints
 
 #### Register User
 ```http
 POST /auth/register
 ```
 
 **Request Body:**
 ```json
 {
   "email": "user@example.com",
   "password": "password123"
 }
 ```
 
 **Response:**
 ```json
 {
   "token": "jwt-token-here",
   "user": {
     "_id": "user-id",
     "email": "user@example.com",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
 }
 ```
 
 #### Login User
 ```http
 POST /auth/login
 ```
 
 **Request Body:**
 ```json
 {
   "email": "user@example.com",
   "password": "password123"
 }
 ```
 
 **Response:**
 ```json
 {
   "token": "jwt-token-here",
   "user": {
     "_id": "user-id",
     "email": "user@example.com",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
 }
 ```
 
 ### User Endpoints
 
 #### Get Current User Profile
 ```http
 GET /users/me
 Authorization: Bearer <token>
 ```
 
 **Response:**
 ```json
 {
   "_id": "user-id",
   "email": "user@example.com",
   "createdAt": "2024-01-01T00:00:00.000Z"
 }
 ```
 
 #### Update User Profile
 ```http
 PUT /users/me
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "email": "newemail@example.com"
 }
 ```
 
 #### Get All Users (Admin)
 ```http
 GET /users
 Authorization: Bearer <token>
 ```
 
 ### Contact Endpoints
 
 #### Get All Contacts
 ```http
 GET /contacts
 Authorization: Bearer <token>
 ```
 
 **Response:**
 ```json
 [
   {
     "_id": "contact-id",
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "phone": "+1234567890",
     "company": "Example Corp",
     "createdBy": "user-id",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
 ]
 ```
 
 #### Create Contact
 ```http
 POST /contacts
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "firstName": "John",
   "lastName": "Doe",
   "email": "john@example.com",
   "phone": "+1234567890",
   "company": "Example Corp"
 }
 ```
 
 #### Update Contact
 ```http
 PUT /contacts/:id
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "firstName": "Jane",
   "lastName": "Doe",
   "email": "jane@example.com"
 }
 ```
 
 #### Delete Contact
 ```http
 DELETE /contacts/:id
 Authorization: Bearer <token>
 ```
 
 #### Upload Contacts (CSV)
 ```http
 POST /contacts/upload
 Authorization: Bearer <token>
 Content-Type: multipart/form-data
 ```
 
 **Request Body:**
 - `file`: CSV file with contact data
 
 **CSV Format:**
 ```csv
 firstName,lastName,email,phone,company
 John,Doe,john@example.com,+1234567890,Example Corp
 Jane,Smith,jane@example.com,+0987654321,Test Inc
 ```
 
 ### Template Endpoints
 
 #### Get All Templates
 ```http
 GET /templates
 Authorization: Bearer <token>
 ```
 
 **Response:**
 ```json
 [
   {
     "_id": "template-id",
     "name": "Welcome Email",
     "subject": "Welcome to our service!",
     "body": "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
     "createdBy": "user-id",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
 ]
 ```
 
 #### Create Template
 ```http
 POST /templates
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "name": "Welcome Email",
   "subject": "Welcome to our service!",
   "body": "<h1>Welcome!</h1><p>Thank you for joining us.</p>"
 }
 ```
 
 #### Update Template
 ```http
 PUT /templates/:id
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "name": "Updated Welcome Email",
   "subject": "Welcome to our updated service!",
   "body": "<h1>Welcome!</h1><p>Thank you for joining our updated service.</p>"
 }
 ```
 
 #### Delete Template
 ```http
 DELETE /templates/:id
 Authorization: Bearer <token>
 ```
 
 ### Campaign Endpoints
 
 #### Get All Campaigns
 ```http
 GET /campaigns
 Authorization: Bearer <token>
 ```
 
 **Response:**
 ```json
 [
   {
     "_id": "campaign-id",
     "name": "Welcome Campaign",
     "subject": "Welcome to our service!",
     "status": "draft",
     "scheduledAt": "2024-01-01T10:00:00.000Z",
     "sentAt": null,
     "template": {
       "_id": "template-id",
       "name": "Welcome Email",
       "subject": "Welcome to our service!",
       "body": "<h1>Welcome!</h1><p>Thank you for joining us.</p>"
     },
     "contacts": [
       {
         "_id": "contact-id",
         "firstName": "John",
         "lastName": "Doe",
         "email": "john@example.com"
       }
     ],
     "createdBy": "user-id",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
 ]
 ```
 
 #### Get Campaign by ID
 ```http
 GET /campaigns/:id
 Authorization: Bearer <token>
 ```
 
 #### Create Campaign
 ```http
 POST /campaigns
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "name": "Welcome Campaign",
   "subject": "Welcome to our service!",
   "template": "template-id",
   "contacts": ["contact-id-1", "contact-id-2"],
   "scheduledAt": "2024-01-01T10:00:00.000Z"
 }
 ```
 
 #### Update Campaign
 ```http
 PUT /campaigns/:id
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "name": "Updated Welcome Campaign",
   "subject": "Welcome to our updated service!",
   "template": "new-template-id",
   "contacts": ["contact-id-3", "contact-id-4"]
 }
 ```
 
 #### Delete Campaign
 ```http
 DELETE /campaigns/:id
 Authorization: Bearer <token>
 ```
 
 #### Send Campaign
 ```http
 POST /campaigns/:id/send
 Authorization: Bearer <token>
 ```
 
 **Response:**
 ```json
 {
   "message": "Campaign sent successfully",
   "results": {
     "successful": [
       {
         "to": "john@example.com",
         "messageId": "aws-message-id"
       }
     ],
     "failed": [],
     "unsubscribed": 0
   }
 }
 ```
 
 ### AWS Settings Endpoints
 
 #### Get AWS Settings
 ```http
 GET /aws-settings
 Authorization: Bearer <token>
 ```
 
 **Response:**
 ```json
 {
   "_id": "aws-settings-id",
   "accessKeyId": "AKIA...",
   "secretAccessKey": "***hidden***",
   "region": "us-east-1",
   "fromEmail": "noreply@example.com",
   "fromName": "Example Corp",
   "isVerified": true,
   "userId": "user-id",
   "createdAt": "2024-01-01T00:00:00.000Z"
 }
 ```
 
 #### Create/Update AWS Settings
 ```http
 POST /aws-settings
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "accessKeyId": "AKIA...",
   "secretAccessKey": "your-secret-key",
   "region": "us-east-1",
   "fromEmail": "noreply@example.com",
   "fromName": "Example Corp"
 }
 ```
 
 #### Verify AWS Settings
 ```http
 POST /aws-settings/verify
 Authorization: Bearer <token>
 ```
 
 **Response:**
 ```json
 {
   "message": "AWS settings verified successfully",
   "isVerified": true
 }
 ```
 
 ### Email Endpoints
 
 #### Get Email History
 ```http
 GET /email/history
 Authorization: Bearer <token>
 ```
 
 **Query Parameters:**
 - `page` (optional): Page number (default: 1)
 - `limit` (optional): Items per page (default: 10)
 - `status` (optional): Filter by status (sent, failed)
 - `type` (optional): Filter by type (single, bulk, test)
 
 **Response:**
 ```json
 {
   "emails": [
     {
       "_id": "email-log-id",
       "to": "john@example.com",
       "subject": "Welcome Email",
       "status": "sent",
       "messageId": "aws-message-id",
       "type": "single",
       "user": "user-id",
       "createdAt": "2024-01-01T00:00:00.000Z"
     }
   ],
   "pagination": {
     "currentPage": 1,
     "totalPages": 5,
     "totalItems": 50,
     "hasNext": true,
     "hasPrev": false
   }
 }
 ```
 
 #### Send Single Email
 ```http
 POST /email/send
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "to": "john@example.com",
   "subject": "Welcome Email",
   "html": "<h1>Welcome!</h1><p>Thank you for joining us.</p>"
 }
 ```
 
 **Response:**
 ```json
 {
   "message": "Email sent successfully",
   "messageId": "aws-message-id",
   "logId": "email-log-id"
 }
 ```
 
 #### Send Bulk Emails
 ```http
 POST /email/send-bulk
 Authorization: Bearer <token>
 ```
 
 **Request Body:**
 ```json
 {
   "recipients": ["john@example.com", "jane@example.com"],
   "subject": "Bulk Welcome Email",
   "html": "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
   "batchSize": 50
 }
 ```
 
 **Response:**
 ```json
 {
   "message": "Bulk email processing completed",
   "results": {
     "successful": [
       {
         "to": "john@example.com",
         "messageId": "aws-message-id"
       }
     ],
     "failed": [
       {
         "to": "jane@example.com",
         "error": "Email address is not verified",
         "errorType": "verification_required"
       }
     ]
   }
 }
 ```
 
 #### Send Test Email
 ```http
 POST /email/test
 Authorization: Bearer <token>
 ```
 
 **Response:**
 ```json
 {
   "message": "Test email sent successfully",
   "messageId": "aws-message-id",
   "logId": "email-log-id"
 }
 ```
 
 #### Unsubscribe Page (Public)
 ```http
 GET /email/unsubscribe
 ```
 
 **Query Parameters:**
 - `email`: Email address to unsubscribe
 - `userId`: User ID who sent the email
 
 **Response:** HTML page with unsubscribe confirmation
 
 #### Direct Unsubscribe (Public)
 ```http
 POST /email/direct-unsubscribe
 ```
 
 **Request Body:**
 ```json
 {
   "email": "john@example.com",
   "userId": "user-id",
   "reason": "Unsubscribed via email link"
 }
 ```
 
 **Response:** HTML success page
 
 #### Check Unsubscribe Status (Public)
 ```http
 GET /email/unsubscribe/status
 ```
 
 **Query Parameters:**
 - `email`: Email address to check
 - `userId`: User ID
 
 **Response:**
 ```json
 {
   "isUnsubscribed": true,
   "unsubscribedAt": "2024-01-01T00:00:00.000Z"
 }
 ```
 
 ---
 
 ## Data Models
 
 ### User
 ```json
 {
   "_id": "ObjectId",
   "email": "String (required, unique)",
   "password": "String (required, hashed)",
   "createdAt": "Date"
 }
 ```
 
 ### Contact
 ```json
 {
   "_id": "ObjectId",
   "firstName": "String",
   "lastName": "String",
   "email": "String (required)",
   "phone": "String",
   "company": "String",
   "createdBy": "ObjectId (ref: User)",
   "createdAt": "Date"
 }
 ```
 
 ### Template
 ```json
 {
   "_id": "ObjectId",
   "name": "String (required)",
   "subject": "String (required)",
   "body": "String (required, HTML)",
   "createdBy": "ObjectId (ref: User)",
   "createdAt": "Date"
 }
 ```
 
 ### Campaign
 ```json
 {
   "_id": "ObjectId",
   "name": "String (required)",
   "subject": "String (required)",
   "status": "String (enum: draft, sent)",
   "scheduledAt": "Date",
   "sentAt": "Date",
   "template": "ObjectId (ref: Template)",
   "contacts": ["ObjectId (ref: Contact)"],
   "createdBy": "ObjectId (ref: User)",
   "createdAt": "Date"
 }
 ```
 
 ### AWS Settings
 ```json
 {
   "_id": "ObjectId",
   "accessKeyId": "String (required)",
   "secretAccessKey": "String (required)",
   "region": "String (required)",
   "fromEmail": "String (required)",
   "fromName": "String (optional)",
   "isVerified": "Boolean (default: false)",
   "userId": "ObjectId (ref: User)",
   "createdAt": "Date"
 }
 ```
 
 ### Email Log
 ```json
 {
   "_id": "ObjectId",
   "to": "String (required)",
   "subject": "String (required)",
   "status": "String (enum: sent, failed)",
   "messageId": "String",
   "error": "String",
   "type": "String (enum: single, bulk, test)",
   "campaignId": "ObjectId (ref: Campaign)",
   "user": "ObjectId (ref: User)",
   "createdAt": "Date"
 }
 ```
 
 ### Unsubscribe
 ```json
 {
   "_id": "ObjectId",
   "email": "String (required)",
   "userId": "ObjectId (ref: User)",
   "reason": "String",
   "unsubscribedAt": "Date"
 }
 ```
 
 ---
 
 ## Environment Variables
 
 Create a `.env` file in the server directory:
 
 ```env
 PORT=5000
 MONGODB_URI=mongodb://localhost:27017/email-crm
 JWT_SECRET=your-jwt-secret-key
 BACKEND_URL=http://localhost:5000
 FRONTEND_URL=http://localhost:3000
 ```
 
 ---
 
 ## Rate Limiting
 
 - Authentication endpoints: 5 requests per minute
 - Email sending: 10 requests per minute
 - Other endpoints: 100 requests per minute
 
 ---
 
 ## Security Features
 
 - JWT-based authentication
 - Password hashing with bcrypt
 - Input validation with express-validator
 - CORS enabled
 - Rate limiting
 - AWS SES integration for secure email delivery
 
 ---
 
 ## Testing
 
 You can test the API using tools like:
 - Postman
 - Insomnia
 - curl
 - Thunder Client (VS Code extension)
 
 Example curl command:
 ```bash
 curl -X POST http://localhost:5000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"user@example.com","password":"password123"}'
 ``` 