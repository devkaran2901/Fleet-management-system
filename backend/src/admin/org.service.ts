import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrgNodeType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService, AuditActor } from './audit.service';

export interface OrgNodeDto {
  name: string;
  code: string;
  type: OrgNodeType;
  parentId?: string | null;
}

@Injectable()
export class OrgService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  /** Returns the org hierarchy as a nested tree, roots first. */
  async tree() {
    const nodes = await this.prisma.orgNode.findMany({ orderBy: { name: 'asc' } });

    const byId = new Map(
      nodes.map((node) => [node.id, { ...node, children: [] as any[] }]),
    );
    const roots: any[] = [];

    for (const node of byId.values()) {
      const parent = node.parentId ? byId.get(node.parentId) : undefined;
      if (parent) parent.children.push(node);
      else roots.push(node);
    }

    return roots;
  }

  async create(dto: OrgNodeDto, actor: AuditActor) {
    if (dto.parentId) await this.assertExists(dto.parentId);

    const node = await this.prisma.orgNode.create({
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type,
        parentId: dto.parentId ?? null,
      },
    });

    await this.audit.record({
      actor,
      action: 'org.node.created',
      entity: 'OrgNode',
      entityId: node.id,
      payload: { name: node.name, code: node.code, type: node.type },
    });

    return node;
  }

  async update(id: string, dto: Partial<OrgNodeDto>, actor: AuditActor) {
    await this.assertExists(id);

    if (dto.parentId !== undefined && dto.parentId !== null) {
      if (dto.parentId === id) {
        throw new BadRequestException('A node cannot be its own parent');
      }
      await this.assertExists(dto.parentId);
      if (await this.isDescendant(dto.parentId, id)) {
        throw new BadRequestException(
          'Cannot move a node beneath one of its own descendants',
        );
      }
    }

    const node = await this.prisma.orgNode.update({ where: { id }, data: dto });

    await this.audit.record({
      actor,
      action: 'org.node.updated',
      entity: 'OrgNode',
      entityId: id,
      payload: { ...dto },
    });

    return node;
  }

  async remove(id: string, actor: AuditActor) {
    const node = await this.assertExists(id);
    await this.prisma.orgNode.delete({ where: { id } });

    await this.audit.record({
      actor,
      action: 'org.node.deleted',
      entity: 'OrgNode',
      entityId: id,
      payload: { name: node.name, code: node.code },
    });

    return { id };
  }

  private async assertExists(id: string) {
    const node = await this.prisma.orgNode.findUnique({ where: { id } });
    if (!node) throw new NotFoundException(`Org node ${id} not found`);
    return node;
  }

  /** True when `candidateId` sits somewhere under `ancestorId`. */
  private async isDescendant(candidateId: string, ancestorId: string) {
    let cursor: string | null = candidateId;
    const seen = new Set<string>();

    while (cursor && !seen.has(cursor)) {
      seen.add(cursor);
      const node = await this.prisma.orgNode.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
      if (!node?.parentId) return false;
      if (node.parentId === ancestorId) return true;
      cursor = node.parentId;
    }

    return false;
  }
}
