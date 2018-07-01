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
}

type Query {
    getFolder(id: String!): FolderType
    folders: [FolderType]
}

# Mutations
type Mutation {
    addFolder(name: String!, sex: String!): FolderType
}
`;

export const resolver = {
  // FolderType: {
  //   matches(root, args, ctx) {
  //     return ctx.persons.filter(person => person.sex !== root.sex);
  //   }
  // },
  Query: {
    getFolder(root, args, ctx) {
      return ctx.findFileItem(args.id);
    },
    folders(root, args, ctx) {
      return ctx.getFolders();
    },
  },
  // Mutation: {
  //   addFolder(root, args, ctx) {
  //     return ctx.addFolder(ctx.persons, {id: Math.random().toString(16).substr(2), name: args.name, sex: args.sex});
  //   },
  // },
};
