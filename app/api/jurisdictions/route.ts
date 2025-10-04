import { NextRequest, NextResponse } from 'next/server';
import { openStatesService } from '@/backend/services/openstates';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classification = searchParams.get('classification') as 'state' | 'municipality' | 'country' | null;

    const params: any = {};
    if (classification) params.classification = classification;

    const results = await openStatesService.getJurisdictions(params);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Jurisdictions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jurisdictions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
