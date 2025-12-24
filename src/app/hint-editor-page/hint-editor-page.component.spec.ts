import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintEditorPageComponent } from './hint-editor-page.component';

describe('HintEditorPageComponent', () => {
  let component: HintEditorPageComponent;
  let fixture: ComponentFixture<HintEditorPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HintEditorPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HintEditorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
