import faker from '@faker-js/faker';
import { Room } from '@prisma/client';
import { prisma } from '@/config';

//Sabe criar objetos - Hotel do banco
export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: '1020',
      capacity: 3,
      hotelId: hotelId,
    },
  });
}

export function mockRoom(param: Partial<Room> = {}): Room {
  return {
    id: param.id === undefined ? faker.datatype.number({ precision: 1 }) : param.id,
    hotelId: param.hotelId === undefined ? faker.datatype.number({ precision: 1 }) : param.hotelId,
    name: param.name || faker.name.firstName(),
    createdAt: param.createdAt || faker.datatype.datetime(),
    updatedAt: param.updatedAt || faker.datatype.datetime(),
    capacity: param.capacity === undefined ? faker.datatype.number({ precision: 1, min: 1 }) : param.capacity,
  };
}
