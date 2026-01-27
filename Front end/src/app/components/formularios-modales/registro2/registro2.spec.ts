import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Registro2 } from './registro2';

describe('Registro2', () => {
  let component: Registro2;
  let fixture: ComponentFixture<Registro2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registro2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Registro2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
