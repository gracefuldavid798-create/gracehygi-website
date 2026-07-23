/**
 * Cloudflare Pages Function — Submit OEM Order
 * POST /api/submit-order
 *
 * Stores order in KV namespace "GRACEHYGI_ORDERS"
 * Falls back to returning success (client will localStorage)
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();

    // Validate required fields
    const required = ['name', 'email', 'phone', 'country', 'sizes', 'topsheet'];
    for (const field of required) {
      if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
        return new Response(JSON.stringify({
          success: false,
          error: `Missing required field: ${field}`
        }), { status: 400, headers });
      }
    }

    // Add server-side metadata
    body.id = generateId();
    body.ip = request.headers.get('cf-connecting-ip') || 'unknown';
    body.userAgent = request.headers.get('user-agent') || 'unknown';
    body.submittedAt = new Date().toISOString();

    // Store in KV if available
    if (env && env.GRACEHYGI_ORDERS) {
      // Get existing orders
      const existing = await env.GRACEHYGI_ORDERS.get('orders', 'json') || [];
      existing.push(body);
      // Keep last 500 orders
      const trimmed = existing.slice(-500);
      await env.GRACEHYGI_ORDERS.put('orders', JSON.stringify(trimmed));
    }

    // Send email notification via Resend or similar if configured
    if (env && env.ADMIN_EMAIL) {
      try {
        await sendEmailNotification(body, env);
      } catch (e) {
        console.warn('Email notification failed:', e.message);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      orderId: body.id,
      message: 'Order submitted successfully. We will contact you within 24 hours.'
    }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error: ' + err.message
    }), { status: 500, headers });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

function generateId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `ORD-${ts}-${rand}`;
}

async function sendEmailNotification(data, env) {
  // If Resend API key is configured
  if (env.RESEND_API_KEY) {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Graceful International <noreply@gracehygi.com>',
        to: env.ADMIN_EMAIL,
        subject: `New OEM Order: ${data.name} from ${data.country}`,
        html: buildEmailHtml(data)
      })
    });
    return resp.ok;
  }
  return false;
}

function buildEmailHtml(data) {
  return `
    <h2>New OEM Custom Order</h2>
    <table style="border-collapse:collapse;width:100%">
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:6px;border:1px solid #ddd">${data.name}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:6px;border:1px solid #ddd">${data.email}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:6px;border:1px solid #ddd">${data.phone}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Company</td><td style="padding:6px;border:1px solid #ddd">${data.company || '-'}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Country</td><td style="padding:6px;border:1px solid #ddd">${data.country}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Sizes</td><td style="padding:6px;border:1px solid #ddd">${Array.isArray(data.sizes) ? data.sizes.join(', ') : data.sizes}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Top Sheet</td><td style="padding:6px;border:1px solid #ddd">${data.topsheet}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Bottom Film</td><td style="padding:6px;border:1px solid #ddd">${data.bottomfilm || '-'}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Chip</td><td style="padding:6px;border:1px solid #ddd">${data.chip || '-'}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Quantity</td><td style="padding:6px;border:1px solid #ddd">${data.quantity || '-'}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Message</td><td style="padding:6px;border:1px solid #ddd">${data.message || '-'}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Order ID</td><td style="padding:6px;border:1px solid #ddd">${data.id}</td></tr>
      <tr><td style="padding:6px;border:1px solid #ddd;font-weight:bold">Time</td><td style="padding:6px;border:1px solid #ddd">${data.submittedAt}</td></tr>
    </table>
  `;
}
