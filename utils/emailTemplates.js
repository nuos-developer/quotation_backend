

const generateOtpEmailTemplate = (firstName, otp) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your One-Time Password (OTP)</title>
    <style>
      body {
        background-color: #f4f7fb;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        background-color: #ffffff;
        margin: 40px auto;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        overflow: hidden;
      }
      .header {
        background-color: #0f4c81;
        color: #ffffff;
        text-align: center;
        padding: 20px 10px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        letter-spacing: 1px;
      }
      .content {
        padding: 30px 40px;
        color: #333333;
        text-align: left;
      }
      .content h2 {
        font-size: 20px;
        color: #0f4c81;
      }
      .otp-box {
        text-align: center;
        background: #f0f4f8;
        border-radius: 8px;
        padding: 20px;
        margin: 25px 0;
      }
      .otp-code {
        font-size: 36px;
        letter-spacing: 4px;
        color: #0f4c81;
        font-weight: bold;
      }
      .footer {
        background-color: #f8f9fa;
        text-align: center;
        padding: 15px;
        font-size: 13px;
        color: #666;
      }
      .footer a {
        color: #0f4c81;
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>NUOS Home Home Automation</h1>
      </div>

      <div class="content">
        <h2>Welcome, ${firstName} !</h2>
        <p>
          You have started the registration process for NUOS Home Automation. Please verify your email address by entering the OTP below:
        </p>

        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>

        <p style="text-align:center;">
           This OTP is valid for <b>1 minutes</b>. Do not share it with anyone.
        </p>
        <p>Thank you,<br>
        <strong>NUOS Home Automation.</strong></p>
      </div>

      <div class="footer">
        NUOS Home Automation. All rights reserved.<br/>
        <a href="https://nuos.in">www.nuos.in</a>
      </div>
    </div>
  </body>
</html>
`;


const generateAdminRoleRequestTemplate = (
  userFullName,
  userEmail,
  mobileNumber,
  requestedRole
) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Role Request Submitted</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f7fb;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }
      .header {
        background-color: #0f4c81;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 30px 40px;
        color: #333333;
        line-height: 1.6;
      }
      .content p {
        margin: 8px 0;
      }
      .highlight-box {
        background: #f1f5f9;
        border-left: 4px solid #0f4c81;
        padding: 14px 18px;
        margin: 22px 0;
        border-radius: 6px;
      }
      .role-badge {
        display: inline-block;
        margin-top: 8px;
        padding: 6px 14px;
        background: #0f4c81;
        color: #ffffff;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
      }
      .footer {
        background-color: #f8f9fa;
        text-align: center;
        padding: 15px;
        font-size: 13px;
        color: #777777;
      }
      .footer a {
        color: #0f4c81;
        text-decoration: none;
        font-weight: 600;
      }
    </style>
  </head>

  <body>
    <div class="container">

      <!-- Header -->
      <div class="header">
        <h1>NUOS Home Automation</h1>
      </div>

      <!-- Content -->
      <div class="content">
        <p>Dear Admin,</p>

        <p>
          A new user has submitted a request to join 
          <strong>NUOS Home Automation</strong> with a specific role assignment.
        </p>

        <div class="highlight-box">
          <p><strong>User Name:</strong> ${userFullName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Mobile Number:</strong> ${mobileNumber}</p>

          <p style="margin-top:12px;">
            <strong>Requested Role:</strong>
          </p>
          <span class="role-badge">${requestedRole}</span>

          <p style="margin-top:12px;">
            <strong>Requested At:</strong> ${new Date().toLocaleString()}
          </p>
        </div>

        <p>
          Please review the user details and take appropriate action by approving
          or rejecting the role request through the admin panel.
        </p>

        <p>
          This request will remain pending until an action is taken.
        </p>

        <p>
          Best regards,<br />
          <strong>NUOS Home Automation System</strong>
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        &copy; ${new Date().getFullYear()} NUOS Home Automation. All rights reserved.<br/>
        <a href="https://nuos.in">www.nuos.in</a>
      </div>

    </div>
  </body>
</html>
`;


const generateForgotPasswordOtpTemplate = (firstName, otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset OTP</title>
</head>
<body style="background:#f4f7fb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:10px;padding:30px;">
    <h2 style="color:#0f4c81;">Hello ${firstName},</h2>

    <p>You requested to reset your NUOS account password.</p>

    <div style="text-align:center;margin:25px 0;">
      <span style="font-size:36px;letter-spacing:5px;font-weight:bold;color:#0f4c81;">
        ${otp}
      </span>
    </div>

    <p style="text-align:center;">
      This OTP is valid for <b>1 minute</b>.  
      Do not share it with anyone.
    </p>

    <p>If you did not request this, please ignore this email.</p>

    <p>Thanks,<br><b>NUOS Home Automation</b></p>
  </div>
</body>
</html>
`;

const generateAccessGrantedEmailTemplate = (
  firstName,
  roleName,
  modules = []
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Access Granted</title>
</head>

<body style="background:#f4f7fb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;
              border-radius:10px;padding:30px;">

    <h2 style="color:#0f4c81;">Hello ${firstName},</h2>

    <p>
      We’re happy to inform you that an administrator has 
      <b>granted you access</b> to the NUOS platform.
    </p>

    <p style="margin-top:20px;">
      <b>Your assigned role:</b>
    </p>

    <div style="text-align:center;margin:15px 0;">
      <span style="display:inline-block;background:#0f4c81;color:#ffffff;
                   padding:10px 25px;border-radius:6px;font-size:16px;">
        ${roleName}
      </span>
    </div>

    ${modules.length
    ? `
    <p style="margin-top:20px;">
      <b>Modules you can access:</b>
    </p>

    <ul style="margin:10px 0 20px 20px;">
      ${modules
      .map(
        m => `
        <li>
          <b>${m.module_name}</b> – 
          ${m.permissions.join(', ')}
        </li>`
      )
      .join('')}
    </ul>
    `
    : ''
  }

    <p>
      You can now log in and start using the platform based on the 
      permissions assigned to you.
    </p>

    <p style="margin-top:25px;">
      If you have any questions or believe this access was granted in error,
      please contact your administrator.
    </p>

    <p>
      Thanks,<br>
      <b>NUOS Home Automation</b>
    </p>

  </div>
</body>
</html>
`;





module.exports = { generateOtpEmailTemplate, generateAdminRoleRequestTemplate, generateForgotPasswordOtpTemplate, generateAccessGrantedEmailTemplate }