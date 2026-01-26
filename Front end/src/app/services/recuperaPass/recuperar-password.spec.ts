import { TestBed } from '@angular/core/testing';

import { RecuperarPassword } from './recuperar-password';

describe('RecuperarPassword', () => {
  let service: RecuperarPassword;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecuperarPassword);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
