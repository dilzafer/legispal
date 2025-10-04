import { NextRequest, NextResponse } from 'next/server';
import { openStatesService } from '@/backend/services/openstates';

export async function GET(
  request: NextRequest,
  { params }: { params: { billId: string } }
) {
  try {
    // Decode the bill ID in case it was URL encoded
    const billId = decodeURIComponent(params.billId);

    // Check if it's an OCD ID format
    if (billId.startsWith('ocd-bill/')) {
      const bill = await openStatesService.getBillById(billId);
      return NextResponse.json(bill);
    }

    // Otherwise, expect jurisdiction/session/identifier format
    const pathParts = billId.split('_');
    if (pathParts.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid bill ID format. Use ocd-bill/ID or jurisdiction_session_identifier' },
        { status: 400 }
      );
    }

    const [jurisdiction, session, identifier] = pathParts;
    const bill = await openStatesService.getBillByIdentifier(
      jurisdiction,
      session,
      identifier
    );

    return NextResponse.json(bill);
  } catch (error) {
    console.error('Bill detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
