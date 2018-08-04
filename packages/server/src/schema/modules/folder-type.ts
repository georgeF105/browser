import { PubSub } from 'graphql-subscriptions';
import { FILE_ITEM_CHANGE } from '../../connector/file-item.connector';

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
    folder(root, args, ctx) {
      return ctx.fileItemConnector.getFileItem(args.id);
    },
    folders(root, args, ctx) {
      return ctx.getFolders();
    }
  },
  Mutation: {
    newFolder(root, args, ctx) {
      console.log('new folder', args);
    }
  }
};
