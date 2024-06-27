import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GveSnapshotPartFeatureComponent } from './gve-snapshot-part-feature.component';

describe('GveSnapshotPartFeatureComponent', () => {
  let component: GveSnapshotPartFeatureComponent;
  let fixture: ComponentFixture<GveSnapshotPartFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GveSnapshotPartFeatureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GveSnapshotPartFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
