import faker from '@faker-js/faker';
import { TicketStatus, Ticket, TicketType } from '@prisma/client';
import { prisma } from '@/config';

export async function createTicketType() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: faker.datatype.boolean(),
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}

export async function createTicketTypeRemote() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: true,
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicketTypeWithHotel() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: false,
      includesHotel: true,
    },
  });
}

export function mockTicketType(param: Partial<TicketType>): TicketType {
  return {
    id: faker.datatype.number({ precision: 1 }),
    name: faker.name.findName(),
    price: faker.datatype.number(),
    isRemote: param.isRemote === undefined ? faker.datatype.boolean() : param.isRemote,
    includesHotel: param.includesHotel === undefined ? faker.datatype.boolean() : param.includesHotel,
    createdAt: faker.datatype.datetime(),
    updatedAt: faker.datatype.datetime(),
  };
}

export function mockTicket(
  ticketType: TicketType,
  enrollmentId: number,
  status: TicketStatus,
): Ticket & { TicketType: TicketType } {
  return {
    id: faker.datatype.number({ precision: 1 }),
    ticketTypeId: ticketType.id,
    enrollmentId: enrollmentId,
    createdAt: faker.datatype.datetime(),
    updatedAt: faker.datatype.datetime(),
    status: status,
    TicketType: ticketType,
  };
}
