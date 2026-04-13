const strings = {
  app: {
    name: 'RideShare',
    tagline: 'Travel together, save together',
  },
  auth: {
    enterPhone: 'Enter your phone number',
    phonePlaceholder: '10-digit mobile number',
    sendOTP: 'Send OTP',
    verifyOTP: 'Verify OTP',
    resendOTP: 'Resend OTP',
    otpSent: 'OTP sent to your number',
    setupProfile: 'Complete your profile',
    invalidPhone: 'Please enter a valid 10-digit phone number',
    invalidOTP: 'Invalid OTP. Please try again.',
  },
  trip: {
    postTrip: 'Post a Trip',
    myTrips: 'My Trips',
    searchTrips: 'Search Trips',
    noTripsFound: 'No trips found for your route',
    tripFull: 'This trip is full',
    seatsLeft: (n: number) => `${n} seat${n !== 1 ? 's' : ''} left`,
    joinRequest: 'Request to Join',
    requestSent: 'Request sent successfully',
    requestAccepted: 'Request accepted',
    requestDeclined: 'Request declined',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'No internet connection.',
    unauthorized: 'Session expired. Please log in again.',
  },
  label: {
    from: 'From',
    to: 'To',
    date: 'Date',
    seats: 'Seats',
    cost: 'Cost per person',
    vehicle: 'Vehicle',
    status: 'Status',
  },
} as const;

export default strings;
