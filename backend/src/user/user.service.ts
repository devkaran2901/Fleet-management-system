import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async create(data: Prisma.UserCreateInput & { roleNames?: string[] }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const { roleNames, ...userData } = data;

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      // Default to DRIVER role if none specified
      const rolesToAssign = roleNames && roleNames.length > 0 ? roleNames : ['DRIVER'];

      for (const roleName of rolesToAssign) {
        const role = await tx.role.findUnique({
          where: { name: roleName },
        });

        if (!role) {
          throw new NotFoundException(`Role ${roleName} does not exist`);
        }

        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }

      return user;
    });
  }

  async updateProfile(id: string, data: { firstName?: string; lastName?: string; email?: string }) {
    const updateData: any = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
      updateData.email = data.email;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password, ...result } = user;
    return result;
  }
}
