import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, of } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, tap, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';

export interface Folder {
  id: string;
  name: string;
  type: 'folder';
  items: Array<Folder>;
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
         console.log('result', result);
         this.folderTreeSource.data = [result];
       })
      );
  }

  public hasNestedChild = (_: number, folder: Folder) => {
    return folder.items && folder.items.length;
  };

  private getFolderChildren (folder: Folder): Observable<Folder[]> {
    return this.getFolder(folder.id).pipe(
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
    }).pipe(
      map(result => result.data.folder)
    );
  }
}
