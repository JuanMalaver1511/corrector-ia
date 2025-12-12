import { TestBed } from '@angular/core/testing';

import { Corrector } from './corrector';

describe('Corrector', () => {
  let service: Corrector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Corrector);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
