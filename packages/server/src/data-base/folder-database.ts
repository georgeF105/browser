import { Folder, FolderItem, isFolder, File } from "../schema/modules/folder-type";

interface NormalFolderItem {
  id: string;
  name: string;
  type: string;
  parent: string;
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
              type: 'file'
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

export const findFolderItem = (id: string): FolderItem => {
  id = id || ROOT_FILE;
  console.log('finding file, id', id);
  const normalItems = getNormalFolderItems(folders);
  console.log('normalItems', normalItems);
  return getFolderAndChildren(normalItems, id);
}