import { FolderItem, isFolder } from '@browser/types';
import * as fs from 'fs';

const rootFolder = '/home/george/MEDIA';

const getFolderItemType = (path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.exists(path, exists => {
      if (!exists) {
        return reject(new Error(`File not found: ${path}`));
      }
    });

    fs.stat(path, (err, stat) => {
      if (err) {
        return reject(err);
      }

      if (stat.isDirectory()) {
        return resolve ('folder');
      }

      return resolve('file');
    });
  });
};

export const getFolderItem = (path: string): Promise<FolderItem> => {
  const fullPath = path ? `${rootFolder}/${path}` : rootFolder;

  return getFolderItemType (fullPath).then(type => {
    return new Promise((resolve, reject) => {
      if (type === 'folder') {
        fs.readdir(fullPath, (err, files) => {
          if (err) {
            reject(err);
          }

          const folderItem: FolderItem = {
            id: path,
            name: path || 'root',
            type,
            items: files.map(file => ({
              id: path ? `${path}/${file}` : file,
              name: file,
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
  }).then((fileItem: FolderItem) => {
    if (isFolder(fileItem)) {
      return Promise.all(fileItem.items.map(item => getFolderItemType(`${fullPath}/${item.name}`))).then(types => (<FolderItem>{
        ...fileItem,
        items: fileItem.items.map((item, index) => ({
          ...item,
          type: types[index]
        }))
      }));
    }
    return fileItem;
  });
};
