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
import { forkJoin, retry, switchMap } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
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
  GveRenditionSettings,
  HintDesignerData,
  HintDesignerSettings,
  StringPair,
} from '@myrmidon/gve-snapshot-rendition';
import { DEFAULT_HINT_DESIGNER_SETTINGS } from '@myrmidon/gve-snapshot-rendition';
import { GVE_SNAPSHOT_PART_TYPEID } from '@myrmidon/cadmus-part-gve-snapshot';

// default hint data
const DEFAULT_HINT_DATA: HintDesignerData = {
  hints: {},
  animations: {
    fadeIn: 'return gsap.from(hintEl, { opacity: 0, duration: 0.5 });',
  },
};

/**
 * Hint Editor Page Component.
 * This component wraps a hints designer custom web component to edit a part of the backend
 * settings, referred to hints and animations. This is represented by interface HintDesignerData,
 * from which GveRenditionSettings is derived as a superset. So, when loading data, it loads
 * settings and extracts only the data used by the hints designer; when saving data, it loads
 * settings, overrides them with edited hints and animations, and finally saves them back.
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
    private _injector: Injector,
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
          { injector: this._injector },
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
          { injector: this._injector },
        );
      },
      { injector: this._injector },
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

    // set initial settings
    designer.settings = this.settings();
    this.loadHints();
  }

  public loadHints(): void {
    if (this.busy()) {
      return;
    }

    // load data from settings service and set on designer
    this.busy.set(true);
    this._edSettingService
      .getSetting<GveRenditionSettings>(GVE_SNAPSHOT_PART_TYPEID)
      .pipe(retry(3))
      .subscribe({
        next: (data: GveRenditionSettings) => {
          if (data) {
            console.log(
              'Loaded rendition settings for key:',
              GVE_SNAPSHOT_PART_TYPEID,
              data,
            );
            // set data on designer
            this.data.set(data || DEFAULT_HINT_DATA);
          }
        },
        error: (error) => {
          this._snackbar.open(
            'Failed to load rendition settings: ' + error,
            'Close',
            {
              duration: 3000,
            },
          );
        },
        complete: () => {
          this.busy.set(false);
        },
      });

    // load variables from settings service and set on designer
    this._edSettingService
      .getSetting<StringPair[]>('gveHintDesignerVariables')
      .pipe(retry(3))
      .subscribe({
        next: (variables: StringPair[] | null) => {
          if (variables) {
            console.log('Loaded designer variables:', variables);
            this.designerRef.nativeElement.hintVariables = variables;
          }
        },
        error: (error) => {
          this._snackbar.open(
            'Failed to load designer variables: ' + error,
            'Close',
            {
              duration: 3000,
            },
          );
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
    const currentVariables = this.designerRef.nativeElement.hintVariables;
    console.log('Saving hint data:', currentData);
    console.log('Saving hint variables:', currentVariables);

    // save rendition settings: load existing, merge with current hint data, then save
    const saveSettings$ = this._edSettingService
      .getSetting<GveRenditionSettings>(GVE_SNAPSHOT_PART_TYPEID)
      .pipe(
        retry(3),
        switchMap((existingSettings: GveRenditionSettings | null) => {
          // merge current hint data into existing settings
          const mergedSettings: GveRenditionSettings = {
            ...(existingSettings || {}),
            hints: currentData.hints,
            animations: currentData.animations,
          } as GveRenditionSettings;
          console.log('Merged rendition settings:', mergedSettings);
          return this._edSettingService.addSetting(
            GVE_SNAPSHOT_PART_TYPEID,
            mergedSettings,
          );
        }),
      );

    // save variables
    const saveVariables$ = this._edSettingService
      .addSetting<StringPair[]>('gveHintDesignerVariables', currentVariables)
      .pipe(retry(3));

    // execute both saves in parallel
    forkJoin([saveSettings$, saveVariables$]).subscribe({
      next: () => {
        this._snackbar.open('Rendition settings saved.', 'Close', {
          duration: 2000,
        });
      },
      error: (error) => {
        this._snackbar.open(
          'Failed to save rendition settings: ' + error,
          'Close',
          {
            duration: 3000,
          },
        );
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
      .confirm('Clear Hints', 'Clear all rendition settings?')
      .subscribe((result) => {
        if (result) {
          this.data.set(DEFAULT_HINT_DATA);
        }
      });
  }
}
