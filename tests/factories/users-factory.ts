import bcrypt from 'bcrypt';
import faker from '@faker-js/faker';
import { User } from '@prisma/client';
import { prisma } from '@/config';

export async function createUser(params: Partial<User> = {}): Promise<User> {
  const incomingPassword = params.password || faker.internet.password(6);
  const hashedPassword = await bcrypt.hash(incomingPassword, 10);

  return prisma.user.create({
    data: {
      email: params.email || faker.internet.email(),
      password: hashedPassword,
    },
  });
}

export function mockUser(params: Partial<User> = {}): User {
  const incomingPassword = params.password || faker.internet.password(6);
  const hashedPassword = bcrypt.hashSync(incomingPassword, 10);

  return {
    id: faker.datatype.number({ precision: 1, min: 1 }),
    email: params.email || faker.internet.email(),
    password: hashedPassword,
    createdAt: faker.datatype.datetime(),
    updatedAt: faker.datatype.datetime(),
  };
}
