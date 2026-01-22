import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraficasPublica } from './graficas-publica';

describe('GraficasPublica', () => {
  let component: GraficasPublica;
  let fixture: ComponentFixture<GraficasPublica>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraficasPublica]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraficasPublica);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
