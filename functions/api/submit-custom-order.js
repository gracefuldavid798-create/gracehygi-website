/**
 * Cloudflare Pages Function — Submit Custom Order
 * POST /api/submit-custom-order
 *
 * Stores custom pad order in KV namespace "GRACEHYGI_ORDERS"
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();

    // Validate required fields (custom orders need name, email, size, chip, layer)
    const required = ['name', 'email'];
    for (const field of required) {
      if (!body[field]) {
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
      const existing = await env.GRACEHYGI_ORDERS.get('custom_orders', 'json') || [];
      existing.push(body);
      const trimmed = existing.slice(-500);
      await env.GRACEHYGI_ORDERS.put('custom_orders', JSON.stringify(trimmed));
    }

    return new Response(JSON.stringify({
      success: true,
      orderId: body.id,
      message: 'Custom order submitted successfully. We will contact you within 24 hours.'
    }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error: ' + err.message
    }), { status: 500, headers });
  }
}

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
  return `CUST-${ts}-${rand}`;
}
