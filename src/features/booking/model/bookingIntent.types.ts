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
  /**
   * Set when this intent moves an existing booking: checkout PATCHes that
   * reservation instead of creating one, so the old time is only given up once
   * the new one is confirmed. Optional, so intents saved before it existed
   * still parse.
   */
  rescheduleOf?: number;
}

export interface BookingConfirmationSnapshot extends BookingIntent {
  reservationId: number;
  bookingReference: string;
  status: 'confirmed';
  confirmedAt: string;
}
