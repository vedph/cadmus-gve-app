import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { BehaviorSubject } from 'rxjs';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditedObject, Part, PartIdentity } from '@myrmidon/cadmus-core';
import { PartEditorService } from '@myrmidon/cadmus-state';
import {
  GVE_SNAPSHOT_PART_TYPEID,
  GveSnapshotPart,
} from '@myrmidon/cadmus-part-gve-snapshot';

import { GveSnapshotPartFeatureComponent } from './gve-snapshot-part-feature.component';

const ITEM_ID = '11111111-1111-1111-1111-111111111111';
const PART_ID = '22222222-2222-2222-2222-222222222222';
const NEW_PART_ID = '33333333-3333-3333-3333-333333333333';
const THESAURI_IDS = [
  'snapshot-feat-names',
  'snapshot-feat-values',
  'snapshot-source-ids',
  'snapshot-source-types',
];

function createPart(id = PART_ID): GveSnapshotPart {
  return {
    id,
    itemId: ITEM_ID,
    typeId: GVE_SNAPSHOT_PART_TYPEID,
    timeCreated: new Date(),
    creatorId: 'zeus',
    timeModified: new Date(),
    userId: 'zeus',
    value: { text: 'hello', operations: [] },
  };
}

/**
 * Stand-in for the snapshot part editor: shows its inputs and lets the
 * user emit its outputs.
 */
