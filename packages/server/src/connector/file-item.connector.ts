import { FileItem, isFolder, Folder, File, NormalFileItem } from '../../../types/dist';
import * as path from 'path';
import { FileItemDatabase } from '../data-base/folder-database';
import { PubSub } from 'graphql-subscriptions';

export const FILE_ITEM_CHANGE = 'FILE_ITEM_CHANGE';

export class FileItemConnector {
  private _normalFileItems: { [key: string]: NormalFileItem } = {};

  constructor (
    private _fileItemDatabase: FileItemDatabase,
    private _pubSub: PubSub
  ) {
    this._fileItemDatabase.watchFileChange('', id => {
      this._pubSub.publish(FILE_ITEM_CHANGE, {
        fileItemChanged: {
          id
        }
      });
    });
  }

  public getFileItemAsync (filePath: string): AsyncIterator<any> {
    const fileChangeId = `FILE_ITEM_CHANGE-${filePath}`;

    this._fileItemDatabase.watchFileChange(filePath, id => {
      this._pubSub.publish(fileChangeId, {
        fileItemChanged: {
          id
        }
      });
    });
    return this._pubSub.asyncIterator<any>(fileChangeId);
  }

  public getFileItem (filePath: string): Promise<FileItem> {
    return this._fileItemDatabase.getFileItem(filePath);
  }
}
