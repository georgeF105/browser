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

type Mutation {
    newFolder(name: String!, location: String!): FolderType
}

type Subscription {
  fileItemChanged(id: String!): FolderType
}
`;

export const resolver = {
  Query: {
    folder(args, ctx) {
      return ctx.fileItemConnector.getFileItem(args.id);
    },
    folders(ctx) {
      return ctx.getFolders();
    }
  },
  Mutation: {
    newFolder(args) {
      console.log('new folder', args);
    }
  }
};
