import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTest } from './edit-test';

describe('EditTest', () => {
  let component: EditTest;
  let fixture: ComponentFixture<EditTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
