import { FileItem, isFolder, FileItemType } from '../../../types/dist';
import * as fs from 'fs';
import * as path from 'path';

const rootFolder = '/home/george/MEDIA';

export class FileItemDatabase {
  constructor (
    private _rootFolder: string
  ) { }

  public getFileItem (filePath: string): Promise<FileItem> {
    const fullPath = path.join(this._rootFolder, filePath);
    return this.getFileItemType(fullPath).then(type => {
      return new Promise((resolve, reject) => {
        if (type === 'folder') {
          fs.readdir(fullPath, (err, files) => {
            if (err) {
              reject(err);
            }

            const pathSegments = fullPath.split(path.sep);
            const name = pathSegments[pathSegments.length - 1];

            const folderItem: FileItem = {
              id: filePath,
              name: name,
              type,
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
          id: path,
          name: path || 'root',
          type
        });
      });
    }).then((fileItem: FileItem) => {
      if (isFolder(fileItem)) {
        return Promise.all(fileItem.items.map(item =>
          this.getFileItemType(path.join(fullPath, item.name)))).then(types => (<FileItem>{
          ...fileItem,
          items: fileItem.items.map((item, index) => ({
            ...item,
            type: types[index]
          }))
        }));
      }
      return fileItem;
    });
  }

  private getFileItemType (filePath: string): Promise<FileItemType> {
    return new Promise((resolve, reject) => {
      fs.exists(filePath, exists => {
        if (!exists) {
          return reject(new Error(`File not found: ${filePath}`));
        }
      });

      fs.stat(filePath, (err, stat) => {
        if (err) {
          return reject(err);
        }

        if (stat.isDirectory()) {
          return resolve ('folder');
        }

        return resolve('file');
      });
    });
  }
}
