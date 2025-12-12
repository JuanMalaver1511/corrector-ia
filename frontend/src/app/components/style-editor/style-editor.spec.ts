import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleEditor } from './style-editor';

describe('StyleEditor', () => {
  let component: StyleEditor;
  let fixture: ComponentFixture<StyleEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StyleEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StyleEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
