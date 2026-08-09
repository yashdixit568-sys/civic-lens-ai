import { NextRequest, NextResponse } from 'next/server';
import { addComment } from '@/lib/services/complaint-service';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { content, userId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONTENT',
            message: 'Comment content cannot be empty.',
          },
        },
        { status: 400 }
      );
    }

    const updated = await addComment(params.id, content, userId || 'usr-citizen-01');

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ADD_COMMENT_ERROR',
          message: error.message || 'Failed to add comment.',
        },
      },
      { status: 400 }
    );
  }
}
