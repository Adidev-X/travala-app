import RiderDashboardScreen from '@/screens/rider/RiderDashboardScreen';
import TravelerBookingsScreen from '@/screens/traveler/TravelerBookingsScreen';
import { useAuthStore } from '@/store/authStore';
import React from 'react';

export default function TripsIndex() {
  const role = useAuthStore((s) => s.user?.role);
  if (role === 'traveler') return <TravelerBookingsScreen />;
  return <RiderDashboardScreen />;
}
