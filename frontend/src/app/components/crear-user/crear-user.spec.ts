import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearUser } from './crear-user';

describe('CrearUser', () => {
  let component: CrearUser;
  let fixture: ComponentFixture<CrearUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
