import { NextRequest, NextResponse } from 'next/server';
import { congressService } from '@/backend/services/congress';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query = searchParams.get('q');
    const congress = searchParams.get('congress');
    const billType = searchParams.get('billType');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build search parameters
    const params: any = {};
    
    if (congress) params.congress = parseInt(congress);
    if (billType) params.billType = billType;
    if (limit) params.limit = parseInt(limit);
    if (offset) params.offset = parseInt(offset);

    // If query is provided, search by text (limited functionality)
    if (query) {
      const results = await congressService.searchBillsByText(query, params);
      return NextResponse.json(results);
    }

    // Otherwise, get recent bills
    const results = await congressService.searchBills(params);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Federal bill search error:', error);
    return NextResponse.json(
      { error: 'Failed to search federal bills', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
