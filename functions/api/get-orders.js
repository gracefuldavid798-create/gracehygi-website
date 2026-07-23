/**
 * Cloudflare Pages Function — Get OEM Orders (Admin)
 * GET /api/get-orders?password=xxx
 *
 * Returns all orders from KV namespace "GRACEHYGI_ORDERS"
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Auth check
  const url = new URL(request.url);
  const password = url.searchParams.get('password') || '';
  const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'gracehygi2024';

  if (password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Unauthorized'
    }), { status: 401, headers });
  }

  try {
    if (env && env.GRACEHYGI_ORDERS) {
      const orders = await env.GRACEHYGI_ORDERS.get('orders', 'json') || [];
      return new Response(JSON.stringify({
        success: true,
        orders: orders.reverse(), // Newest first
        total: orders.length
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify({
      success: true,
      orders: [],
      total: 0,
      note: 'KV not configured. Orders are stored client-side only.'
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
