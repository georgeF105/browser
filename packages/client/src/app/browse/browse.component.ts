import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, tap, switchMap, startWith, filter } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';

export interface Folder {
  id: string;
  name: string;
  type: 'folder';
  items: Array<Folder>;
}

const LOADING_FOLDER: Folder = {
  id: null,
  name: 'Loading...',
  type: 'folder',
  items: []
}

@Component({
  selector: 'browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css']
})
export class BrowseComponent implements OnInit {
  public folderResponse$: Observable<Folder>;
  isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);

  public folderTreeControl = new NestedTreeControl<Folder>(folder => this.getFolderChildren(folder));
  public folderTreeSource = new MatTreeNestedDataSource();

  constructor(
    private apollo: Apollo,
    private activatedRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver
  ) { }

  public ngOnInit (): void {
    this.folderResponse$ = this.activatedRoute.queryParams.pipe(
      map(params => params.folder || ''),
      switchMap(id => this.getFolder(id)),
       tap(result => {
         this.folderTreeSource.data = [result];
       }),
       startWith(LOADING_FOLDER)
      );
  }

  public hasNestedChild = (_: number, folder: Folder) => {
    return folder.items && folder.items.length;
  };

  private getFolderChildren (folder: Folder): Observable<Folder[]> {
    return this.folderTreeControl.expansionModel.onChange.pipe(
      filter(() => this.folderTreeControl.isExpanded(folder)),
      switchMap(() => this.getFolder(folder.id)),
      map(folder => folder.items)
    );
  }

  private getFolder (id: string): Observable<Folder> {
    return this.apollo.query<{ folder: Folder }>({
      query: gql`{
        folder (id: "${id}") {
          id
          name
          items {
            id
            name
            items {
              id
            }
          }
        }
      }`
    }).pipe(map(result => result.data.folder));
  }

  public trackByFolderId (folder: Folder): string {
    return folder.id;
  }
}
