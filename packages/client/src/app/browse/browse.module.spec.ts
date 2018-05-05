import { BrowseModule } from './browse.module';

describe('BrowseModule', () => {
  let browseModule: BrowseModule;

  beforeEach(() => {
    browseModule = new BrowseModule();
  });

  it('should create an instance', () => {
    expect(browseModule).toBeTruthy();
  });
});
