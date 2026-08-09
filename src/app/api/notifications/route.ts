import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications } from '@/lib/services/notification-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'usr-citizen-01';

    const notifications = await getUserNotifications(userId);

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_NOTIFICATIONS_ERROR',
          message: error.message || 'Failed to fetch user notifications.',
        },
      },
      { status: 500 }
    );
  }
}
