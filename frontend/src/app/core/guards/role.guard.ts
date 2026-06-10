import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (!tokenStorage.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const allowedRoles = route.data['roles'] as string[] | undefined;
  if (!allowedRoles || allowedRoles.length === 0) return true;

  if (!tokenStorage.hasAnyRole(allowedRoles)) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
