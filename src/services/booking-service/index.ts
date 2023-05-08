import { notFoundError } from '@/errors';
import { badRequestError } from '@/errors/bad-request-error';
import { cannotBookingError } from '@/errors/cannot-booking-error';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import roomRepository from '@/repositories/room-repository';
import ticketsRepository from '@/repositories/tickets-repository';

export async function checkEnrollmentTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw cannotBookingError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotBookingError();
  }
}

export async function checkValidBooking(roomId: number) {
  const room = await roomRepository.findById(roomId);
  const bookings = await bookingRepository.findByRoomId(roomId);

  if (!room) throw notFoundError();
  if (room.capacity <= bookings.length) throw cannotBookingError();
}

export async function getBooking(userId: number) {
  const booking = await bookingRepository.findByUserId(userId);
  if (!booking) throw notFoundError();

  return booking;
}

export async function bookingRoomById(userId: number, roomId: number) {
  if (!roomId) throw badRequestError();

  await checkEnrollmentTicket(userId);
  await checkValidBooking(roomId);

  return bookingRepository.create({ roomId, userId });
}

export async function changeBookingRoomById(userId: number, roomId: number) {
  if (!roomId) throw badRequestError();

  await checkValidBooking(roomId);
  const booking = await bookingRepository.findByUserId(userId);

  if (!booking || booking.userId !== userId) throw cannotBookingError();

  return bookingRepository.upsertBooking({
    id: booking.id,
    roomId,
    userId,
  });
}

const bookingService = {
  bookingRoomById,
  getBooking,
  changeBookingRoomById,
  checkEnrollmentTicket,
  checkValidBooking,
};

export default bookingService;
