import { TestBed } from '@angular/core/testing';

import { Publico } from './publico';

describe('Publico', () => {
  let service: Publico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Publico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
