import { TreeItemBase, NormalTreeItem } from './util';

export type FileItemType = 'folder' | 'file' | null;

export interface FileItemBase extends TreeItemBase {
  name: string;
  type: FileItemType;
}

export interface Folder extends FileItemBase {
  type: 'folder';
  items: Array<FileItem>;
}

export interface File extends FileItemBase {
  type: 'file';
  items: null;
}

export function isFolder (fileItem: FileItem): fileItem is Folder {
  return fileItem.type === 'folder';
}

export function isFile (fileItem: FileItem): fileItem is File {
  return (<Folder>fileItem).items === undefined;
}

export type FileItem = Folder | File;

export interface NormalFileItem extends NormalTreeItem<FileItem> { }
