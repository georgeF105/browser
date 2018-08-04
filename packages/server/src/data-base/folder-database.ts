import { FileItem, isFolder, FileItemType, Folder } from '../../../types/dist';
import * as fs from 'fs';
import * as path from 'path';

export class FileItemDatabase {
  public getFileItem (filePath: string): Promise<FileItem> {
    return this.getBasicFileItem(filePath).then(fileItem => {
      return new Promise((resolve, reject) => {
        if (fileItem.type === 'folder') {
          fs.readdir(filePath, (err, files) => {
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
        return Promise.all(fileItem.items.map(item => {
          return this.getBasicFileItem(path.join(filePath, item.name))
            .catch(err => {
              console.error(err);
              return null;
            });
        })
      ).then(childrenFileItems => (<FileItem>{
          ...fileItem,
          items: childrenFileItems.filter(Boolean)
        }));
      }
      return fileItem;
    });
  }

  private getBasicFileItem (filePath: string): Promise<FileItem> {
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

        const pathSegments = filePath.split(path.sep);
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
    return fs.watch(filePath, {}, (event, fileName) => {
      listener(filePath);
    });
  }
}
