import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GveHandsPartComponent } from './gve-hands-part.component';

describe('GveHandsPartComponent', () => {
  let component: GveHandsPartComponent;
  let fixture: ComponentFixture<GveHandsPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GveHandsPartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GveHandsPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
