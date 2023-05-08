/* eslint-disable quotes */
import { Booking, Room } from '@prisma/client';
import faker from '@faker-js/faker';
import { prisma } from '@/config';

type CreateBookingParams = {
  roomId: number;
  userId: number;
};

export function createBooking({ roomId, userId }: CreateBookingParams) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export function getBookingReturn() {
  const booking: Booking & { Room: Room } = {
    id: 1,
    userId: null,
    roomId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    Room: {
      id: 1,
      name: 'Room 1',
      capacity: 2,
      hotelId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
  return booking;
}

export function mockBookings(userId: number, room: Room, numBookings: number): (Booking & { Room: Room })[] {
  return Array(numBookings).fill({
    id: faker.datatype.number({ precision: 1 }),
    roomId: room.id,
    userId: userId,
    createdAt: faker.datatype.datetime(),
    updatedAt: faker.datatype.datetime(),
    Room: room,
  });
}
