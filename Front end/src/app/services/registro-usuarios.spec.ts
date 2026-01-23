import { TestBed } from '@angular/core/testing';

import { RegistroUsuarios } from './registro-usuarios';

describe('RegistroUsuarios', () => {
  let service: RegistroUsuarios;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistroUsuarios);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
