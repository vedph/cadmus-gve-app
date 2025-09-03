import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GveHandsPartFeatureComponent } from './gve-hands-part-feature.component';

describe('GveHandsPartFeatureComponent', () => {
  let component: GveHandsPartFeatureComponent;
  let fixture: ComponentFixture<GveHandsPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GveHandsPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GveHandsPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
