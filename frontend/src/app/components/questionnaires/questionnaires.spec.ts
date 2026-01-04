import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Questionnaires } from './questionnaires';

describe('Questionnaires', () => {
  let component: Questionnaires;
  let fixture: ComponentFixture<Questionnaires>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Questionnaires]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Questionnaires);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
