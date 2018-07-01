import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';

import {
  NgrxCacheModule,
  NgrxCache,
  apolloReducer,
} from 'apollo-angular-cache-ngrx';

import { environment } from '../../environments/environment';

export interface State {

}

export const reducers: ActionReducerMap<State> = {
  apollo: apolloReducer
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
