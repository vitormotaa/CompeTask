import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from './services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/v1/')) {
    return next(req);
  }

  const loading = inject(LoadingService);
  loading.iniciar();
  return next(req).pipe(finalize(() => loading.finalizar()));
};
