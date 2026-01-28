import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaFicha } from './consulta-ficha';

describe('ConsultaFicha', () => {
  let component: ConsultaFicha;
  let fixture: ComponentFixture<ConsultaFicha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaFicha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaFicha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
