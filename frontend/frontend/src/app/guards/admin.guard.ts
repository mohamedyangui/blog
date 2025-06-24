import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  let isAdmin = false;
  authService.user.subscribe(user => {
    isAdmin = user?.role === 'Admin';
  });
  if (isAdmin) return true;
  router.navigate(['/articles']);
  return false;
};