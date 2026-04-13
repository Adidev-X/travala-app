const config = {
  BASE_URL: 'https://api.rideshare.app/v1',
  OTP_TIMEOUT: 60,      // seconds before resend is allowed
  MAX_SEATS: 12,
  MAX_PHOTOS: 5,
  DEFAULT_PAGE_SIZE: 20,
  APP_NAME: 'RideShare',
  APP_VERSION: '1.0.0',
} as const;

export default config;