@Component({
  selector: 'cadmus-gve-snapshot-part',
  imports: [JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pre aria-label="identity">{{ identity() | json }}</pre>
    <pre aria-label="data">{{ data() ?? 'none' | json }}</pre>
    <button type="button" (click)="dataChange.emit({ value: edited(), thesauri: {} })">
      save
    </button>
    <button type="button" (click)="dirtyChange.emit(true)">edit</button>
    <button type="button" (click)="editorClose.emit()">close</button>
  `,
})
class MockSnapshotPartComponent {
  public readonly identity = input<PartIdentity>();
  public readonly data = input<EditedObject<GveSnapshotPart>>();
  public readonly dataChange = output<EditedObject<GveSnapshotPart>>();
  public readonly dirtyChange = output<boolean>();
  public readonly editorClose = output();

  public edited(): GveSnapshotPart {
    const part = this.data()?.value || createPart('');
    return { ...part, value: { text: 'edited', operations: [] } };
  }
}

@Component({
  selector: 'cadmus-current-item-bar',
  template: `<p>current item</p>`,
})
class MockCurrentItemBarComponent {}

interface SetupOptions {
  pid?: string;
  rid?: string;
  load?: () => Promise<EditedObject<Part> | undefined>;
  save?: (part: Part) => Promise<Part>;
}

async function setup(options: SetupOptions = {}) {
  const editorService = {
    loading$: new BehaviorSubject(false),
    saving$: new BehaviorSubject(false),
    load: vi.fn(
      options.load ??
        (() =>
          Promise.resolve({
            value: createPart(),
            thesauri: {},
          } as EditedObject<Part>)),
    ),
    save: vi.fn(options.save ?? ((part: Part) => Promise.resolve(part))),
  };
  const snackbar = { open: vi.fn() };
  const router = { navigate: vi.fn(() => Promise.resolve(true)) };
  const route = {
    snapshot: {
      params: { iid: ITEM_ID, pid: options.pid ?? PART_ID },
      queryParams: options.rid ? { rid: options.rid } : {},
      routeConfig: { path: `${GVE_SNAPSHOT_PART_TYPEID}/:pid` },
    },
  };

  const result = await render(GveSnapshotPartFeatureComponent, {
    componentImports: [MockCurrentItemBarComponent, MockSnapshotPartComponent],
    providers: [
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: route },
      { provide: MatSnackBar, useValue: snackbar },
      { provide: ItemService, useValue: {} },
      { provide: ThesaurusService, useValue: {} },
      { provide: PartEditorService, useValue: editorService },
    ],
  });
  await result.fixture.whenStable();
  return { ...result, editorService, snackbar, router };
}

function json(label: string): any {
  return JSON.parse(screen.getByLabelText(label).textContent!);
}

describe('GveSnapshotPartFeatureComponent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the current item bar and the part editor', async () => {
    await setup();
    expect(screen.getByText('current item')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'save' })).toBeTruthy();
  });

  describe('identity', () => {
    it('should build the identity from the route', async () => {
      await setup({ rid: 'draft' });
      expect(json('identity')).toEqual({
        itemId: ITEM_ID,
        typeId: GVE_SNAPSHOT_PART_TYPEID,
        partId: PART_ID,
        roleId: 'draft',
      });
    });

    it('should have no part ID for a new part', async () => {
      await setup({ pid: 'new' });
      expect(json('identity').partId).toBeNull();
    });

    it('should have no role ID for the default role', async () => {
      await setup({ rid: 'default' });
      expect(json('identity').roleId).toBeNull();
    });
  });

  describe('loading', () => {
    it('should load the part with the snapshot thesauri', async () => {
      const { editorService } = await setup();
      expect(editorService.load).toHaveBeenCalledWith(
        {
          itemId: ITEM_ID,
          typeId: GVE_SNAPSHOT_PART_TYPEID,
          partId: PART_ID,
          roleId: undefined,
        },
        THESAURI_IDS,
      );
    });

    it('should pass the loaded data to the editor', async () => {
      await setup();
      expect(json('data').value).toMatchObject({
        id: PART_ID,
        value: { text: 'hello', operations: [] },
      });
    });

    it('should leave the editor without data when nothing is loaded', async () => {
      await setup({ load: () => Promise.resolve(undefined) });
      expect(json('data')).toBe('none');
    });

    it('should notify loading errors', async () => {
      const { snackbar } = await setup({
        load: () => Promise.reject({ message: 'load failed' }),
      });
      expect(snackbar.open).toHaveBeenCalledWith('load failed', 'OK');
    });
  });

  describe('saving', () => {
    it('should save the edited part and notify it', async () => {
      const { editorService, snackbar, fixture } = await setup();
      await userEvent.click(screen.getByRole('button', { name: 'save' }));
      await fixture.whenStable();

      expect(editorService.save).toHaveBeenCalledTimes(1);
      const saved = editorService.save.mock.calls[0][0] as GveSnapshotPart;
      expect(saved.id).toBe(PART_ID);
      expect(saved.value).toEqual({ text: 'edited', operations: [] });
      expect(snackbar.open).toHaveBeenCalledWith('Part saved', 'OK', {
        duration: 3000,
      });
    });

    it('should set the part ID in identity once a new part is saved', async () => {
      const { fixture } = await setup({
        pid: 'new',
        load: () =>
          Promise.resolve({ thesauri: {} } as unknown as EditedObject<Part>),
        save: (part) => Promise.resolve({ ...part, id: NEW_PART_ID }),
      });
      await userEvent.click(screen.getByRole('button', { name: 'save' }));
      await fixture.whenStable();
      expect(json('identity').partId).toBe(NEW_PART_ID);
    });

    it('should keep the part ID of an existing part when saved', async () => {
      const { fixture } = await setup({
        save: (part) => Promise.resolve({ ...part, id: NEW_PART_ID }),
      });
      await userEvent.click(screen.getByRole('button', { name: 'save' }));
      await fixture.whenStable();
      expect(json('identity').partId).toBe(PART_ID);
    });

    it('should notify save errors and keep pending changes', async () => {
      const { snackbar, fixture } = await setup({
        save: () => Promise.reject({ message: 'save failed' }),
      });
      await userEvent.click(screen.getByRole('button', { name: 'save' }));
      await fixture.whenStable();
      expect(snackbar.open).toHaveBeenCalledWith('save failed', 'OK');
      expect(fixture.componentInstance.canDeactivate()).toBe(false);
    });
  });

  describe('pending changes', () => {
    it('should allow leaving without changes', async () => {
      const { fixture } = await setup();
      expect(fixture.componentInstance.canDeactivate()).toBe(true);
    });

    it('should prevent leaving when the editor is dirty', async () => {
      const { fixture } = await setup();
      await userEvent.click(screen.getByRole('button', { name: 'edit' }));
      expect(fixture.componentInstance.canDeactivate()).toBe(false);
    });
  });

  it('should navigate back to the item when the editor is closed', async () => {
    const { router } = await setup();
    await userEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(router.navigate).toHaveBeenCalledWith(['items', ITEM_ID]);
  });
});
