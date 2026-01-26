import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisoHome } from './aviso-home';

describe('AvisoHome', () => {
  let component: AvisoHome;
  let fixture: ComponentFixture<AvisoHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvisoHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvisoHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
