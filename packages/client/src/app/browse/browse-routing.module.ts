import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowseComponent } from './browse.component';
import { browseUrlMatcher } from './browse.url-matcher.';

const routes: Routes = [
  {
    matcher: browseUrlMatcher,
    component: BrowseComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrowseRoutingModule { }
