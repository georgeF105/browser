export type FolderItemType = 'folder' | 'file' | null;

export interface FolderItemBase {
  id: string;
  name: string;
  type: FolderItemType;
}

export interface Folder extends FolderItemBase {
  type: 'folder';
  items: Array<FolderItem>;
}

export interface File extends FolderItemBase {
  type: 'file'
}

export function isFolder (fileItem: FolderItem): fileItem is Folder {
  return fileItem.type === 'folder';
}

export function isFile (fileItem: FolderItem): fileItem is File {
  return (<Folder>fileItem).items === undefined;
}

export type FolderItem = Folder | File;
