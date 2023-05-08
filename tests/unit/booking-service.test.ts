import faker from '@faker-js/faker';
import { Enrollment, Address, Ticket, TicketType, Booking, Room } from '@prisma/client';
import { mockEnrollment, mockTicket, mockTicketType, mockRoom, mockBookings } from '../factories';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import roomRepository from '@/repositories/room-repository';
import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';
import { cannotBookingError } from '@/errors/cannot-booking-error';
import { notFoundError } from '@/errors';

describe('check Enrollment tests', () => {
  const bookingError = cannotBookingError();
  it('Should throw error when user does not have an enrollment', async () => {
    jest
      .spyOn(enrollmentRepository, 'findWithAddressByUserId')
      .mockImplementationOnce((): Promise<Enrollment & { Address: Address[] }> => {
        return null;
      });
    const userId = faker.datatype.number({ precision: 1 });
    const promise = bookingService.checkEnrollmentTicket(userId);
    expect(promise).rejects.toEqual({
      name: 'CannotBookingError',
      message: 'Cannot booking this room! Overcapacity!',
    });
  });

  describe('When enrollment is valid', () => {
    beforeEach(() => {
      jest
        .spyOn(enrollmentRepository, 'findWithAddressByUserId')
        .mockImplementationOnce(async (): Promise<Enrollment & { Address: Address[] }> => {
          return mockEnrollment();
        });
    });

    it('Should throw error when the user does not have a ticket', async () => {
      const userId = faker.datatype.number({ precision: 1 });

      jest
        .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
        .mockImplementationOnce((): Promise<Ticket & { TicketType: TicketType }> => {
          return null;
        });

      const promise = bookingService.checkEnrollmentTicket(userId);
      expect(promise).rejects.toEqual({
        bookingError,
      });
    });

    it('Should throw error when ticket status is reserved', async () => {
      const userId = faker.datatype.number({ precision: 1 });

      jest
        .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
        .mockImplementationOnce(async (): Promise<Ticket & { TicketType: TicketType }> => {
          const ticketType = mockTicketType({ includesHotel: true, isRemote: false });
          return mockTicket(ticketType, 1, 'RESERVED');
        });

      const promise = bookingService.checkEnrollmentTicket(userId);
      expect(promise).rejects.toEqual({
        bookingError,
      });
    });

    it('Should throw error when ticket is remote', async () => {
      const userId = faker.datatype.number({ precision: 1 });

      jest
        .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
        .mockImplementationOnce(async (): Promise<Ticket & { TicketType: TicketType }> => {
          const ticketType = mockTicketType({ includesHotel: true, isRemote: true });
          return mockTicket(ticketType, 1, 'PAID');
        });

      const promise = bookingService.checkEnrollmentTicket(userId);
      expect(promise).rejects.toEqual({
        bookingError,
      });
    });

    it('Should throw error when ticket does not include hotel', async () => {
      const userId = faker.datatype.number({ precision: 1 });

      jest
        .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
        .mockImplementationOnce(async (): Promise<Ticket & { TicketType: TicketType }> => {
          const ticketType = mockTicketType({ includesHotel: false, isRemote: true });
          return mockTicket(ticketType, 1, 'PAID');
        });

      const promise = bookingService.checkEnrollmentTicket(userId);
      expect(promise).rejects.toEqual({
        bookingError,
      });

      it('Should throw error when ticket is valid', async () => {
        const userId = faker.datatype.number({ precision: 1 });

        jest
          .spyOn(ticketsRepository, 'findTicketByEnrollmentId')
          .mockImplementationOnce(async (): Promise<Ticket & { TicketType: TicketType }> => {
            const ticketType = mockTicketType({ includesHotel: true, isRemote: false });
            return mockTicket(ticketType, 1, 'PAID');
          });

        const promise = bookingService.checkEnrollmentTicket(userId);
        expect(promise).rejects.toBe(undefined);
      });
    });
  });
});

describe('check valid booking tests', () => {
  let validRoom = mockRoom({ capacity: 3 });
  const bookingError = cannotBookingError();

  it('Should throw notFoundError when room is not found', async () => {
    jest.spyOn(roomRepository, 'findById').mockImplementationOnce(() => null);
    jest.spyOn(bookingRepository, 'findByRoomId').mockImplementationOnce(async () => {
      return [];
    });

    const promise = bookingService.checkValidBooking(validRoom.id);
    expect(promise).rejects.toEqual(notFoundError);
  });

  it('Should throw cannotBookingError when not enough rooms', async () => {
    validRoom = mockRoom({ capacity: 3 });

    jest.spyOn(roomRepository, 'findById').mockImplementationOnce(async () => validRoom);
    jest.spyOn(bookingRepository, 'findByRoomId').mockImplementationOnce(async () => {
      return mockBookings(1, validRoom, 3);
    });

    const promise = bookingService.checkValidBooking(validRoom.id);
    expect(promise).rejects.toEqual(bookingError);
  });
});

describe('get booking tests', () => {
  const bookings: (Booking & { Room: Room })[] = [];
  const validRoom = mockRoom({ capacity: 4 });
  const userId = faker.datatype.number({ precision: 1, min: 1 });

  for (let i = 0; i < 3; i++) {
    bookings.push(mockBookings(userId, validRoom, 1)[0]);
  }

  beforeEach(() => {
    jest
      .spyOn(bookingRepository, 'findByUserId')
      .mockImplementationOnce(async (userId: number): Promise<Booking & { Room: Room }> => {
        return bookings.find((b) => b.userId === userId);
      });

    it('Should throw notFoundError when id is invalid', () => {
      const theUserId = 0;

      const promise = bookingService.getBooking(theUserId);

      expect(promise).rejects.toEqual(notFoundError);
    });

    it('Should throw notFoundError when user id is not found', () => {
      const theUserId = userId + 1;

      const promise = bookingService.getBooking(theUserId);

      expect(promise).rejects.toEqual(notFoundError);
    });

    it('Should return the user id', () => {
      const promise = bookingService.getBooking(userId);

      expect(promise).resolves.toEqual(bookings[0]);
    });
  });
});
