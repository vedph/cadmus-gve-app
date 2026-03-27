import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

// myrmidon
import { EnvService, RamStorageService } from '@myrmidon/ngx-tools';
import { User, AuthJwtService, GravatarPipe } from '@myrmidon/auth-jwt-login';
import { ThemeToggleComponent } from '@myrmidon/ngx-mat-tools';

// bricks
// import { ViafRefLookupService } from '@myrmidon/cadmus-refs-viaf-lookup';
// import { DbpediaRefLookupService } from '@myrmidon/cadmus-refs-dbpedia-lookup';
// import { GeoNamesRefLookupService } from '@myrmidon/cadmus-refs-geonames-lookup';
import { ZoteroRefLookupService } from '@myrmidon/cadmus-refs-zotero-lookup';

// cadmus
import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';
import {
  LOOKUP_CONFIGS_KEY,
  RefLookupConfig,
} from '@myrmidon/cadmus-refs-lookup';

@Component({
  selector: 'app-root',
  imports: [
    RouterModule,
    RouterOutlet,
    MatButtonModule,
    MatDivider,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    GravatarPipe,
    ThemeToggleComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private _subs: Subscription[];

  public readonly user = signal<User | undefined>(undefined);
  public readonly logged = signal<boolean>(false);
  public readonly itemBrowsers = signal<ThesaurusEntry[] | undefined>(
    undefined,
  );
  public readonly version = signal<string>('');

  public readonly branding = computed(() => {
    switch (this._env.get('branding')) {
      case 'staging':
        return {
          bg: 'var(--mat-sys-tertiary)',
          text: 'var(--mat-sys-on-tertiary)',
        };
      case 'dev':
        return {
          bg: 'var(--mat-sys-error)',
          text: 'var(--mat-sys-on-error)',
        };
      default: // Production
        return {
          bg: 'var(--mat-sys-primary)',
          text: 'var(--mat-sys-on-primary)',
        };
    }
  });

  constructor(
    @Inject('itemBrowserKeys')
    private _itemBrowserKeys: { [key: string]: string },
    private _authService: AuthJwtService,
    private _appRepository: AppRepository,
    private _router: Router,
    private _env: EnvService,
    // lookup
    storage: RamStorageService,
    // viaf: ViafRefLookupService,
    // dbpedia: DbpediaRefLookupService,
    // geonames: GeoNamesRefLookupService,
    zotero: ZoteroRefLookupService,
  ) {
    this.version.set(this._env.get('version') || '');
    this._subs = [];

    // configure external lookup for asserted composite IDs
    storage.store(LOOKUP_CONFIGS_KEY, [
      // {
      //   name: 'VIAF',
      //   iconUrl: '/img/viaf128.png',
      //   description: 'Virtual International Authority File',
      //   label: 'ID',
      //   service: viaf,
      //   itemIdGetter: (item: any) => item?.viafid,
      //   itemLabelGetter: (item: any) => item?.term,
      // },
      // {
      //   name: 'DBpedia',
      //   iconUrl: '/img/dbpedia128.png',
      //   description: 'DBpedia',
      //   label: 'ID',
      //   service: dbpedia,
      //   itemIdGetter: (item: any) => item?.uri,
      //   itemLabelGetter: (item: any) => item?.label,
      // },
      // {
      //   name: 'geonames',
      //   iconUrl: '/img/geonames128.png',
      //   description: 'GeoNames',
      //   label: 'ID',
      //   service: geonames,
      //   itemIdGetter: (item: any) => item?.geonameId,
      //   itemLabelGetter: (item: any) => item?.name,
      // },
      {
        name: 'Zotero',
        iconUrl: '/img/zotero128.png',
        description: 'Zotero',
        label: 'ID',
        service: zotero,
        itemIdGetter: (item: any) => `${item?.library?.id}/${item?.key}`,
        itemLabelGetter: (item: any) =>
          `${item?.title} (${item?.library?.id}/${item?.key})`,
      },
    ] as RefLookupConfig[]);
  }

  public ngOnInit(): void {
    this.user.set(this._authService.currentUserValue || undefined);
    this.logged.set(this._authService.isAuthenticated(true));

    this._subs.push(
      this._authService.currentUser$.subscribe((user: User | null) => {
        this.logged.set(this._authService.isAuthenticated(true));
        this.user.set(user || undefined);
        if (user) {
          this._appRepository.load();
        }
      }),
    );

    this._subs.push(
      this._appRepository.itemBrowserThesaurus$.subscribe(
        (thesaurus: Thesaurus | undefined) => {
          this.itemBrowsers.set(thesaurus ? thesaurus.entries : undefined);
        },
      ),
    );
  }

  public ngOnDestroy(): void {
    this._subs.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  public getItemBrowserRoute(id: string): string {
    return this._itemBrowserKeys[id] || id;
  }

  public logout(): void {
    if (!this.logged()) {
      return;
    }
    this._authService.logout().subscribe((_) => {
      this._router.navigate(['/home']);
    });
  }
}
