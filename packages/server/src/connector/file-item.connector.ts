import { FileItem, isFolder, Folder, File, NormalFileItem } from '../../../types/dist';
import * as path from 'path';
import { FileItemDatabase } from '../data-base/folder-database';

export class FileItemConnector {
  private _normalFileItems: { [key: string]: NormalFileItem } = {};

  constructor (
    private _fileItemDatabase: FileItemDatabase
  ) { }

  public getFileItem (filePath: string): Promise<FileItem> {

    return this._fileItemDatabase.getFileItem(filePath);
  }
}
