export interface BookingIntent {
  version: 1;
  clubId: number;
  clubName: string;
  clubAddress: string;
  courtId: number;
  courtName: string;
  surface: string;
  date: string;
  start: string;
  end: string;
  durationMinutes: number;
  quotedPrice: number;
  currency: 'BGN';
  cancellationPolicy: string;
  paymentMethod: 'pay_on_site';
  createdAt: string;
}

export interface BookingConfirmationSnapshot extends BookingIntent {
  reservationId: number;
  bookingReference: string;
  status: 'confirmed';
  confirmedAt: string;
}
