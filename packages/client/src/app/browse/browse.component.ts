import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css']
})
export class BrowseComponent implements OnInit {
  public folderResponse$: any;
  isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);
  constructor(
    private apollo: Apollo,
    private breakpointObserver: BreakpointObserver
  ) { }

  public ngOnInit (): void {
    this.folderResponse$ = this.apollo.query({
      query: gql`
      {
        folders {
          id
          name
          items {
            id
            name
          }
        }
      }`
    }).pipe(tap(response => console.log('response', response)));
  }
}
