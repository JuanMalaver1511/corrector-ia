import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleCustomization } from './style-customization';

describe('StyleCustomization', () => {
  let component: StyleCustomization;
  let fixture: ComponentFixture<StyleCustomization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StyleCustomization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StyleCustomization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
