import { FileItem, isFolder, FileItemType, Folder } from '../../../types/dist';
import * as fs from 'fs';
import * as path from 'path';

export class FileItemDatabase {
  constructor (
    private _rootFolder: string
  ) { }

  public getFileItem (filePath: string): Promise<FileItem> {
    const fullPath = path.join(this._rootFolder, filePath);
    return this.getBasicFileItem(filePath).then(fileItem => {
      return new Promise((resolve, reject) => {
        if (fileItem.type === 'folder') {
          fs.readdir(fullPath, (err, files) => {
            if (err) {
              reject(err);
            }

            const folderItem: Folder = {
              ...fileItem,
              items: files.map(fileName => ({
                id: path.join(filePath, fileName),
                name: fileName,
                type: null,
                items: []
              }))
            };

            resolve(folderItem);
          });
          return;
        }

        resolve({
          ...fileItem
        });
      });
    }).then((fileItem: FileItem) => {
      if (isFolder(fileItem)) {
        return Promise.all(fileItem.items.map(item =>
          this.getBasicFileItem(path.join(filePath, item.name)))).then(childrenFileItems => (<FileItem>{
          ...fileItem,
          items: childrenFileItems
        }));
      }
      return fileItem;
    });
  }

  private getBasicFileItem (filePath: string): Promise<FileItem> {
    const fullPath = path.join(this._rootFolder, filePath);
    return new Promise((resolve, reject) => {
      fs.exists(fullPath, exists => {
        if (!exists) {
          return reject(new Error(`File not found: ${fullPath}`));
        }
      });

      fs.stat(fullPath, (err, stat) => {
        if (err) {
          return reject(err);
        }

        const pathSegments = fullPath.split(path.sep);
        const name = pathSegments[pathSegments.length - 1];

        if (stat.isDirectory()) {
          return resolve ({
            id: filePath,
            name,
            items: [],
            type: 'folder'
        });
        }

        return resolve({
          id: filePath,
          name,
          items: null,
          type: 'file'
        });

      });
    });
  }

  public watchFileChange (filePath: string, listener: (id: string) => void): fs.FSWatcher {
    const fullPath = path.join(this._rootFolder, filePath);
    return fs.watch(fullPath, {}, (event, fileName) => {
      listener(filePath);
    });
  }
}
