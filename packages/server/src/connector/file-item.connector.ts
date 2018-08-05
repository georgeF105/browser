import { FileItem } from '../../../types/dist';
import { FileItemDatabase } from '../data-base/folder-database';
import asyncify from 'callback-to-async-iterator';

export const FILE_ITEM_CHANGE = 'FILE_ITEM_CHANGE';

export class FileItemConnector {
  private _socketCount = 0;
  constructor (
    private _fileItemDatabase: FileItemDatabase
  ) { }

  public getFileItemAsync (filePath: string): AsyncIterator<any> {
    this._socketCount++;
    console.log('new socket', filePath, 'count', this._socketCount);
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
      onClose: connection => {
        this._socketCount--;
        connection.close();
      }
    });
  }

  public getFileItem (filePath: string): Promise<FileItem> {
    return this._fileItemDatabase.getFileItem(filePath);
  }
}
