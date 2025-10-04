import { NextRequest, NextResponse } from 'next/server';
import { openStatesService } from '@/backend/services/openstates';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query = searchParams.get('q');
    const jurisdiction = searchParams.get('jurisdiction');
    const session = searchParams.get('session');
    const page = searchParams.get('page');
    const perPage = searchParams.get('per_page');

    // OpenStates API requires either jurisdiction OR q parameter
    // For best results, we should have both
    if (!query && !jurisdiction) {
      return NextResponse.json(
        { error: 'Must provide either a search query (q) or jurisdiction' },
        { status: 400 }
      );
    }

    // Build search parameters
    const params: any = {};
    
    if (query) params.q = query;
    if (jurisdiction) params.jurisdiction = jurisdiction;
    if (session) params.session = session;
    if (page) params.page = parseInt(page);
    if (perPage) params.per_page = parseInt(perPage);

    // If only query is provided without jurisdiction, default to California
    // (OpenStates works better with a jurisdiction specified)
    if (query && !jurisdiction) {
      params.jurisdiction = 'California';
    }

    const results = await openStatesService.searchBills(params);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Bill search error:', error);
    return NextResponse.json(
      { error: 'Failed to search bills', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
