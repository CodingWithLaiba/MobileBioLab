import nodemailer from "nodemailer";

let cachedTransporter: nodemailer.Transporter | null = null;

function ensureEmailConfig() {
  const requiredVars = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM",
  ] as const;

  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Email sending is not configured. Missing environment variables: ${missing.join(
        ", "
      )}.`
    );
  }

  const port = Number(process.env.SMTP_PORT);
  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT must be a valid number.");
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });
  }

  return cachedTransporter;
}

export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html: string;
}) {
  const transporter = ensureEmailConfig();
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
}

export async function sendSampleShareEmail(options: {
  recipientEmail: string;
  senderName: string;
  sampleId: string;
  sampleType: string;
  shareUrl: string;
  collectionDate: string;
  location?: string;
}) {
  const {
    recipientEmail,
    senderName,
    sampleId,
    sampleType,
    shareUrl,
    collectionDate,
    location,
  } = options;

  const subject = `Sample Data Shared: ${sampleId}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Sample Data Shared</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .sample-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: white; color: black; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { background: #64748b; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Mobile Bio Lab - Sample Data Shared</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p><strong>${senderName}</strong> has shared sample data with you from the Mobile Bio Lab system.</p>
            
            <div class="sample-info">
              <h3>Sample Information</h3>
              <ul>
                <li><strong>Sample ID:</strong> ${sampleId}</li>
                <li><strong>Sample Type:</strong> ${sampleType.replace(
                  "_",
                  " "
                )}</li>
                <li><strong>Collection Date:</strong> ${collectionDate}</li>
                ${
                  location
                    ? `<li><strong>Location:</strong> ${location}</li>`
                    : ""
                }
              </ul>
            </div>

            <p>Click the button below to access the shared sample data:</p>
            <a href="${shareUrl}" class="button">View Sample Data</a>
                      </div>
          <div class="footer">
            <p>This email was sent from the Mobile Bio Lab system. If you have questions about this sample, please contact ${senderName} directly.</p>
            <p>© 2024 Mobile Bio Lab. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;



  try {
    const result = await sendMail({
      to: recipientEmail,
      subject,
      html,
      
    });
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendSlotReservationNotification(options: {
  recipientEmail: string;
  userName: string;
  status: string;
  slotDate: string;
  slotTime: string;
  location: string;
  notes?: string;
}) {
  const {
    recipientEmail,
    userName,
    status,
    slotDate,
    slotTime,
    location,
    notes,
  } = options;

  const subject = `Slot Reservation ${
    status.charAt(0).toUpperCase() + status.slice(1)
  }`;

  const statusColor =
    status === "approved"
      ? "#10b981"
      : status === "rejected"
      ? "#ef4444"
      : "#f59e0b";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Slot Reservation Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
          .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .reservation-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { background: #64748b; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚐 Mobile Bio Lab - Reservation Update</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Your slot reservation for the Mobile Bio Lab has been <span class="status-badge">${status.toUpperCase()}</span></p>
            
            <div class="reservation-info">
              <h3>Reservation Details</h3>
              <ul>
                <li><strong>Date:</strong> ${slotDate}</li>
                <li><strong>Time:</strong> ${slotTime}</li>
                <li><strong>Location:</strong> ${location}</li>
              </ul>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
            </div>

            ${
              status === "approved"
                ? `
              <p>Great news! Your reservation has been approved. Please be ready at the specified time and location.</p>
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Prepare your samples and equipment</li>
                <li>Ensure the location is accessible for the mobile lab</li>
                <li>Have your sample collection materials ready</li>
              </ul>
            `
                : status === "rejected"
                ? `
              <p>Unfortunately, your reservation could not be approved at this time. You can submit a new request for a different date or time.</p>
            `
                : ""
            }
          </div>
          <div class="footer">
            <p>This is an automated notification from the Mobile Bio Lab system.</p>
            <p>© 2024 Mobile Bio Lab. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Mobile Bio Lab - Reservation Update

Hello ${userName},

Your slot reservation for the Mobile Bio Lab has been ${status.toUpperCase()}.

Reservation Details:
- Date: ${slotDate}
- Time: ${slotTime}
- Location: ${location}
${notes ? `- Notes: ${notes}` : ""}

${
  status === "approved"
    ? `
Great news! Your reservation has been approved. Please be ready at the specified time and location.

Next Steps:
- Prepare your samples and equipment
- Ensure the location is accessible for the mobile lab
- Have your sample collection materials ready
`
    : status === "rejected"
    ? `
Unfortunately, your reservation could not be approved at this time. You can submit a new request for a different date or time.
`
    : ""
}

This is an automated notification from the Mobile Bio Lab system.
  `;

  try {
    const result = await sendMail({
      to: recipientEmail,
      subject,
      html,
      text,
    });
    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}
