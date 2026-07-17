import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, bookingId, service, artisan, date, time, price, status, trackingOrigin } = body;

    if (!email) {
      return Response.json({ success: false, error: "Recipient email is required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aumghodasara369@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || '',
      },
    });

    // Determine the base origin for tracking (passed from front-end or environment variable)
    const baseOrigin = trackingOrigin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const trackingLink = `${baseOrigin}/track?id=${bookingId}`;

    const mailOptions = {
      from: `"B-Smart Salon Notifications" <aumghodasara369@gmail.com>`,
      to: email,
      subject: `Your Booking is Confirmed! (Ref: ${bookingId})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Your Booking is Done!</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #080808; font-family: 'Montserrat', Helvetica, Arial, sans-serif; color: #f9f6f0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #080808; padding: 40px 20px;">
            <tr>
              <td align="center">
                <!-- Outer Container -->
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141414; border: 1px solid #b4523b; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td align="center" style="padding: 30px 40px; border-bottom: 1px solid #b4523b; background-color: #0c0c0c;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center" style="font-size: 24px; font-weight: bold; letter-spacing: 0.2em; color: #f9f6f0; font-family: 'Outfit', Arial, sans-serif;">
                            B-SMART <span style="color: #b4523b;">SALON</span>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-size: 10px; letter-spacing: 0.3em; color: #8f8680; text-transform: uppercase; padding-top: 5px;">
                            Premium Grooming Lounge
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Content Area -->
                  <tr>
                    <td style="padding: 40px 40px 30px 40px;">
                      <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: normal; text-transform: uppercase; letter-spacing: 0.1em; color: #f9f6f0; font-family: 'Outfit', Arial, sans-serif;">
                        Your Booking is Done!
                      </h2>
                      <p style="margin: 0 0 25px 0; font-size: 14px; line-height: 1.6; color: #ddd9d4;">
                        Hello <strong>${name}</strong>,<br><br>
                        We are pleased to confirm that your appointment session has been scheduled successfully. Here are the details of your booking:
                      </p>

                      <!-- Details Table -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; border-collapse: collapse;">
                        <tr>
                          <td width="35%" style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 13px; font-weight: bold; color: #8f8680; text-transform: uppercase;">Booking Reference</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 14px; color: #f9f6f0;">${bookingId}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 13px; font-weight: bold; color: #8f8680; text-transform: uppercase;">Service</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 14px; color: #f9f6f0;">${service}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 13px; font-weight: bold; color: #8f8680; text-transform: uppercase;">Artisan / Stylist</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 14px; color: #f9f6f0;">${artisan}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 13px; font-weight: bold; color: #8f8680; text-transform: uppercase;">Date</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 14px; color: #f9f6f0;">${date}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 13px; font-weight: bold; color: #8f8680; text-transform: uppercase;">Time Slot</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 14px; color: #f9f6f0;">${time}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 13px; font-weight: bold; color: #8f8680; text-transform: uppercase;">Amount Paid</td>
                          <td style="padding: 10px 0; border-bottom: 1px solid rgba(249, 246, 240, 0.1); font-size: 14px; color: #b4523b; font-weight: bold;">$${price}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0; font-size: 13px; font-weight: bold; color: #8f8680; text-transform: uppercase;">Booking Status</td>
                          <td style="padding: 10px 0; font-size: 14px; color: #34d399; font-weight: bold;">${status}</td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 30px 0; font-size: 14px; line-height: 1.6; color: #ddd9d4;">
                        You can track the progress of your appointment, adjust settings, or reschedule using our live booking tracker link.
                      </p>

                      <!-- Action Button -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                        <tr>
                          <td align="center">
                            <a href="${trackingLink}" target="_blank" style="display: inline-block; background-color: #9a422d; color: #f9f6f0; font-size: 12px; font-weight: bold; text-decoration: none; text-transform: uppercase; letter-spacing: 0.15em; padding: 16px 32px; border: 1px solid #b4523b; transition: all 0.3s ease;">
                              Track Your Status
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding: 30px 40px; background-color: #0c0c0c; border-top: 1px solid rgba(249, 246, 240, 0.05);">
                      <p style="margin: 0; font-size: 11px; color: #8f8680; line-height: 1.6; text-transform: uppercase; letter-spacing: 0.1em;">
                        B-Smart Salon, Inc. &bull; Exclusive Grooming Circle
                      </p>
                      <p style="margin: 5px 0 0 0; font-size: 10px; color: #555;">
                        This email was sent to ${email}. If you did not make this booking, please contact us.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // If GMAIL_APP_PASSWORD is not configured, we print to console or return success with a warning so development doesn't break.
    if (!process.env.GMAIL_APP_PASSWORD) {
      console.warn("WARNING: GMAIL_APP_PASSWORD is not set in environment variables. Email will not be sent to real inbox.");
      console.log("Email Details:", {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        trackingLink: trackingLink
      });
      return Response.json({ 
        success: true, 
        message: "Email logged to console (GMAIL_APP_PASSWORD environment variable missing)",
        previewUrl: "console",
        trackingLink: trackingLink
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Booking email notification sent: %s", info.messageId);

    return Response.json({ success: true, messageId: info.messageId, trackingLink: trackingLink });
  } catch (error) {
    console.error("Error sending email route handler:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
