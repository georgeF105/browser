import { Folder, FolderItem, isFolder, File } from "../schema/modules/folder-type";
// const fs = require('fs');
import * as fs from 'fs';
import { resolve } from "dns";

interface NormalFolderItem {
  id: string;
  name: string;
  type: string;
  // parent: string;
  items?: Array<string>;
}

const ROOT_FILE = '01';

const folders: Folder = {
  id: ROOT_FILE,
  name: 'rootFolder_01',
  items: [
    {
      id: '01_01',
      name: 'childFolder_01-01',
      items: [
        {
          id: '01-01-01',
          name: 'childFile_01-01-01',
          type: 'file',
          items: [
            {
              id: '01-01-01-01',
              name: 'childFile_01-01-01-01',
              type: 'file',
              items: [
                {
                  id: '01-01-01-01-01',
                  name: 'childFile_01-01-01-01-01',
                  type: 'file',
                  items: [
                    {
                      id: '01-01-01-01-01-01',
                      name: 'childFile_01-01-01-01-01-01',
                      type: 'file'
                    }
                  ]
                }
              ]
            },
            {
              id: '01-01-01-02',
              name: 'childFile_01-01-01-02',
              type: 'file'
            }
          ]
        }
      ],
      type: 'folder'
    },
    {
      id: '01-02',
      name: 'childFile_01-02',
      type: 'file'
    },
    {
      id: '01-03',
      name: 'childFile_01-03',
      type: 'file',
      items: [
        {
          id: '01-03-01',
          name: 'childFile_01-03-01',
          type: 'file'
        },
        {
          id: '01-03-02',
          name: 'childFile_01-03-02',
          type: 'file'
        }
      ]
    }
  ],
  type: 'folder'
};

const rootFolder = '/home/george/MEDIA';

interface NormalCache<T> {
  [key: string]: T;
}

const getNormalFolderItems = (folder: FolderItem): Array<NormalFolderItem> => {
  if (!isFolder(folder)) {
    return;
  }

  return (folder.items || []).reduce((normalItems: Array<NormalFolderItem>, fileItem: FolderItem) => {
    let normalItem = <NormalFolderItem>{
      ...fileItem,
      parent: folder.id
    };

    if (isFolder(fileItem)) {
      normalItem =  {
        ...normalItem,
        items: fileItem.items.map(child => child.id)
      };

      const childItems = getNormalFolderItems(fileItem);
      normalItems.push(...childItems);
    }

    normalItems.push(normalItem);
    return normalItems;
  }, [{
    ...folder,
    parent: 'root',
    items: folder.items.map(item => item.id)
  }])
}

const getFolderAndChildren = (normalItems: Array<NormalFolderItem>, id: string, depth?: number): FolderItem => {
  const folderItem = normalItems.find(item => item.id === id);

  if (!folderItem) {
    return null;
  }

  if (isFolder(folderItem)) {
    return <Folder>{
      ...folderItem,
      items: folderItem.items.map(id => getFolderAndChildren(normalItems, id))
    };
  }

  return <File>folderItem;
}

export const getFolders = (): Array<FolderItem> => folders.items;


export const findFolderItem = (id: string): Promise<FolderItem> => {
  fs.exists(rootFolder, exits => console.log('exists', exits));
  fs.stat(rootFolder, (err, stat) => {
    if(stat.isDirectory()) {
      fs.readdir(rootFolder, (err, files) => {
        console.log('files', files);
      })
    }
  });

  id = id || ROOT_FILE;
  console.log('finding file, id', id);
  const normalItems = getNormalFolderItems(folders);
  console.log('normalItems', normalItems);
  return Promise.resolve(getFolderAndChildren(normalItems, id));
}

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
    })
  })
}

export const getFolderItem = (path: string, depth = 1): Promise<FolderItem> => {
  const fullPath = path ? `${rootFolder}/${path}` : rootFolder;
  console.log('fullPath', fullPath);

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
    })
  }).then((fileItem: FolderItem) => {
    if (isFolder(fileItem)) {
      console.log('getting types for', fileItem);
      return Promise.all(fileItem.items.map(item => getFolderItemType(`${fullPath}/${item.name}`))).then(types => (<FolderItem>{
        ...fileItem,
        items: fileItem.items.map((item, index) => ({
          ...item,
          type: types[index]
        }))
      }));
    }
    return fileItem;
  }).then((result: FolderItem) => {
    console.log('result', result);
    return result;
  });
}