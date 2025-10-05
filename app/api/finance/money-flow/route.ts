import { NextRequest, NextResponse } from 'next/server';
import { fecService } from '@/backend/services/fec';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const candidateId = searchParams.get('candidate_id');
    const cycle = searchParams.get('cycle');

    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidate_id is required' },
        { status: 400 }
      );
    }

    const results = await fecService.getMoneyFlowData(
      candidateId,
      cycle ? parseInt(cycle) : 2024
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Money flow error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch money flow data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
