import { Slot } from 'expo-router';
import { RoleGuard } from '../../../components/RoleGuard';

export default function AdoptanteLayout() {
  return (
    <RoleGuard allowedRole="adoptante">
      <Slot />
    </RoleGuard>
  );
}
