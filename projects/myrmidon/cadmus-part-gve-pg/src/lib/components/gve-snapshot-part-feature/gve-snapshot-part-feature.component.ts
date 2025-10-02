import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';

import { GveSnapshotPartComponent } from '@myrmidon/cadmus-part-gve-snapshot';

@Component({
  selector: 'cadmus-gve-snapshot-part-feature',
  imports: [CurrentItemBarComponent, GveSnapshotPartComponent],
  templateUrl: './gve-snapshot-part-feature.component.html',
  styleUrl: './gve-snapshot-part-feature.component.css',
})
export class GveSnapshotPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService
    );
  }

  protected override getReqThesauriIds(): string[] {
    return [
      'snapshot-feat-names',
      'snapshot-feat-values',
      'snapshot-efeat-names',
      'snapshot-efeat-values',
      'snapshot-dfeat-names',
      'snapshot-dfeat-values',
    ];
  }
}
