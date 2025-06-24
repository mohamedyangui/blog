import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  let isAuthenticated = false;
  authService.user.subscribe(user => {
    isAuthenticated = !!user;
  });
  if (isAuthenticated) return true;
  router.navigate(['/login']);
  return false;
};