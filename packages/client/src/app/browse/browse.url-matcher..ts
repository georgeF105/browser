import { UrlSegment, UrlSegmentGroup, Route, UrlMatchResult } from '@angular/router';
import { access } from 'fs';

export function browseUrlMatcher (segments: UrlSegment[], group: UrlSegmentGroup, route: Route): UrlMatchResult {

  const path = segments.map(segment => segment.path).join('/');


  return {
    consumed: segments,
    posParams: {
      path: new UrlSegment(path, {path})
    }
  };
}
