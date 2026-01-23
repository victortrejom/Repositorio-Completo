import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevaNecesidadComponent } from './nueva-necesidad';


describe('NuevaNecesidad', () => {
  let component: NuevaNecesidadComponent;
  let fixture: ComponentFixture<NuevaNecesidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaNecesidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevaNecesidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
