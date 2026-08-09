import { NextRequest, NextResponse } from 'next/server';
import { voteComplaint } from '@/lib/services/complaint-service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || 'usr-citizen-01';

    const updated = await voteComplaint(params.id, userId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VOTE_ERROR',
          message: error.message || 'Failed to register vote.',
        },
      },
      { status: 500 }
    );
  }
}
