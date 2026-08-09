import { NextRequest, NextResponse } from 'next/server';
import { getComplaintById } from '@/lib/services/complaint-service';
import { updateComplaintStatus } from '@/lib/services/authority-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const complaint = await getComplaintById(params.id);
    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Complaint ${params.id} not found.`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: complaint,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_COMPLAINT_ERROR',
          message: error.message || 'Failed to retrieve complaint detail.',
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, actorName, note } = body;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Status field is required for status transition.',
          },
        },
        { status: 400 }
      );
    }

    const updated = await updateComplaintStatus(params.id, status, actorName, note);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_COMPLAINT_ERROR',
          message: error.message || 'Failed to update complaint status.',
        },
      },
      { status: 400 }
    );
  }
}
