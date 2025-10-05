import { NextRequest, NextResponse } from 'next/server';
import { fecService } from '@/backend/services/fec';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const q = searchParams.get('q');
    const office = searchParams.get('office') as 'H' | 'S' | 'P' | null;
    const state = searchParams.get('state');
    const party = searchParams.get('party');
    const cycle = searchParams.get('cycle');
    const perPage = searchParams.get('per_page');

    const params: any = {};
    if (q) params.q = q;
    if (office) params.office = office;
    if (state) params.state = state;
    if (party) params.party = party;
    if (cycle) params.cycle = parseInt(cycle);
    if (perPage) params.per_page = parseInt(perPage);

    const results = await fecService.searchCandidates(params);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Candidate search error:', error);
    return NextResponse.json(
      { error: 'Failed to search candidates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
