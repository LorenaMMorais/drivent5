import faker from '@faker-js/faker';
import { Enrollment, Address, Ticket, TicketType } from '@prisma/client';
import { mockEnrollment, mockTicket, mockTicketType } from '../factories';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import bookingService from '@/services/booking-service';
import { cannotBookingError } from '@/errors/cannot-booking-error';

describe('checkEnrollment tests', () => {
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
    });
  });
});
