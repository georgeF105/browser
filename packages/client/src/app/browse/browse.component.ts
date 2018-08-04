import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, tap, filter, switchMapTo } from 'rxjs/operators';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl, CdkTree } from '@angular/cdk/tree';
import { Folder, FileItem, isFolder } from '@browser/types';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css']
})
export class BrowseComponent implements OnInit {
  isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);

  public folderTreeControl = new NestedTreeControl<FileItem>(folder => this.getFolderChildren(<Folder>folder));
  public folderTreeSource = new MatTreeNestedDataSource();
  public folderTreeSource$: Observable<Array<Folder>>;

  @ViewChild('folderTree') folderTree: CdkTree<FileItem>;

  constructor(
    private apollo: Apollo,
    private breakpointObserver: BreakpointObserver
  ) { }

  public ngOnInit (): void {
    this.folderTreeSource$ = this.getFolder('').pipe(
      map(response => {
        return [response];
      })
    );
  }

  public hasNestedChild = (_: number, folder: Folder) => {
    const hasNestedChild = isFolder(folder);
    return hasNestedChild;
  }

  private getFolderChildren (folder: Folder): Observable<FileItem[]> {
    return this.folderTreeControl.expansionModel.onChange.pipe(
      filter(() => this.folderTreeControl.isExpanded(folder)),
      switchMapTo(this.getFolder(folder.id)),
      map((_folder: Folder) => _folder && _folder.items || [])
    );
  }

  private getFolder (id: string): Observable<Folder> {
    return this.apollo.subscribe({
      query: gql`
        subscription {
          fileItemChanged (id: "${id}") {
            id
            name
            type
            items {
              id
              name
              type
            }
          }
      }`
    }).pipe(
      map(results => results.data.fileItemChanged)
    );
  }

  public trackByFolderId (folder: Folder): string {
    return folder.id + folder.name;
  }
}
