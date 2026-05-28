import { Slot } from 'expo-router';
import { RoleGuard } from '../../../components/RoleGuard';

export default function RefugioLayout() {
  return (
    <RoleGuard allowedRole="refugio">
      <Slot />
    </RoleGuard>
  );
}
