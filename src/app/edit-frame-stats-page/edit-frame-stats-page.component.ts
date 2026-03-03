import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { EditFrameStatsComponent } from '@myrmidon/cadmus-statistics';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-edit-frame-stats-page',
  imports: [MatCardModule, MatIcon, EditFrameStatsComponent],
  templateUrl: './edit-frame-stats-page.component.html',
  styleUrl: './edit-frame-stats-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFrameStatsPageComponent {
  public readonly startDate = signal<Date>(
    (() => {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      d.setHours(0, 0, 0, 0);
      return d;
    })()
  );
  public readonly endDate = signal<Date>(new Date());
}
