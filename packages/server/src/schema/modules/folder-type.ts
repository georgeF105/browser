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
    type: string
}

type Query {
    getFolder(id: String!): FolderType
    folders: [FolderType]
}
`;

export const resolver = {
  Query: {
    getFolder(root, args, ctx) {
      return ctx.findFileItem(args.id);
    },
    folders(root, args, ctx) {
      return ctx.getFolders();
    },
  }
};
