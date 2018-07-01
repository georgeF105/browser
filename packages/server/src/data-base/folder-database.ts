import { Folder, FolderItem, isFolder } from "../schema/modules/folder-type";

interface NormalFolderItem {
  id: string;
  name: string;
  type: string;
  parent: string;
  items?: Array<string>;
}

const folders: Folder = {
  id: '01',
  name: 'rootFolder_01',
  items: [
    {
      id: '01_01',
      name: 'childFolder_01-01',
      items: [
        {
          id: '01-01-01',
          name: 'childFile_01-01-01',
          type: 'file'
        }
      ],
      type: 'folder'
    },
    {
      id: '01',
      name: 'childFile_01-02',
      type: 'file'
    }
  ],
  type: 'folder'
};

let normalFolder: Array<NormalFolderItem>;

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
  }, [])
}

export const getFolders = (): Array<FolderItem> => folders.items;
export const findFileItem = (id: string): FolderItem => {
  const normalItems = getNormalFolderItems(folders);
  return normalItems.find(item => item.id === id);
}