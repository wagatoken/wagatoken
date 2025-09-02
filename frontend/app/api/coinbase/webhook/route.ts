import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { handleCoinbasePaymentWebhook, verifyCoinbaseWebhook } from '@/utils/coinbaseIntegration';

// Coinbase webhook secret - should be set in environment variables
const COINBASE_WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;

/**
 * Handle Coinbase Commerce webhooks
 * POST /api/coinbase/webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Get signature from headers
    const signature = request.headers.get('x-cc-webhook-signature');
    const timestamp = request.headers.get('x-cc-webhook-timestamp');

    if (!signature || !timestamp) {
      console.error('Missing webhook signature or timestamp');
      return NextResponse.json(
        { error: 'Missing signature or timestamp' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!COINBASE_WEBHOOK_SECRET) {
      console.error('Coinbase webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify signature using HMAC
    const expectedSignature = crypto
      .createHmac('sha256', COINBASE_WEBHOOK_SECRET)
      .update(timestamp + rawBody)
      .digest('hex');

    const receivedSignature = signature.replace('sha256=', '');

    if (receivedSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Process the webhook
    await handleCoinbasePaymentWebhook(body);

    // Return success response
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error processing Coinbase webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle preflight requests for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-cc-webhook-signature, x-cc-webhook-timestamp',
    },
  });
}
