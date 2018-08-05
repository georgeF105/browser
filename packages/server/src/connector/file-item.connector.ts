import { FileItem, isFolder, Folder, File, NormalFileItem } from '../../../types/dist';
import * as path from 'path';
import { FileItemDatabase } from '../data-base/folder-database';
import { PubSub } from 'graphql-subscriptions';
import asyncify from 'callback-to-async-iterator';

export const FILE_ITEM_CHANGE = 'FILE_ITEM_CHANGE';

export class FileItemConnector {
  constructor (
    private _fileItemDatabase: FileItemDatabase
  ) { }

  public getFileItemAsync (filePath: string): AsyncIterator<any> {
    const fileChanges = (callback) => {
      this.getFileItem(filePath).then(fileItem => {
        callback({
          fileItemChanged: fileItem
        });
      });

      return Promise.resolve(this._fileItemDatabase.watchFileChange(filePath, filePath => {
        const fileItem = this.getFileItem(filePath);
        callback({
          fileItemChanged: fileItem
        });
      }));
    };

    return asyncify(fileChanges, {
      onClose: connection => connection.close()
    });
  }

  public getFileItem (filePath: string): Promise<FileItem> {
    return this._fileItemDatabase.getFileItem(filePath);
  }
}
