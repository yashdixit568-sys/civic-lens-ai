import { NextRequest, NextResponse } from 'next/server';
import { getComplaints, createComplaint } from '@/lib/services/complaint-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const category = searchParams.get('category') as any;
    const departmentCode = searchParams.get('departmentCode') || undefined;
    const ward = searchParams.get('ward') || undefined;
    const citizenId = searchParams.get('citizenId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await getComplaints({
      status,
      category,
      departmentCode,
      ward,
      citizenId,
      page,
      limit,
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
          code: 'FETCH_COMPLAINTS_ERROR',
          message: error.message || 'Failed to fetch complaints from database.',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.category || !body.location?.address) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Missing required complaint fields (title, category, location.address).',
          },
        },
        { status: 400 }
      );
    }

    const complaint = await createComplaint(body);

    return NextResponse.json(
      {
        success: true,
        data: complaint,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_COMPLAINT_ERROR',
          message: error.message || 'Failed to create complaint in database.',
        },
      },
      { status: 500 }
    );
  }
}
