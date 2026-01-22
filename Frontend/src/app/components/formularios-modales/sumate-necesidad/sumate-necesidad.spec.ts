import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SumateNecesidad } from './sumate-necesidad';

describe('SumateNecesidad', () => {
  let component: SumateNecesidad;
  let fixture: ComponentFixture<SumateNecesidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SumateNecesidad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SumateNecesidad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
