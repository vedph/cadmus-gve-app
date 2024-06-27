import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GveSnapshotPartComponent } from './gve-snapshot-part.component';

describe('GveSnapshotPartComponent', () => {
  let component: GveSnapshotPartComponent;
  let fixture: ComponentFixture<GveSnapshotPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GveSnapshotPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GveSnapshotPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
