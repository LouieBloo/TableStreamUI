import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';

export const dashboardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const analyticService = inject(AnalyticsService);
  
  const isAuthorized = analyticService.isAuthorized;
  
  if (!isAuthorized) {
    router.navigate(['/check-password']);
    return false;
  }

  return true;
};
