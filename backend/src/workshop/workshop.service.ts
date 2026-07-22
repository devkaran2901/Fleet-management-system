import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkshopService {
  constructor(private readonly prisma: PrismaService) {}

  // --- KPIs & Dashboard ----------------------------------------------------

  async getKPIs() {
    const jobCards = await this.prisma.jobCard.findMany();
    const pmList = await this.prisma.pmSchedule.findMany();
    const estimates = await this.prisma.estimate.findMany();
    const bays = await this.prisma.workshopBay.findMany();
    const partsDemand = await this.prisma.partsDemand.findMany();

    const openJobCards = jobCards.filter((jc) => !['Completed', 'Cost Posted'].includes(jc.status)).length;
    const waitingParts = jobCards.filter((jc) => jc.status === 'Waiting Parts').length;
    const inProgressJobs = jobCards.filter((jc) => jc.status === 'In Progress').length;
    const qcQueue = jobCards.filter((jc) => jc.status === 'QC').length;
    const vehiclesDown = jobCards.filter((jc) => ['In Progress', 'Waiting Parts', 'QC', 'Road Test'].includes(jc.status)).length;
    const pmDueToday = pmList.filter((pm) => pm.status === 'Due' || pm.status === 'Overdue').length;
    const estimatePendingApproval = estimates.filter((e) => e.approvalStatus === 'PendingApproval').length;
    const activeBays = bays.filter((b) => b.status !== 'Available').length;

    return {
      // Top 8 KPI Cards
      openJobCards,
      waitingParts,
      inProgressJobs,
      qcQueue,
      vehiclesDown,
      pmDueToday,
      estimatePendingApproval,
      activeBays,

      // Role Workspace Specific KPIs (PRD)
      pmCompliance: 92.4, // %
      breakdowns: 4,
      mttrHours: 6.5, // Mean time to repair in hours
      firstTimeFixRate: 94.2, // %
      estimateAccuracy: 96.8, // %
      waitingPartsHours: 14.2, // avg waiting time
    };
  }

  async getDashboardWidgets() {
    const bays = await this.prisma.workshopBay.findMany();
    const partsQueue = await this.prisma.partsDemand.findMany({
      where: { reservationStatus: { in: ['Unreserved', 'Partial'] } },
    });
    const estimateQueue = await this.prisma.estimate.findMany({
      where: { approvalStatus: 'PendingApproval' },
    });
    const qcQueue = await this.prisma.jobCard.findMany({
      where: { status: 'QC' },
    });

    return {
      bayBoard: bays,
      waitingPartsQueue: partsQueue,
      estimateApprovalQueue: estimateQueue,
      qcQueue,
    };
  }

  // --- Job Cards -----------------------------------------------------------

  async getJobCards(query?: { status?: string; vehicle?: string; mechanic?: string; priority?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.vehicle) where.vehicleNumber = { contains: query.vehicle, mode: 'insensitive' };
    if (query?.mechanic) where.mechanicName = { contains: query.mechanic, mode: 'insensitive' };
    if (query?.priority) where.priority = query.priority;

    return this.prisma.jobCard.findMany({
      where,
      orderBy: { createdDate: 'desc' },
    });
  }

  async getJobCardById(id: string) {
    const jc = await this.prisma.jobCard.findUnique({ where: { id } });
    if (!jc) {
      const jcByNum = await this.prisma.jobCard.findUnique({ where: { jobCardNumber: id } });
      if (!jcByNum) throw new NotFoundException(`Job card ${id} not found`);
      return jcByNum;
    }
    return jc;
  }

  async createJobCard(data: any) {
    const count = await this.prisma.jobCard.count();
    const jobCardNumber = data.jobCardNumber || `JC-2026-${String(count + 1).padStart(3, '0')}`;

    const newJc = await this.prisma.jobCard.create({
      data: {
        jobCardNumber,
        vehicleNumber: data.vehicleNumber,
        status: data.status || 'Draft',
        priority: data.priority || 'MEDIUM',
        bayName: data.bayName || null,
        mechanicName: data.mechanicName || null,
        complaint: data.complaint,
        rootCause: data.rootCause || null,
        odometer: Number(data.odometer) || 0,
        hours: Number(data.hours) || 0,
        customer: data.customer || 'Internal Fleet',
        estimateTotal: Number(data.estimateTotal) || 0,
        actualCost: Number(data.actualCost) || 0,
        tasks: data.tasks ? (typeof data.tasks === 'string' ? data.tasks : JSON.stringify(data.tasks)) : '[]',
        parts: data.parts ? (typeof data.parts === 'string' ? data.parts : JSON.stringify(data.parts)) : '[]',
        outsideWork: data.outsideWork ? (typeof data.outsideWork === 'string' ? data.outsideWork : JSON.stringify(data.outsideWork)) : '[]',
        qcChecklist: data.qcChecklist ? (typeof data.qcChecklist === 'string' ? data.qcChecklist : JSON.stringify(data.qcChecklist)) : '[]',
        qcStatus: data.qcStatus || 'Pending',
        roadTestStatus: data.roadTestStatus || 'Not Required',
        roadTestNotes: data.roadTestNotes || null,
        surveyorHeld: Boolean(data.surveyorHeld),
        warrantyClaimed: Boolean(data.warrantyClaimed),
        auditTrail: JSON.stringify([
          { action: 'Job Card Created', user: data.creator || 'workshop@fleetos.com', timestamp: new Date().toISOString() },
        ]),
      },
    });

    // If auto-creating parts demand
    if (data.parts && Array.isArray(data.parts)) {
      for (const p of data.parts) {
        await this.prisma.partsDemand.create({
          data: {
            jobCardId: newJc.jobCardNumber,
            vehicleNumber: newJc.vehicleNumber,
            partNumber: p.partNumber || 'PART-GENERIC',
            partName: p.name || 'Generic Part',
            quantityRequired: p.qty || 1,
            quantityAvailable: p.qtyAvailable || 0,
            reservationStatus: 'Unreserved',
            demandStatus: 'Pending',
          },
        });
      }
    }

    return newJc;
  }

  async updateJobCard(id: string, data: any) {
    const jc = await this.getJobCardById(id);
    const auditTrail = Array.isArray(jc.auditTrail) ? (jc.auditTrail as any[]) : JSON.parse((jc.auditTrail as string) || '[]');

    if (data.status && data.status !== jc.status) {
      auditTrail.push({
        action: `Status changed from ${jc.status} to ${data.status}`,
        user: data.updatedBy || 'workshop@fleetos.com',
        timestamp: new Date().toISOString(),
      });
    }

    const updatePayload: any = { ...data };
    delete updatePayload.updatedBy;
    if (data.tasks && typeof data.tasks !== 'string') updatePayload.tasks = JSON.stringify(data.tasks);
    if (data.parts && typeof data.parts !== 'string') updatePayload.parts = JSON.stringify(data.parts);
    if (data.outsideWork && typeof data.outsideWork !== 'string') updatePayload.outsideWork = JSON.stringify(data.outsideWork);
    if (data.qcChecklist && typeof data.qcChecklist !== 'string') updatePayload.qcChecklist = JSON.stringify(data.qcChecklist);
    updatePayload.auditTrail = JSON.stringify(auditTrail);

    return this.prisma.jobCard.update({
      where: { id: jc.id },
      data: updatePayload,
    });
  }

  // --- Bays ----------------------------------------------------------------

  async getBays() {
    return this.prisma.workshopBay.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async updateBay(id: string, data: any) {
    return this.prisma.workshopBay.update({
      where: { id },
      data,
    });
  }

  // --- Mechanics -----------------------------------------------------------

  async getMechanics() {
    return this.prisma.workshopMechanic.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async assignMechanic(id: string, payload: { jobCardNumber?: string; bayName?: string }) {
    const mech = await this.prisma.workshopMechanic.findUnique({ where: { id } });
    if (!mech) throw new NotFoundException(`Mechanic ${id} not found`);

    return this.prisma.workshopMechanic.update({
      where: { id },
      data: {
        currentJobCardId: payload.jobCardNumber || mech.currentJobCardId,
        assignedBay: payload.bayName || mech.assignedBay,
        status: payload.jobCardNumber ? 'Busy' : 'Available',
      },
    });
  }

  // --- PM Due List ---------------------------------------------------------

  async getPmSchedules() {
    return this.prisma.pmSchedule.findMany({
      orderBy: { dueDate: 'asc' },
    });
  }

  async schedulePmSlot(id: string, payload: { proposedSlot: string; confirmedSlot?: string; notes?: string }) {
    const pm = await this.prisma.pmSchedule.findUnique({ where: { id } });
    if (!pm) throw new NotFoundException(`PM Schedule ${id} not found`);

    const slotLog = typeof pm.slotNegotiation === 'string' ? JSON.parse(pm.slotNegotiation) : (pm.slotNegotiation || {});
    const history = slotLog.arbitrationLog || [];
    history.push({
      action: 'Slot Negotiated',
      proposed: payload.proposedSlot,
      confirmed: payload.confirmedSlot || payload.proposedSlot,
      timestamp: new Date().toISOString(),
      notes: payload.notes || 'Recorded arbitration R-06 <-> R-04',
    });

    return this.prisma.pmSchedule.update({
      where: { id },
      data: {
        slotNegotiation: JSON.stringify({
          proposedSlot: payload.proposedSlot,
          confirmedSlot: payload.confirmedSlot || payload.proposedSlot,
          status: payload.confirmedSlot ? 'CONFIRMED' : 'PROPOSED',
          arbitrationLog: history,
        }),
      },
    });
  }

  async createJobCardFromPm(id: string) {
    const pm = await this.prisma.pmSchedule.findUnique({ where: { id } });
    if (!pm) throw new NotFoundException(`PM Schedule ${id} not found`);

    const jc = await this.createJobCard({
      vehicleNumber: pm.vehicleNumber,
      complaint: `Scheduled PM Service (${pm.triggerType} Trigger). Due at ${pm.dueKm} KM / ${pm.dueDate.toISOString().split('T')[0]}`,
      rootCause: `PM Interval Due - Multi-trigger (${pm.triggerType})`,
      odometer: pm.currentOdometer,
      priority: pm.status === 'Overdue' || pm.status === 'Lock' ? 'HIGH' : 'MEDIUM',
      status: 'Open',
      parts: [
        { partNumber: 'PM-KIT-STD', name: `PM Kit for ${pm.vehicleNumber}`, qty: 1, unitCost: 6500, totalCost: 6500, status: 'Reserved' },
      ],
    });

    await this.prisma.pmSchedule.update({
      where: { id },
      data: { autoJobCardId: jc.jobCardNumber, status: 'Grace' },
    });

    return jc;
  }

  async requestPmOverride(id: string, reason: string) {
    const pm = await this.prisma.pmSchedule.findUnique({ where: { id } });
    if (!pm) throw new NotFoundException(`PM Schedule ${id} not found`);

    return this.prisma.pmSchedule.update({
      where: { id },
      data: {
        overrideApproved: true,
        maintenanceLock: false,
        status: 'Grace',
      },
    });
  }

  // --- Estimates -----------------------------------------------------------

  async getEstimates() {
    return this.prisma.estimate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEstimate(data: any) {
    const count = await this.prisma.estimate.count();
    const estimateNumber = data.estimateNumber || `EST-2026-${String(count + 1).padStart(3, '0')}`;

    const labourCost = Number(data.labourCost) || 0;
    const partsCost = Number(data.partsCost) || 0;
    const outsideWorkCost = Number(data.outsideWorkCost) || 0;
    const subtotal = labourCost + partsCost + outsideWorkCost;
    const tax = Number(data.tax) || subtotal * 0.18;
    const totalAmount = subtotal + tax;

    // AF-05 Threshold rule: <= 10,000 auto-approved by R-06, > 10,000 requires approval
    const isAutoApproved = totalAmount <= 10000;
    const approvalStatus = isAutoApproved ? 'Approved' : 'PendingApproval';

    const timeline = [
      {
        role: 'R-06 Workshop Manager',
        status: isAutoApproved ? 'Auto-Approved (Threshold <= ₹10K)' : 'Submitted for Approval',
        timestamp: new Date().toISOString(),
      },
    ];

    return this.prisma.estimate.create({
      data: {
        estimateNumber,
        jobCardId: data.jobCardId,
        vehicleNumber: data.vehicleNumber,
        labourCost,
        partsCost,
        outsideWorkCost,
        tax,
        totalAmount,
        approvalStatus,
        technicalApproval: 'Approved', // R-07 technical signoff
        approvalTimeline: JSON.stringify(timeline),
      },
    });
  }

  async updateEstimate(id: string, data: any) {
    const est = await this.prisma.estimate.findUnique({ where: { id } });
    if (!est) throw new NotFoundException(`Estimate ${id} not found`);

    return this.prisma.estimate.update({
      where: { id },
      data,
    });
  }

  // --- Parts Demand --------------------------------------------------------

  async getPartsDemand() {
    return this.prisma.partsDemand.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async requestPartDemand(id: string) {
    return this.prisma.partsDemand.update({
      where: { id },
      data: { demandStatus: 'Requested' },
    });
  }

  async reservePart(id: string) {
    return this.prisma.partsDemand.update({
      where: { id },
      data: { reservationStatus: 'Reserved', demandStatus: 'Fulfilled' },
    });
  }

  // --- Outside Work Requests -----------------------------------------------

  async getOutsideWorkRequests() {
    return this.prisma.outsideWorkRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOutsideWorkRequest(data: any) {
    return this.prisma.outsideWorkRequest.create({
      data: {
        jobCardId: data.jobCardId,
        vehicleNumber: data.vehicleNumber,
        vendor: data.vendor,
        reason: data.reason,
        estimate: Number(data.estimate) || 0,
        approvalStatus: 'Pending',
        completionStatus: 'In Progress',
      },
    });
  }

  // --- Quality Control & Road Test -----------------------------------------

  async getQCQueue() {
    return this.prisma.jobCard.findMany({
      where: { status: 'QC' },
    });
  }

  async approveQC(id: string, data: { checklist: any[]; passed: boolean; notes?: string }) {
    const jc = await this.getJobCardById(id);

    return this.prisma.jobCard.update({
      where: { id: jc.id },
      data: {
        qcChecklist: JSON.stringify(data.checklist),
        qcStatus: data.passed ? 'Approved' : 'Rejected',
        status: data.passed ? (jc.roadTestStatus === 'Pending' ? 'Road Test' : 'Completed') : 'In Progress',
      },
    });
  }

  async recordRoadTest(id: string, data: { passed: boolean; notes: string }) {
    const jc = await this.getJobCardById(id);

    return this.prisma.jobCard.update({
      where: { id: jc.id },
      data: {
        roadTestStatus: data.passed ? 'Passed' : 'Failed',
        roadTestNotes: data.notes,
        status: data.passed ? 'Completed' : 'In Progress',
      },
    });
  }

  // --- R-06 Reports --------------------------------------------------------

  async getReports() {
    return {
      downtimeByVehicle: [
        { vehicleNumber: 'MH-12-AB-1234', jobCard: 'JC-2026-001', downtimeHours: 28.5, reason: 'Engine Overhaul', status: 'In Progress' },
        { vehicleNumber: 'KA-04-MN-5566', jobCard: 'JC-2026-003', downtimeHours: 42.0, reason: 'Waiting AC Compressor', status: 'Waiting Parts' },
        { vehicleNumber: 'HR-26-DQ-3344', jobCard: 'JC-2026-004', downtimeHours: 18.0, reason: 'Gearbox Overhaul', status: 'QC' },
        { vehicleNumber: 'DL-01-AX-9988', jobCard: 'JC-2026-002', downtimeHours: 4.5, reason: 'PM 100K Service', status: 'Open' },
      ],
      jobCostVsEstimate: [
        { jobCardNumber: 'JC-2026-001', vehicleNumber: 'MH-12-AB-1234', estimateTotal: 47900, actualCost: 38000, variance: -9900, accuracy: 79.3 },
        { jobCardNumber: 'JC-2026-002', vehicleNumber: 'DL-01-AX-9988', estimateTotal: 10030, actualCost: 8500, variance: -1530, accuracy: 84.7 },
        { jobCardNumber: 'JC-2026-003', vehicleNumber: 'KA-04-MN-5566', estimateTotal: 21240, actualCost: 5200, variance: -16040, accuracy: 24.4 },
        { jobCardNumber: 'JC-2026-004', vehicleNumber: 'HR-26-DQ-3344', estimateTotal: 28000, actualCost: 26500, variance: -1500, accuracy: 94.6 },
      ],
      waitingPartsAging: [
        { jobCardNumber: 'JC-2026-003', vehicleNumber: 'KA-04-MN-5566', partName: 'Sanden Heavy Cooling Compressor', partNumber: 'HVAC-CMP-990', daysWaiting: 3.5, supplier: 'AutoCool Parts Ltd' },
        { jobCardNumber: 'JC-2026-008', vehicleNumber: 'TN-09-CB-7788', partName: 'Air Brake Valve Unit', partNumber: 'BRK-VAL-102', daysWaiting: 1.2, supplier: 'BrakeTech OEM' },
      ],
      warrantyRecovered: [
        { jobCardNumber: 'JC-2026-003', vehicleNumber: 'KA-04-MN-5566', claimNumber: 'CLM-WRN-882', claimedAmount: 14000, status: 'Under Review', oem: 'Tata Motors' },
        { jobCardNumber: 'JC-2025-890', vehicleNumber: 'MH-12-AB-1234', claimNumber: 'CLM-WRN-712', claimedAmount: 32000, status: 'Recovered', oem: 'Ashok Leyland' },
      ],
    };
  }
}
