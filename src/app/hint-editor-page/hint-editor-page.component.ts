import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  signal,
  ViewChild,
  afterNextRender,
  Injector,
} from '@angular/core';

import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';

import { DialogService } from '@myrmidon/ngx-mat-tools';

import { EditorSettingsService } from '@myrmidon/cadmus-api';

import type {
  GveHintDesigner,
  HintDesignerData,
  HintDesignerSettings,
} from '@myrmidon/gve-snapshot-rendition';
import { DEFAULT_HINT_DESIGNER_SETTINGS } from '@myrmidon/gve-snapshot-rendition';
import { MatSnackBar } from '@angular/material/snack-bar';
import { retry } from 'rxjs';

// the key used to store hint designer data in editor settings
const HINT_DESIGNER_DATA_KEY = 'gve-hint-designer-data';

// default hint data
const DEFAULT_HINT_DATA: HintDesignerData = {
  hints: {},
  animations: {
    fadeIn: 'return gsap.from(hintEl, { opacity: 0, duration: 0.5 });',
  },
};

/**
 * Hint Editor Page Component.
 */
@Component({
  selector: 'app-hint-editor-page',
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatIcon,
    MatProgressBar,
  ],
  templateUrl: './hint-editor-page.component.html',
  styleUrl: './hint-editor-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HintEditorPageComponent implements AfterViewInit {
  @ViewChild('designer', { static: false })
  designerRef!: ElementRef<GveHintDesigner>;

  public readonly busy = signal(false);
  public data = signal<HintDesignerData>(DEFAULT_HINT_DATA);
  public settings = signal<HintDesignerSettings>({
    ...DEFAULT_HINT_DESIGNER_SETTINGS,
    debug: true,
  });

  constructor(
    private _dialogService: DialogService,
    private _edSettingService: EditorSettingsService,
    private _snackbar: MatSnackBar,
    private _injector: Injector
  ) {
    // use afterNextRender to ensure DOM is ready before setting up effects
    afterNextRender(
      () => {
        // auto-update component when data changes
        effect(
          () => {
            const designer = this.designerRef?.nativeElement;
            if (designer) {
              console.log('Setting data on designer:', this.data());
              designer.data = this.data();
            }
          },
          { injector: this._injector }
        );

        // auto-update settings when they change
        effect(
          () => {
            const designer = this.designerRef?.nativeElement;
            if (designer) {
              console.log('Setting settings on designer:', this.settings());
              designer.settings = this.settings();
            }
          },
          { injector: this._injector }
        );
      },
      { injector: this._injector }
    );
  }

  public ngAfterViewInit() {
    const designer = this.designerRef.nativeElement;

    // listen to hint updates
    designer.addEventListener('dataChange', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Data changed:', customEvent.detail.data);
      // update the signal to keep it in sync
      this.data.set(customEvent.detail.data);
    });

    // set initial data and settings
    designer.data = this.data();
    designer.settings = this.settings();
  }

  public loadHints(): void {
    if (this.busy()) {
      return;
    }
    // load data from settings service
    this.busy.set(true);
    this._edSettingService
      .getSetting(HINT_DESIGNER_DATA_KEY)
      .pipe(retry(3))
      .subscribe({
        next: (data) => {
          if (data) {
            console.log('Loaded hint data:', data);
            this.data.set(data);
          }
        },
        error: (error) => {
          this._snackbar.open('Failed to load hint data: ' + error, 'Close', {
            duration: 3000,
          });
        },
        complete: () => {
          this.busy.set(false);
        },
      });
  }

  public saveHints(): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    // get the current data from the designer
    const currentData = this.designerRef.nativeElement.data;
    console.log('Saving hint data:', currentData);

    // save data to settings service
    this._edSettingService
      .addSetting(HINT_DESIGNER_DATA_KEY, currentData)
      .subscribe({
        next: () => {
          this._snackbar.open('Hint data saved.', 'Close', {
            duration: 2000,
          });
        },
        error: (error) => {
          this._snackbar.open('Failed to save hint data: ' + error, 'Close', {
            duration: 3000,
          });
        },
        complete: () => {
          this.busy.set(false);
        },
      });
  }

  public clearHints(): void {
    if (this.busy()) {
      return;
    }
    this._dialogService
      .confirm('Clear Hints', 'Clear all hint data?')
      .subscribe((result) => {
        if (result) {
          this.data.set(DEFAULT_HINT_DATA);
        }
      });
  }
}
