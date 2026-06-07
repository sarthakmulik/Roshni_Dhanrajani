import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    // Default sender or from vault/secrets
    const senderEmail = Deno.env.get('SENDER_EMAIL') || 'onboarding@resend.dev'
    const testRecipient = Deno.env.get('TEST_RECIPIENT') || 'sarthakmulik16@gmail.com'
    const testMode = Deno.env.get('TEST_MODE') !== 'false' // Default to true if not explicitly set to 'false'

    if (!resendApiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable.')
    }

    const payload = await req.json()
    console.log('Received Webhook Payload:', JSON.stringify(payload))

    const { type, table, record, old_record } = payload

    if (table !== 'bookings') {
      return new Response(JSON.stringify({ message: 'Ignore non-bookings table' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Initialize Supabase Client with service key to query events bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch Event details
    const eventId = record.event_id
    let eventDetails = null

    if (eventId) {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('title, date, location, price')
        .eq('id', eventId)
        .single()

      if (eventError) {
        console.error('Error fetching event details:', eventError)
      } else {
        eventDetails = event
      }
    }

    const eventTitle = eventDetails?.title || 'Studio Session'
    const rawDate = eventDetails?.date ? new Date(eventDetails.date) : null
    
    // Format date elegantly (e.g., Saturday, June 6, 2026 - 7:00 PM)
    const formattedDate = rawDate
      ? rawDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata', // Set to target studio timezone
        }) + ' (IST)'
      : 'To Be Announced'

    const eventLocation = eventDetails?.location || 'Pulse It Out Studio'
    const totalPrice = record.total_price ? `₹${Number(record.total_price).toLocaleString('en-IN')}` : 'Free'

    // Determine recipient emails
    let customerEmail = record.email
    let adminEmail = 'dhanrajaniroshni29@gmail.com'

    // Route to test recipient if testMode is active or if we are using the Resend sandbox domain
    if (testMode || senderEmail.includes('onboarding@resend.dev')) {
      console.log(`[TEST MODE ACTIVE] Redirecting emails from customer (${customerEmail}) and admin (${adminEmail}) to test address: ${testRecipient}`)
      customerEmail = testRecipient
      adminEmail = testRecipient
    }

    // Determine what action to take
    let shouldSendClient = false
    let shouldSendAdmin = false
    let emailSubject = ''
    let emailHtml = ''

    if (type === 'INSERT') {
      // 1. New Booking Created
      shouldSendClient = true
      shouldSendAdmin = true
      emailSubject = `Booking Received: ${eventTitle} - Pulse It Out`
      emailHtml = getEmailTemplate({
        title: 'Booking Received',
        subtitle: 'We have received your registration details.',
        status: 'Pending Confirmation',
        statusColor: '#D97706', // Warm amber
        greeting: `Hello ${record.full_name},`,
        intro: `Thank you for booking a session with us. We have received your registration for <strong>${eventTitle}</strong> and it is currently pending confirmation.`,
        eventTitle,
        eventDate: formattedDate,
        eventLocation,
        participants: record.participants,
        totalPrice,
        showGuidelines: true,
        buttonText: 'View Studio Site',
        buttonUrl: 'https://pulseitout.com', // Replace with production URL if needed
      })
    } else if (type === 'UPDATE') {
      // 2. Booking Status Updated
      const statusChanged = record.status !== old_record.status

      if (statusChanged) {
        if (record.status === 'confirmed') {
          shouldSendClient = true
          emailSubject = `Booking Confirmed! ${eventTitle} - Pulse It Out`
          emailHtml = getEmailTemplate({
            title: 'Booking Confirmed',
            subtitle: 'Your spot is officially reserved. We look forward to seeing you!',
            status: 'Confirmed',
            statusColor: '#15803D', // Forest green
            greeting: `Hello ${record.full_name},`,
            intro: `We are pleased to confirm your booking for <strong>${eventTitle}</strong>. Your spots are reserved and we are preparing the studio for your arrival.`,
            eventTitle,
            eventDate: formattedDate,
            eventLocation,
            participants: record.participants,
            totalPrice,
            showGuidelines: true,
            buttonText: 'Add to Calendar',
            buttonUrl: 'https://pulseitout.com',
          })
        } else if (record.status === 'cancelled') {
          shouldSendClient = true
          emailSubject = `Booking Cancelled: ${eventTitle} - Pulse It Out`
          emailHtml = getEmailTemplate({
            title: 'Booking Cancelled',
            subtitle: 'Your booking has been cancelled.',
            status: 'Cancelled',
            statusColor: '#B91C1C', // Deep red
            greeting: `Hello ${record.full_name},`,
            intro: `This email confirms that your booking for <strong>${eventTitle}</strong> has been cancelled. If this was a mistake or you wish to reschedule, please get in touch with us.`,
            eventTitle,
            eventDate: formattedDate,
            eventLocation,
            participants: record.participants,
            totalPrice,
            showGuidelines: false,
            buttonText: 'Book Another Session',
            buttonUrl: 'https://pulseitout.com',
          })
        }
      }
    }

    // Call Resend to send Customer Email
    if (shouldSendClient && emailHtml) {
      console.log(`Sending client email to: ${customerEmail} (Subject: ${emailSubject})`)
      const clientRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `Pulse It Out <${senderEmail}>`,
          to: [customerEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      })

      if (!clientRes.ok) {
        const errText = await clientRes.text()
        console.error('Failed to send client email via Resend:', errText)
      } else {
        console.log('Client email successfully sent.')
      }
    }

    // Call Resend to send Admin Notification (Only on new inserts)
    if (shouldSendAdmin) {
      const adminSubject = `🚨 New Booking Alert: ${record.full_name} - ${eventTitle}`
      const adminHtml = getAdminEmailTemplate({
        customerName: record.full_name,
        customerEmail: record.email,
        customerPhone: record.phone || 'N/A',
        eventTitle,
        eventDate: formattedDate,
        participants: record.participants,
        totalPrice,
        notes: record.notes || 'None',
        hearAboutUs: record.hear_about_us || 'Not specified',
      })

      console.log(`Sending admin notification email to: ${adminEmail}`)
      const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `Pulse It Out System <${senderEmail}>`,
          to: [adminEmail],
          subject: adminSubject,
          html: adminHtml,
        }),
      })

      if (!adminRes.ok) {
        const errText = await adminRes.text()
        console.error('Failed to send admin notification email via Resend:', errText)
      } else {
        console.log('Admin notification email successfully sent.')
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Webhook Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// =========================================================================
// HTML EMAIL TEMPLATE CREATORS
// =========================================================================

interface TemplateArgs {
  title: string
  subtitle: string
  status: string
  statusColor: string
  greeting: string
  intro: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  participants: number
  totalPrice: string
  showGuidelines: boolean
  buttonText: string
  buttonUrl: string
}

function getEmailTemplate(args: TemplateArgs): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${args.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #FAF8F6;
      color: #2C2420;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #FAF8F6;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #EAE2DB;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(44, 36, 32, 0.04);
    }
    .header {
      background-color: #2C2420;
      color: #FFFFFF;
      padding: 40px 30px;
      text-align: center;
    }
    .logo-text {
      font-size: 26px;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin: 0 0 10px 0;
      color: #C5A880;
    }
    .subtitle {
      font-size: 14px;
      color: #EAE2DB;
      letter-spacing: 0.05em;
      margin: 0;
      font-weight: 300;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 15px;
      color: #2C2420;
    }
    .paragraph {
      font-size: 15px;
      line-height: 1.6;
      color: #5C524D;
      margin-bottom: 25px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 20px;
      letter-spacing: 0.05em;
      margin-bottom: 25px;
    }
    .card {
      background-color: #FDFBF9;
      border: 1px solid #F0EAE4;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 30px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 18px;
      border-bottom: 1px solid #F0EAE4;
      padding-bottom: 10px;
      color: #2C2420;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }
    .detail-label {
      color: #8C827A;
      font-weight: 500;
      width: 120px;
      flex-shrink: 0;
    }
    .detail-value {
      color: #2C2420;
      font-weight: 500;
      text-align: right;
      flex-grow: 1;
    }
    .divider {
      height: 1px;
      background-color: #F0EAE4;
      margin: 30px 0;
    }
    .guidelines-title {
      font-size: 14px;
      font-weight: 600;
      color: #2C2420;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .guideline-item {
      font-size: 14px;
      color: #5C524D;
      margin-bottom: 8px;
      line-height: 1.5;
    }
    .button-container {
      text-align: center;
      margin: 35px 0 10px 0;
    }
    .btn {
      background-color: #C5A880;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 12px 30px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      display: inline-block;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .footer {
      background-color: #FAF8F6;
      border-top: 1px solid #EAE2DB;
      padding: 30px;
      text-align: center;
      font-size: 12px;
      color: #8C827A;
      line-height: 1.5;
    }
    .footer a {
      color: #C5A880;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="logo-text">Pulse It Out</h1>
        <p class="subtitle">Mindful Pilates & Movement Studio</p>
      </div>
      <div class="content">
        <div class="status-badge" style="background-color: ${args.statusColor}20; color: ${args.statusColor};">
          ${args.status}
        </div>
        <h2 class="greeting">${args.greeting}</h2>
        <p class="paragraph">${args.intro}</p>
        
        <div class="card">
          <h3 class="card-title">Reservation Details</h3>
          <div class="detail-row">
            <div class="detail-label">Session</div>
            <div class="detail-value">${args.eventTitle}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Date & Time</div>
            <div class="detail-value">${args.eventDate}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Location</div>
            <div class="detail-value">${args.eventLocation}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Participants</div>
            <div class="detail-value">${args.participants} spot(s)</div>
          </div>
          <div class="detail-row" style="margin-bottom: 0;">
            <div class="detail-label">Total Price</div>
            <div class="detail-value" style="color: #C5A880; font-weight: 700;">${args.totalPrice}</div>
          </div>
        </div>

        ${
          args.showGuidelines
            ? `
        <div class="divider"></div>
        <h4 class="guidelines-title">Studio Guidelines</h4>
        <div class="guideline-item">🧘 Please arrive 5–10 minutes before the session to settle in.</div>
        <div class="guideline-item">👟 Wear comfortable athletic clothing suitable for pilates.</div>
        <div class="guideline-item">💧 Bring a water bottle. We provide mats and grip socks are recommended.</div>
        `
            : ''
        }

        <div class="button-container">
          <a href="${args.buttonUrl}" class="btn">${args.buttonText}</a>
        </div>
      </div>
      <div class="footer">
        <p>You received this email because you registered for a session at Pulse It Out.</p>
        <p>© 2026 Pulse It Out. All rights reserved.</p>
        <p>Need help? Contact us at <a href="mailto:info@pulseitout.com">info@pulseitout.com</a> or visit our website.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

interface AdminTemplateArgs {
  customerName: string
  customerEmail: string
  customerPhone: string
  eventTitle: string
  eventDate: string
  participants: number
  totalPrice: string
  notes: string
  hearAboutUs: string
}

function getAdminEmailTemplate(args: AdminTemplateArgs): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Alert</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #F3F4F6;
      color: #1F2937;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    .grid {
      margin-bottom: 25px;
    }
    .row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #F3F4F6;
    }
    .label {
      width: 150px;
      font-weight: 600;
      color: #4B5563;
    }
    .value {
      flex-grow: 1;
      color: #111827;
    }
    .notes-box {
      background-color: #F9FAFB;
      border: 1px solid #F3F4F6;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 25px;
      font-style: italic;
      color: #374151;
    }
    .btn {
      display: inline-block;
      background-color: #2C2420;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 10px 20px;
      font-weight: 600;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">🚨 New Booking Received</h1>
    </div>
    <div class="grid">
      <div class="row">
        <div class="label">Client Name</div>
        <div class="value">${args.customerName}</div>
      </div>
      <div class="row">
        <div class="label">Client Email</div>
        <div class="value">${args.customerEmail}</div>
      </div>
      <div class="row">
        <div class="label">Client Phone</div>
        <div class="value">${args.customerPhone}</div>
      </div>
      <div class="row">
        <div class="label">Session</div>
        <div class="value">${args.eventTitle}</div>
      </div>
      <div class="row">
        <div class="label">Session Date</div>
        <div class="value">${args.eventDate}</div>
      </div>
      <div class="row">
        <div class="label">Spots Booked</div>
        <div class="value">${args.participants}</div>
      </div>
      <div class="row">
        <div class="label">Amount Paid</div>
        <div class="value">${args.totalPrice}</div>
      </div>
      <div class="row">
        <div class="label">How they heard</div>
        <div class="value">${args.hearAboutUs}</div>
      </div>
    </div>
    
    <div class="label" style="margin-bottom: 8px;">Client Notes:</div>
    <div class="notes-box">
      "${args.notes}"
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://pulseitout.com/admin/bookings" class="btn">Manage Bookings in Dashboard</a>
    </div>
  </div>
</body>
</html>
  `
}
