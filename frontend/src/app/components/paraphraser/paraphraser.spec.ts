import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Paraphraser } from './paraphraser';

describe('Paraphraser', () => {
  let component: Paraphraser;
  let fixture: ComponentFixture<Paraphraser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paraphraser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Paraphraser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
