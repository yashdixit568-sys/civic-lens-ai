import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('🌱 Triggering Database Auto-Seed...');

    // 1. Seed Departments
    const pwd = await prisma.department.upsert({
      where: { code: 'PWD' },
      update: {},
      create: {
        code: 'PWD',
        name: 'Public Works Department',
        description: 'Road infrastructure, pothole repairs, and bridge maintenance.',
        headOfficer: 'Er. Rajesh Varma (Chief Engineer)',
        contactEmail: 'pwd.helpdesk@civiclens.gov.in',
        contactPhone: '+91 11 2345 6789',
        slaHours: 48,
      },
    });

    const mc = await prisma.department.upsert({
      where: { code: 'MUNICIPAL_CORP' },
      update: {},
      create: {
        code: 'MUNICIPAL_CORP',
        name: 'Municipal Corporation Sanitation',
        description: 'Solid waste management, garbage collection, and street cleaning.',
        headOfficer: 'Dr. Sunita Sharma (Sanitation Commissioner)',
        contactEmail: 'sanitation@civiclens.gov.in',
        contactPhone: '+91 11 2345 8899',
        slaHours: 24,
      },
    });

    await prisma.department.upsert({
      where: { code: 'WATER' },
      update: {},
      create: {
        code: 'WATER',
        name: 'Water Supply & Sewerage Board',
        description: 'Potable water pipelines, sewage treatment, and pipe leaks.',
        headOfficer: 'Ir. Vikramaditya Roy',
        contactEmail: 'waterboards@civiclens.gov.in',
        contactPhone: '+91 11 2345 1122',
        slaHours: 36,
      },
    });

    await prisma.department.upsert({
      where: { code: 'ELECTRICITY' },
      update: {},
      create: {
        code: 'ELECTRICITY',
        name: 'Electricity & Public Lighting Dept',
        description: 'Streetlights, power transformers, and electric poles.',
        headOfficer: 'Er. Amit Kulkarni',
        contactEmail: 'powergrid@civiclens.gov.in',
        contactPhone: '+91 11 2345 3344',
        slaHours: 24,
      },
    });

    // 2. Seed Users
    const citizenUser = await prisma.user.upsert({
      where: { email: 'aarav.mehta@example.com' },
      update: {},
      create: {
        id: 'usr-citizen-01',
        name: 'Aarav Mehta',
        email: 'aarav.mehta@example.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'CITIZEN',
        reputationScore: 480,
        tier: 'GOLD',
      },
    });

    const authorityUser = await prisma.user.upsert({
      where: { email: 'rajesh.varma@pwd.gov.in' },
      update: {},
      create: {
        id: 'usr-auth-01',
        name: 'Officer Rajesh Varma',
        email: 'rajesh.varma@pwd.gov.in',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        role: 'AUTHORITY',
        reputationScore: 1250,
        tier: 'VERIFIED_REPORTER',
        departmentId: pwd.id,
      },
    });

    // 3. Seed Location & Complaint
    const loc1 = await prisma.location.create({
      data: {
        address: 'Main Market Road, Near St. Xavier School, Civil Lines',
        ward: 'Ward 2 (Civil Lines)',
        zone: 'Central Zone',
        latitude: 28.6145,
        longitude: 77.2095,
        nearHospital: true,
        nearSchool: true,
        trafficDensity: 'HIGH',
      },
    });

    const cmp1 = await prisma.complaint.create({
      data: {
        id: 'cmp-101',
        ticketId: 'TICK-PWD-8841',
        title: 'Deep Hazardous Pothole Near School Gate',
        description: 'A 2-foot wide hazardous crater has developed on the main dual carriageway right outside St. Xavier School entrance.',
        category: 'ROAD_DAMAGE',
        severity: 'CRITICAL',
        status: 'PENDING',
        priorityScore: 96,
        confidenceScore: 0.94,
        reportCount: 187,
        citizenId: citizenUser.id,
        departmentId: pwd.id,
        locationId: loc1.id,
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        aiAnalysis: {
          create: {
            detectedObject: 'Severe Pothole',
            visualSeverityScore: 92,
            impactAssessment: 'High collision risk for school buses.',
            riskLevel: 'CRITICAL',
            suggestedAction: 'Deploy patch crew.',
          },
        },
        history: {
          create: [
            {
              status: 'PENDING',
              actorName: 'Civic Lens AI Core',
              note: 'Complaint auto-classified as CRITICAL (Priority 96).',
            },
          ],
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: citizenUser.id,
        title: 'Report Received',
        message: 'Your report TICK-PWD-8841 was submitted successfully.',
        link: '/complaints/cmp-101',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: { citizenId: citizenUser.id, complaintId: cmp1.id },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SEED_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
