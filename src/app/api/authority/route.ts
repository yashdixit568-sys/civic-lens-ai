import { NextRequest, NextResponse } from 'next/server';
import { getComplaints } from '@/lib/services/complaint-service';
import {
  assignEngineerToComplaint,
  updateComplaintStatus,
  submitResolutionProof,
  reopenComplaint,
} from '@/lib/services/authority-service';
import { Status } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ward = searchParams.get('ward') || undefined;
    const departmentCode = searchParams.get('departmentCode') || undefined;

    const result = await getComplaints({
      ward: ward === 'ALL' ? undefined : ward,
      departmentCode: departmentCode === 'ALL' ? undefined : departmentCode,
      limit: 100,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTHORITY_QUEUE_ERROR',
          message: error.message || 'Failed to fetch authority priority queue.',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, complaintId, engineerName, status, note, afterImageUrl, officialNotes, reason } = body;

    if (!complaintId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Both complaintId and action are required.',
          },
        },
        { status: 400 }
      );
    }

    let updatedComplaint;

    switch (action) {
      case 'ASSIGN_ENGINEER':
        if (!engineerName) throw new Error('engineerName is required for ASSIGN_ENGINEER action.');
        updatedComplaint = await assignEngineerToComplaint(complaintId, engineerName);
        break;

      case 'UPDATE_STATUS':
        if (!status) throw new Error('status is required for UPDATE_STATUS action.');
        updatedComplaint = await updateComplaintStatus(complaintId, status as Status, 'Authority Officer', note);
        break;

      case 'SUBMIT_PROOF':
        if (!afterImageUrl || !officialNotes) throw new Error('afterImageUrl and officialNotes are required.');
        updatedComplaint = await submitResolutionProof({
          complaintId,
          afterImageUrl,
          officialNotes,
        });
        break;

      case 'REOPEN_COMPLAINT':
        if (!reason) throw new Error('reason is required for REOPEN_COMPLAINT action.');
        updatedComplaint = await reopenComplaint(complaintId, reason);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNSUPPORTED_ACTION',
              message: `Action ${action} is not supported.`,
            },
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: updatedComplaint,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTHORITY_ACTION_ERROR',
          message: error.message || 'Failed to execute authority operation.',
        },
      },
      { status: 400 }
    );
  }
}
