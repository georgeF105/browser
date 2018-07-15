export interface File {
  id: string;
  name: string;
  type: string;
}

export interface Folder {
  id: string;
  name: string;
  type: 'folder';
  items: Array<File | Folder>;
}

export type FolderItem = File | Folder;

export function isFolder (fileItem: FolderItem): fileItem is Folder {
  return (<Folder>fileItem).items !== undefined;
}

export function isFile (fileItem: FolderItem): fileItem is File {
  return (<Folder>fileItem).items === undefined;
}

export const typeDef = `
type FolderType {
    id: String
    name: String
    items: [FolderType]
    type: String
}

type Query {
    folder(id: String): FolderType
    folders: [FolderType]
}
`;

export const resolver = {
  Query: {
    folder(root, args, ctx) {
      console.log('HERE');
      return ctx.findFolderItem(args.id);
    },
    folders(root, args, ctx) {
      return ctx.getFolders();
    },
  }
};
