import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ImportStatus, OrgNodeType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export interface ImportFieldDef {
  key: string;
  label: string;
  required: boolean;
  hint?: string;
}

export interface ImportEntityDef {
  key: string;
  label: string;
  fields: ImportFieldDef[];
}

export interface RowError {
  row: number;
  field: string;
  message: string;
}

/**
 * Importable entities. `fields` drives the mapping step in the wizard, and the
 * template endpoint derives its CSV header from the same list.
 */
export const IMPORT_ENTITIES: ImportEntityDef[] = [
  {
    key: 'users',
    label: 'Users',
    fields: [
      { key: 'email', label: 'Email', required: true },
      { key: 'firstName', label: 'First name', required: true },
      { key: 'lastName', label: 'Last name', required: true },
      { key: 'roleName', label: 'Role', required: false, hint: 'ADMIN | DISPATCHER | DRIVER' },
    ],
  },
  {
    key: 'org-nodes',
    label: 'Org nodes',
    fields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'name', label: 'Name', required: true },
      { key: 'type', label: 'Type', required: true, hint: 'ORG | REGION | HUB | DEPOT | TEAM' },
      { key: 'parentCode', label: 'Parent code', required: false },
    ],
  },
];

@Injectable()
export class ImportsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  entities() {
    return IMPORT_ENTITIES;
  }

  async findAll() {
    return this.prisma.importJob.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async findOne(id: string) {
    const job = await this.prisma.importJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Import job ${id} not found`);
    return job;
  }

  /** CSV header + one example row, so users start from a valid shape. */
  template(entity: string) {
    const def = this.entityDef(entity);
    const header = def.fields.map((f) => f.key).join(',');
    const example = def.fields
      .map((f) => (f.hint ? f.hint.split('|')[0].trim() : `example-${f.key}`))
      .join(',');
    return `${header}\n${example}\n`;
  }

  /**
   * Step 1 — parse the uploaded CSV into rows. Nothing is written to the target
   * tables until `commit`; the job just holds the staged rows.
   */
  async upload(
    dto: { entity: string; fileName: string; csv: string },
    actor: AuditActor,
  ) {
    const def = this.entityDef(dto.entity);
    const { headers, rows } = this.parseCsv(dto.csv);
    if (headers.length === 0) throw new BadRequestException('The file has no header row');

    // Pre-map columns whose header already matches a field key.
    const mapping: Record<string, string> = {};
    for (const field of def.fields) {
      const match = headers.find(
        (h) => h.toLowerCase().replace(/[\s_]/g, '') === field.key.toLowerCase(),
      );
      if (match) mapping[field.key] = match;
    }

    const job = await this.prisma.importJob.create({
      data: {
        entity: dto.entity,
        fileName: dto.fileName,
        status: ImportStatus.MAPPING,
        totalRows: rows.length,
        mapping: mapping as any,
        rows: rows as any,
      },
    });

    await this.audit.record({
      actor,
      action: 'import.uploaded',
      entity: 'ImportJob',
      entityId: job.id,
      payload: { entity: dto.entity, fileName: dto.fileName, rows: rows.length },
    });

    return { ...job, headers };
  }

  /** Step 2 — persist the column mapping chosen in the wizard. */
  async setMapping(id: string, mapping: Record<string, string>, actor: AuditActor) {
    const job = await this.findOne(id);
    if (job.status === ImportStatus.COMMITTED) {
      throw new BadRequestException('This job has already been committed');
    }

    const updated = await this.prisma.importJob.update({
      where: { id },
      data: { mapping: mapping as any, status: ImportStatus.MAPPING },
    });

    await this.audit.record({
      actor,
      action: 'import.mapped',
      entity: 'ImportJob',
      entityId: id,
      payload: { mapping },
      parentId: await this.originId(id),
    });

    return updated;
  }

  /** Step 3 — validate every row and stage the error list for the preview. */
  async validate(id: string, actor: AuditActor) {
    const job = await this.findOne(id);
    const def = this.entityDef(job.entity);
    const mapping = (job.mapping ?? {}) as Record<string, string>;
    const rows = (job.rows ?? []) as Record<string, string>[];

    const missingRequired = def.fields
      .filter((f) => f.required && !mapping[f.key])
      .map((f) => f.label);
    if (missingRequired.length > 0) {
      throw new BadRequestException(
        `Map the required column(s) first: ${missingRequired.join(', ')}`,
      );
    }

    const errors: RowError[] = [];
    const seenKeys = new Set<string>();

    for (const [index, raw] of rows.entries()) {
      const rowNumber = index + 1;
      const record = this.applyMapping(raw, mapping);

      for (const field of def.fields) {
        if (field.required && !record[field.key]) {
          errors.push({ row: rowNumber, field: field.key, message: 'Required value is missing' });
        }
      }

      if (job.entity === 'users') {
        const email = record.email?.toLowerCase();
        if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          errors.push({ row: rowNumber, field: 'email', message: `"${record.email}" is not a valid email` });
        }
        if (email && seenKeys.has(email)) {
          errors.push({ row: rowNumber, field: 'email', message: `Duplicate of an earlier row in this file` });
        }
        if (email) seenKeys.add(email);
        if (record.roleName && !['ADMIN', 'DISPATCHER', 'DRIVER'].includes(record.roleName)) {
          errors.push({ row: rowNumber, field: 'roleName', message: `Unknown role "${record.roleName}"` });
        }
      }

      if (job.entity === 'org-nodes') {
        const code = record.code;
        if (code && seenKeys.has(code)) {
          errors.push({ row: rowNumber, field: 'code', message: 'Duplicate of an earlier row in this file' });
        }
        if (code) seenKeys.add(code);
        if (record.type && !Object.keys(OrgNodeType).includes(record.type)) {
          errors.push({ row: rowNumber, field: 'type', message: `Unknown type "${record.type}"` });
        }
      }
    }

    // Rows already present in the database collide on commit — flag them now.
    if (job.entity === 'users') {
      const emails = rows
        .map((r) => this.applyMapping(r, mapping).email?.toLowerCase())
        .filter(Boolean) as string[];
      const existing = await this.prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true },
      });
      const taken = new Set(existing.map((e) => e.email.toLowerCase()));
      for (const [index, raw] of rows.entries()) {
        const email = this.applyMapping(raw, mapping).email?.toLowerCase();
        if (email && taken.has(email)) {
          errors.push({ row: index + 1, field: 'email', message: 'A user with this email already exists' });
        }
      }
    }

    const errorRowNumbers = new Set(errors.map((e) => e.row));
    const validRows = rows.length - errorRowNumbers.size;

    const updated = await this.prisma.importJob.update({
      where: { id },
      data: {
        status: ImportStatus.VALIDATED,
        validRows,
        errorRows: errorRowNumbers.size,
        errors: errors as any,
      },
    });

    await this.audit.record({
      actor,
      action: 'import.validated',
      entity: 'ImportJob',
      entityId: id,
      payload: { validRows, errorRows: errorRowNumbers.size },
      parentId: await this.originId(id),
    });

    return updated;
  }

  /**
   * Step 4 — write the valid rows. Rows with errors are skipped rather than
   * failing the batch, matching the wizard's "commit the clean rows" preview.
   */
  async commit(id: string, actor: AuditActor) {
    const job = await this.findOne(id);
    if (job.status === ImportStatus.COMMITTED) {
      throw new BadRequestException('This job has already been committed');
    }
    if (job.status !== ImportStatus.VALIDATED) {
      throw new BadRequestException('Validate the job before committing');
    }

    const mapping = (job.mapping ?? {}) as Record<string, string>;
    const rows = (job.rows ?? []) as Record<string, string>[];
    const errors = (job.errors ?? []) as unknown as RowError[];
    const badRows = new Set(errors.map((e) => e.row));

    const clean = rows
      .map((raw, index) => ({ record: this.applyMapping(raw, mapping), row: index + 1 }))
      .filter(({ row }) => !badRows.has(row));

    let created = 0;
    try {
      if (job.entity === 'users') created = await this.commitUsers(clean.map((c) => c.record));
      if (job.entity === 'org-nodes') created = await this.commitOrgNodes(clean.map((c) => c.record));
    } catch (err) {
      await this.prisma.importJob.update({
        where: { id },
        data: { status: ImportStatus.FAILED },
      });
      await this.audit.record({
        actor,
        action: 'import.failed',
        entity: 'ImportJob',
        entityId: id,
        payload: { reason: (err as Error).message },
        parentId: await this.originId(id),
      });
      throw new BadRequestException(`Commit failed: ${(err as Error).message}`);
    }

    const updated = await this.prisma.importJob.update({
      where: { id },
      data: { status: ImportStatus.COMMITTED, committedAt: new Date() },
    });

    await this.audit.record({
      actor,
      action: 'import.committed',
      entity: 'ImportJob',
      entityId: id,
      payload: { entity: job.entity, created, skipped: badRows.size },
      parentId: await this.originId(id),
    });

    return { ...updated, created, skipped: badRows.size };
  }

  private async commitUsers(records: Record<string, string>[]) {
    // Imported accounts get a random password; they sign in via reset/SSO.
    const rolesByName = new Map(
      (await this.prisma.role.findMany()).map((r) => [r.name, r.id]),
    );

    let created = 0;
    for (const record of records) {
      const password = await bcrypt.hash(`${Math.random()}${Date.now()}`, 10);
      const user = await this.prisma.user.create({
        data: {
          email: record.email.toLowerCase(),
          firstName: record.firstName,
          lastName: record.lastName,
          password,
        },
      });
      const roleId = rolesByName.get(record.roleName || 'DRIVER');
      if (roleId) {
        await this.prisma.userRole.create({ data: { userId: user.id, roleId } });
      }
      created += 1;
    }
    return created;
  }

  private async commitOrgNodes(records: Record<string, string>[]) {
    let created = 0;
    // Two passes: create every node, then attach parents so row order is free.
    for (const record of records) {
      await this.prisma.orgNode.upsert({
        where: { code: record.code },
        update: { name: record.name, type: record.type as OrgNodeType },
        create: { code: record.code, name: record.name, type: record.type as OrgNodeType },
      });
      created += 1;
    }
    for (const record of records) {
      if (!record.parentCode) continue;
      const parent = await this.prisma.orgNode.findUnique({
        where: { code: record.parentCode },
      });
      if (parent) {
        await this.prisma.orgNode.update({
          where: { code: record.code },
          data: { parentId: parent.id },
        });
      }
    }
    return created;
  }

  private applyMapping(raw: Record<string, string>, mapping: Record<string, string>) {
    const record: Record<string, string> = {};
    for (const [fieldKey, column] of Object.entries(mapping)) {
      record[fieldKey] = (raw[column] ?? '').trim();
    }
    return record;
  }

  /** The upload event for this job, so later steps chain back to it. */
  private async originId(jobId: string) {
    const origin = await this.prisma.auditEvent.findFirst({
      where: { entity: 'ImportJob', entityId: jobId, action: 'import.uploaded' },
      orderBy: { seq: 'asc' },
      select: { id: true },
    });
    return origin?.id;
  }

  private entityDef(entity: string) {
    const def = IMPORT_ENTITIES.find((e) => e.key === entity);
    if (!def) throw new BadRequestException(`Unknown import entity "${entity}"`);
    return def;
  }

  /** Minimal RFC4180 parser: handles quoted fields, embedded commas and "". */
  private parseCsv(csv: string) {
    const rows: string[][] = [];
    let field = '';
    let row: string[] = [];
    let inQuotes = false;

    const text = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (inQuotes) {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else inQuotes = false;
        } else field += char;
        continue;
      }
      if (char === '"') inQuotes = true;
      else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else field += char;
    }
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ''));
    if (nonEmpty.length === 0) return { headers: [], rows: [] };

    const headers = nonEmpty[0].map((h) => h.trim());
    const records = nonEmpty.slice(1).map((cells) => {
      const record: Record<string, string> = {};
      headers.forEach((header, idx) => {
        record[header] = cells[idx] ?? '';
      });
      return record;
    });

    return { headers, rows: records };
  }
}
