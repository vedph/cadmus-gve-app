import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { JsonPipe, TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import {
  EditedObject,
  PartIdentity,
  ThesauriSet,
  Thesaurus,
} from '@myrmidon/cadmus-core';
import { EditorSettingsService } from '@myrmidon/cadmus-api';
import { AppRepository } from '@myrmidon/cadmus-state';
import { EditorHelpService } from '@myrmidon/cadmus-ui';
import {
  FeatureDefinitions,
  FeatureSetPolicy,
  LabeledId,
  Snapshot,
} from '@myrmidon/gve-core';
import { GveRenditionSettings } from '@myrmidon/gve-snapshot-rendition';
import { EnvService } from '@myrmidon/ngx-tools';

import { GveSnapshotPartComponent } from './gve-snapshot-part.component';
import { GVE_SNAPSHOT_PART_TYPEID, GveSnapshotPart } from '../gve-snapshot-part';
import { renderOperationSummary } from '../render-op-summary';

const EDITED_SNAPSHOT: Snapshot = { text: 'edited', operations: [] };

/**
 * Stand-in for gve-core's snapshot editor, which is a heavy component
 * outside the scope of these tests. It shows what it receives and lets
 * the user emit its outputs.
 */
@Component({
  selector: 'gve-snapshot-editor',
  imports: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-label="snapshot editor">
      <p>{{ noSave() ? 'read-only' : 'editable' }}</p>
      <p>
        {{ isCustomSummary() ? 'custom summary' : 'default summary' }}
      </p>
      <pre aria-label="snapshot">{{ snapshot() ?? 'none' | json }}</pre>
      <pre aria-label="feature definitions">{{
        featureDefs() ?? 'none' | json
      }}</pre>
      <pre aria-label="multi-valued features">{{
        multiValuedFeatureIds() | json
      }}</pre>
      <pre aria-label="source IDs">{{ sourceIds() ?? 'none' | json }}</pre>
      <pre aria-label="source types">{{ sourceTypes() ?? 'none' | json }}</pre>
      <p aria-label="font size">{{ renditionSettings()?.fontSize }}</p>
      <button type="button" (click)="snapshotChange.emit(edited)">
        save snapshot
      </button>
      <button type="button" (click)="snapshotChange.emit(null)">
        clear snapshot
      </button>
      <button type="button" (click)="snapshotCancel.emit()">cancel</button>
    </section>
  `,
})
class MockSnapshotEditorComponent {
  public readonly edited = EDITED_SNAPSHOT;
  public readonly snapshot = input<Snapshot | undefined>();
  public readonly noSave = input<boolean | undefined>();
  public readonly featureDefs = input<FeatureDefinitions | undefined>();
  public readonly multiValuedFeatureIds = input<string[] | undefined>();
  public readonly sourceIds = input<LabeledId[] | undefined>();
  public readonly sourceTypes = input<LabeledId[] | undefined>();
  public readonly renditionSettings = input<GveRenditionSettings>();
  public readonly isCustomSummary = computed(
    () => this.renditionSettings()?.opSummaryFn === renderOperationSummary,
  );
  public readonly snapshotChange = output<Snapshot | null>();
  public readonly snapshotCancel = output();
}

const ITEM_ID = '11111111-1111-1111-1111-111111111111';
const PART_ID = '22222222-2222-2222-2222-222222222222';

function thesaurus(id: string, entries: [string, string][]): Thesaurus {
  return {
    id,
    language: 'en',
    entries: entries.map(([id, value]) => ({ id, value })),
  };
}

function createPart(roleId?: string): GveSnapshotPart {
  return {
    id: PART_ID,
    itemId: ITEM_ID,
    typeId: GVE_SNAPSHOT_PART_TYPEID,
    roleId,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    value: { text: 'hello', operations: [] },
  };
}

interface SetupOptions {
  data?: EditedObject<GveSnapshotPart>;
  identity?: PartIdentity;
  disabled?: boolean;
  user?: User | null;
  env?: Record<string, string | undefined>;
  /** Settings by key: missing keys return {} like the backend does. */
  settings?: Record<string, Observable<unknown>>;
  typeThesaurus?: Thesaurus;
}

async function setup(options: SetupOptions = {}) {
  const user =
    options.user === undefined
      ? ({ userName: 'zeus', roles: ['admin'] } as User)
      : options.user;
  const env = options.env ?? { multiValuedFeatureIds: 'r_hints' };
  const settings = options.settings ?? {};
  const getSetting = vi.fn((key: string) => settings[key] ?? of({}));

  const dataChange = vi.fn();
  const editorClose = vi.fn();
  const dirtyChange = vi.fn();

  const result = await render(GveSnapshotPartComponent, {
    componentImports: [
      ReactiveFormsModule,
      MatCardModule,
      MatIconModule,
      TitleCasePipe,
      MockSnapshotEditorComponent,
    ],
    inputs: {
      data: options.data,
      identity: options.identity,
      disabled: options.disabled,
    },
    on: { editorClose, dirtyChange },
    providers: [
      {
        provide: AuthJwtService,
        useValue: {
          currentUserValue: user,
          currentUser$: new BehaviorSubject<User | null>(user),
        },
      },
      { provide: EnvService, useValue: { get: (key: string) => env[key] } },
      { provide: EditorSettingsService, useValue: { getSetting } },
      {
        provide: AppRepository,
        useValue: { getTypeThesaurus: () => options.typeThesaurus },
      },
      {
        provide: EditorHelpService,
        useValue: { resolveUrl: () => Promise.resolve(undefined) },
      },
    ],
  });
  // data is a model: its dataChange output is not typed by render's on
  result.fixture.componentInstance.data.subscribe(dataChange);
  await result.fixture.whenStable();
  return { ...result, getSetting, dataChange, editorClose, dirtyChange };
}

function json(label: string): unknown {
  const text = screen.getByLabelText(label).textContent!;
  return JSON.parse(text);
}

describe('GveSnapshotPartComponent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('title', () => {
    it('should show the default title without a types thesaurus', async () => {
      await setup();
      expect(screen.getByText('Snapshot Part')).toBeTruthy();
    });

    it('should show the title-cased model name from the types thesaurus', async () => {
      await setup({
        identity: {
          itemId: ITEM_ID,
          typeId: GVE_SNAPSHOT_PART_TYPEID,
          partId: PART_ID,
          roleId: null,
        },
        typeThesaurus: thesaurus('model-types', [
          [GVE_SNAPSHOT_PART_TYPEID, 'text snapshot'],
        ]),
      });
      expect(screen.getByText('Text Snapshot')).toBeTruthy();
    });
  });

  describe('snapshot', () => {
    it('should pass no snapshot without data', async () => {
      await setup();
      expect(json('snapshot')).toBe('none');
    });

    it('should pass the part snapshot to the editor', async () => {
      await setup({ data: { value: createPart(), thesauri: {} } });
      expect(json('snapshot')).toEqual({ text: 'hello', operations: [] });
    });

    it('should pass no snapshot when data has no part', async () => {
      await setup({ data: { value: null, thesauri: {} } });
      expect(json('snapshot')).toBe('none');
    });

    it('should update the snapshot when data change', async () => {
      const { fixture } = await setup({
        data: { value: createPart(), thesauri: {} },
      });
      const part = createPart();
      part.value = { text: 'changed', operations: [] };
      fixture.componentRef.setInput('data', { value: part, thesauri: {} });
      await fixture.whenStable();
      expect(json('snapshot')).toEqual({ text: 'changed', operations: [] });
    });
  });

  describe('authorization', () => {
    it.each([
      ['admin', 'editable'],
      ['editor', 'editable'],
      ['operator', 'editable'],
      ['visitor', 'read-only'],
    ])('should let %s be %s', async (role, expected) => {
      await setup({ user: { userName: 'u', roles: [role] } as User });
      expect(screen.getByText(expected)).toBeTruthy();
    });

    it('should be read-only without a user', async () => {
      await setup({ user: null });
      expect(screen.getByText('read-only')).toBeTruthy();
    });

    it('should be read-only when disabled', async () => {
      await setup({ disabled: true });
      expect(screen.getByText('read-only')).toBeTruthy();
    });
  });

  describe('multi-valued feature IDs', () => {
    it('should default to r_hints', async () => {
      await setup({ env: {} });
      expect(json('multi-valued features')).toEqual(['r_hints']);
    });

    it('should read space-separated IDs from environment', async () => {
      await setup({ env: { multiValuedFeatureIds: ' r_hints  a b ' } });
      expect(json('multi-valued features')).toEqual(['r_hints', 'a', 'b']);
    });
  });

  describe('feature definitions', () => {
    function data(thesauri: ThesauriSet): EditedObject<GveSnapshotPart> {
      return { value: createPart(), thesauri };
    }

    it('should be undefined without thesauri and properties', async () => {
      await setup({ data: data({}) });
      expect(json('feature definitions')).toBe('none');
    });

    it('should map names and values thesauri', async () => {
      await setup({
        data: data({
          'snapshot-feat-names': thesaurus('snapshot-feat-names', [
            ['clr', 'color'],
            ['sz', 'size'],
          ]),
          'snapshot-feat-values': thesaurus('snapshot-feat-values', [
            ['clr:r', 'red'],
            ['clr:g', 'green'],
            ['sz:big', 'big'],
            ['sz:a:b', 'a:b'],
          ]),
        }),
      });
      expect(json('feature definitions')).toEqual({
        names: [
          { id: 'clr', label: 'color' },
          { id: 'sz', label: 'size' },
        ],
        values: {
          clr: [
            { id: 'r', label: 'red' },
            { id: 'g', label: 'green' },
          ],
          sz: [
            { id: 'big', label: 'big' },
            { id: 'a:b', label: 'a:b' },
          ],
        },
      });
    });

    it('should skip and warn about invalid value entries', async () => {
      await setup({
        data: data({
          'snapshot-feat-names': thesaurus('snapshot-feat-names', [
            ['clr', 'color'],
          ]),
          'snapshot-feat-values': thesaurus('snapshot-feat-values', [
            ['clr', 'no separator'],
            [':r', 'no name'],
            ['clr:r', 'red'],
          ]),
        }),
      });
      expect(json('feature definitions')).toEqual({
        names: [{ id: 'clr', label: 'color' }],
        values: { clr: [{ id: 'r', label: 'red' }] },
      });
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    it('should map names without values', async () => {
      await setup({
        data: data({
          'snapshot-feat-names': thesaurus('snapshot-feat-names', [
            ['clr', 'color'],
          ]),
        }),
      });
      expect(json('feature definitions')).toEqual({
        names: [{ id: 'clr', label: 'color' }],
      });
    });

    it('should map values without names', async () => {
      await setup({
        data: data({
          'snapshot-feat-values': thesaurus('snapshot-feat-values', [
            ['clr:r', 'red'],
          ]),
        }),
      });
      expect(json('feature definitions')).toEqual({
        values: { clr: [{ id: 'r', label: 'red' }] },
      });
    });

    it('should clear definitions when new data lack thesauri', async () => {
      const { fixture } = await setup({
        data: data({
          'snapshot-feat-names': thesaurus('snapshot-feat-names', [
            ['clr', 'color'],
          ]),
        }),
      });
      fixture.componentRef.setInput('data', data({}));
      await fixture.whenStable();
      expect(json('feature definitions')).toBe('none');
    });

    it('should add feature properties from settings', async () => {
      await setup({
        data: data({
          'snapshot-feat-names': thesaurus('snapshot-feat-names', [
            ['log', 'log'],
          ]),
        }),
        settings: {
          gveFeatureProperties: of({
            log: { setPolicy: 'single', isGlobal: true },
            version: {
              setPolicy: 'single-first',
              isNegated: true,
              isShortLived: true,
            },
            tag: { setPolicy: 'multiple' },
            odd: { setPolicy: 'unknown' },
          }),
        },
      });
      expect(json('feature definitions')).toEqual({
        names: [{ id: 'log', label: 'log' }],
        props: {
          log: { setPolicy: FeatureSetPolicy.single, isGlobal: true },
          version: {
            setPolicy: FeatureSetPolicy.singleFirst,
            isNegated: true,
            isShortLived: true,
          },
          tag: { setPolicy: FeatureSetPolicy.multiple },
          odd: { setPolicy: FeatureSetPolicy.multiple },
        },
      });
    });

    it('should provide feature properties even without thesauri', async () => {
      await setup({
        settings: {
          gveFeatureProperties: of({ log: { setPolicy: 'single' } }),
        },
      });
      expect(json('feature definitions')).toEqual({
        props: { log: { setPolicy: FeatureSetPolicy.single } },
      });
    });

    it('should ignore empty feature properties', async () => {
      await setup({ settings: { gveFeatureProperties: of({}) } });
      expect(json('feature definitions')).toBe('none');
    });

    it('should log an error when feature properties fail to load', async () => {
      await setup({
        settings: { gveFeatureProperties: throwError(() => 'boom') },
      });
      expect(json('feature definitions')).toBe('none');
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load gveFeatureProperties: boom',
      );
    });
  });

  describe('sources', () => {
    it('should be undefined without thesauri', async () => {
      await setup({ data: { value: createPart(), thesauri: {} } });
      expect(json('source IDs')).toBe('none');
      expect(json('source types')).toBe('none');
    });

    it('should map source IDs and types thesauri', async () => {
      await setup({
        data: {
          value: createPart(),
          thesauri: {
            'snapshot-source-ids': thesaurus('snapshot-source-ids', [
              ['ms-a', 'manuscript A'],
            ]),
            'snapshot-source-types': thesaurus('snapshot-source-types', [
              ['ms', 'manuscript'],
              ['ed', 'edition'],
            ]),
          },
        },
      });
      expect(json('source IDs')).toEqual([
        { id: 'ms-a', label: 'manuscript A' },
      ]);
      expect(json('source types')).toEqual([
        { id: 'ms', label: 'manuscript' },
        { id: 'ed', label: 'edition' },
      ]);
    });
  });

  describe('rendition settings', () => {
    const DEFAULT_KEY = GVE_SNAPSHOT_PART_TYPEID;
    const ROLE_KEY = GVE_SNAPSHOT_PART_TYPEID + '_draft';

    it('should load the default settings and use the custom summary', async () => {
      const { getSetting } = await setup({
        settings: { [DEFAULT_KEY]: of({ fontSize: 24 }) },
      });
      expect(getSetting).toHaveBeenCalledWith(DEFAULT_KEY);
      expect(screen.getByLabelText('font size').textContent).toBe('24');
      expect(screen.getByText('custom summary')).toBeTruthy();
    });

    it('should keep the built-in defaults when no settings exist', async () => {
      await setup();
      expect(screen.getByText('default summary')).toBeTruthy();
    });

    it('should log an error when settings fail to load', async () => {
      await setup({
        settings: { [DEFAULT_KEY]: throwError(() => 'boom') },
      });
      expect(screen.getByText('default summary')).toBeTruthy();
      expect(console.error).toHaveBeenCalledWith(
        `Failed to load rendition settings for key ${DEFAULT_KEY}: boom`,
      );
    });

    it('should load role-specific settings for the part role', async () => {
      const { getSetting } = await setup({
        data: { value: createPart('draft'), thesauri: {} },
        settings: {
          [DEFAULT_KEY]: of({ fontSize: 24 }),
          [ROLE_KEY]: of({ fontSize: 12 }),
        },
      });
      expect(getSetting).toHaveBeenCalledWith(ROLE_KEY);
      expect(screen.getByLabelText('font size').textContent).toBe('12');
    });

    it('should load role-specific settings for the identity role of a new part', async () => {
      const { getSetting } = await setup({
        identity: {
          itemId: ITEM_ID,
          typeId: GVE_SNAPSHOT_PART_TYPEID,
          partId: null,
          roleId: 'draft',
        },
        data: { value: null, thesauri: {} },
        settings: { [ROLE_KEY]: of({ fontSize: 12 }) },
      });
      expect(getSetting).toHaveBeenCalledWith(ROLE_KEY);
      expect(screen.getByLabelText('font size').textContent).toBe('12');
    });

    it('should keep default settings when role-specific settings are missing', async () => {
      await setup({
        data: { value: createPart('draft'), thesauri: {} },
        settings: { [DEFAULT_KEY]: of({ fontSize: 24 }) },
      });
      expect(screen.getByLabelText('font size').textContent).toBe('24');
      expect(screen.getByText('custom summary')).toBeTruthy();
    });

    it('should prefer role-specific settings when default ones arrive later', async () => {
      const defaults$ = new Subject<unknown>();
      const { fixture } = await setup({
        data: { value: createPart('draft'), thesauri: {} },
        settings: {
          [DEFAULT_KEY]: defaults$,
          [ROLE_KEY]: of({ fontSize: 12 }),
        },
      });
      defaults$.next({ fontSize: 24 });
      defaults$.complete();
      await fixture.whenStable();
      expect(screen.getByLabelText('font size').textContent).toBe('12');
    });

    it('should ignore stale settings of a previous role', async () => {
      const draft$ = new Subject<unknown>();
      const { fixture } = await setup({
        data: { value: createPart('draft'), thesauri: {} },
        settings: {
          [ROLE_KEY]: draft$,
          [GVE_SNAPSHOT_PART_TYPEID + '_final']: of({ fontSize: 30 }),
        },
      });
      fixture.componentRef.setInput('data', {
        value: createPart('final'),
        thesauri: {},
      });
      await fixture.whenStable();
      draft$.next({ fontSize: 12 });
      draft$.complete();
      await fixture.whenStable();
      expect(screen.getByLabelText('font size').textContent).toBe('30');
    });

    it('should not reload role-specific settings on save', async () => {
      const { getSetting } = await setup({
        data: { value: createPart('draft'), thesauri: {} },
      });
      await userEvent.click(screen.getByRole('button', { name: 'save snapshot' }));
      const roleCalls = getSetting.mock.calls.filter(([k]) => k === ROLE_KEY);
      expect(roleCalls).toHaveLength(1);
    });
  });

  describe('editing', () => {
    it('should emit the saved part with the edited snapshot', async () => {
      const { dataChange } = await setup({
        data: { value: createPart(), thesauri: {} },
      });
      await userEvent.click(screen.getByRole('button', { name: 'save snapshot' }));

      expect(dataChange).toHaveBeenCalledTimes(1);
      const saved = dataChange.mock.calls[0][0] as EditedObject<GveSnapshotPart>;
      expect(saved.value!.id).toBe(PART_ID);
      expect(saved.value!.itemId).toBe(ITEM_ID);
      expect(saved.value!.typeId).toBe(GVE_SNAPSHOT_PART_TYPEID);
      expect(saved.value!.value).toEqual(EDITED_SNAPSHOT);
      expect(saved.thesauri).toEqual({});
      // the editor shows the saved snapshot
      expect(json('snapshot')).toEqual(EDITED_SNAPSHOT);
    });

    it('should build a new part from identity when saving without a part', async () => {
      const { dataChange } = await setup({
        identity: {
          itemId: ITEM_ID,
          typeId: GVE_SNAPSHOT_PART_TYPEID,
          partId: null,
          roleId: 'draft',
        },
      });
      await userEvent.click(screen.getByRole('button', { name: 'save snapshot' }));

      const saved = dataChange.mock.calls[0][0] as EditedObject<GveSnapshotPart>;
      expect(saved.value).toMatchObject({
        id: '',
        itemId: ITEM_ID,
        typeId: GVE_SNAPSHOT_PART_TYPEID,
        roleId: 'draft',
        value: EDITED_SNAPSHOT,
      });
    });

    it('should not mutate the input part when saving', async () => {
      const part = createPart();
      await setup({ data: { value: part, thesauri: {} } });
      await userEvent.click(screen.getByRole('button', { name: 'save snapshot' }));
      expect(part.value).toEqual({ text: 'hello', operations: [] });
    });

    it('should report dirty and then clean state around a save', async () => {
      const { dirtyChange } = await setup({
        data: { value: createPart(), thesauri: {} },
      });
      await userEvent.click(screen.getByRole('button', { name: 'save snapshot' }));
      expect(dirtyChange).toHaveBeenCalledWith(true);
      expect(dirtyChange).toHaveBeenLastCalledWith(false);
    });

    it('should not save a cleared snapshot but report it as dirty', async () => {
      const { dataChange, dirtyChange } = await setup({
        data: { value: createPart(), thesauri: {} },
      });
      await userEvent.click(
        screen.getByRole('button', { name: 'clear snapshot' }),
      );
      expect(dataChange).not.toHaveBeenCalled();
      expect(dirtyChange).toHaveBeenLastCalledWith(true);
    });

    it('should request closing the editor on cancel', async () => {
      const { editorClose } = await setup();
      await userEvent.click(screen.getByRole('button', { name: 'cancel' }));
      expect(editorClose).toHaveBeenCalledTimes(1);
    });
  });
});
