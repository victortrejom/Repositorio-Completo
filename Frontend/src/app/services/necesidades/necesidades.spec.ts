import { TestBed } from '@angular/core/testing';

import { Necesidades } from './necesidades';

describe('Necesidades', () => {
  let service: Necesidades;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Necesidades);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
