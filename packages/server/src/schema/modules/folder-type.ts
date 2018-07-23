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
    }
  }
};
