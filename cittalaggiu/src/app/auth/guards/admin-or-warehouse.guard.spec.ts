import { TestBed } from '@angular/core/testing';

import { AdminOrWarehouseGuard } from './admin-or-warehouse.guard';

describe('AdminOrWarehouseGuard', () => {
  let guard: AdminOrWarehouseGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminOrWarehouseGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
