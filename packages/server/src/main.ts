import * as express from 'express';
import * as bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { PubSub } from 'graphql-subscriptions';
import { execute, subscribe } from 'graphql';

import { Schema } from './schema';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import { FileItemDatabase } from './data-base/folder-database';
import { FileItemConnector } from './connector/file-item.connector';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { Server, createServer } from 'http';
import * as url from 'url';

// Default port or given one.
export const GRAPHQL_ROUTE = '/graphql';
export const GRAPHIQL_ROUTE = '/graphiql';

const WS_PORT = 3001;
interface IMainOptions {
  enableCors: boolean;
  enableGraphiql: boolean;
  env: string;
  port: number;
  wsPort: number;
  verbose?: boolean;
}

const rootFolder = '/home/george/MEDIA';

const pubSub = new PubSub();
const fileItemDatabase = new FileItemDatabase(rootFolder);
const fileItemConnector = new FileItemConnector (fileItemDatabase, pubSub);

/* istanbul ignore next: no need to test verbose print */
function verbosePrint(port, enableGraphiql) {
  console.log(`GraphQL Server is now running on http://localhost:${port}${GRAPHQL_ROUTE}`);
  if (true === enableGraphiql) {
    console.log(`GraphiQL Server is now running on http://localhost:${port}${GRAPHIQL_ROUTE}`);
  }
}

export function main(options: IMainOptions) {
  let app = express();

  app.use(helmet());

  app.use(morgan(options.env));

  if (true === options.enableCors) {
    app.use(GRAPHQL_ROUTE, cors());
  }

  app.use(GRAPHQL_ROUTE, bodyParser.json(), graphqlExpress({
    context: {
      fileItemConnector
    },
    schema: Schema
  }));

  if (true === options.enableGraphiql) {
    app.use(GRAPHIQL_ROUTE, graphiqlExpress(req => ({
      endpointURL: GRAPHQL_ROUTE,
      subscriptionsEndpoint: url.format({
        host: req.get('host'),
        protocol: req.protocol === 'https' ? 'wss' : 'ws',
        pathname: '/subscriptions'
      })
    })));
  }

  return new Promise((resolve, reject) => {
    let server = app.listen(options.port, () => {
      /* istanbul ignore if: no need to test verbose print */
      if (options.verbose) {
        verbosePrint(options.port, options.enableGraphiql);
      }

      resolve(server);
    }).on('error', (err: Error) => {
      reject(err);
    });
  }).then((server: Server) => {

    const subscriptionsServer = new SubscriptionServer({
      execute,
      subscribe,
      schema: Schema,
      onOperation: (_, params) => {
        return {
          ...params,
          context: {
            fileItemConnector
          }
        };
      }
    },                                                 {
      server: server,
      path: '/subscriptions'
    });
    return server;
  });
}

/* istanbul ignore if: main scope */
if (require.main === module) {
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Either to export GraphiQL (Debug Interface) or not.
  const NODE_ENV = process.env.NODE_ENV !== 'production' ? 'dev' : 'production';

  const EXPORT_GRAPHIQL = NODE_ENV !== 'production';

  // Enable cors (cross-origin HTTP request) or not.
  const ENABLE_CORS = NODE_ENV !== 'production';

  main({
    enableCors: ENABLE_CORS,
    enableGraphiql: EXPORT_GRAPHIQL,
    env: NODE_ENV,
    port: PORT,
    wsPort: WS_PORT,
    verbose: true
  });
}
