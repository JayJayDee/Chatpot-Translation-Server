import { injectable } from 'smart-factory';
import { ConfigModules } from './modules';
import { ConfigTypes } from './types';

export { ConfigModules } from './modules';
export { ConfigTypes } from './types';

injectable(ConfigModules.EmptyConfig, [], async (): Promise<ConfigTypes.RootConfig> => ({
  http: {
    port: null
  },
  credential: {
    authEnabled: null,
    sessionExpires: null,
    authSecret: null,
    roomSecret: null
  },
  mysql: {
    host: null,
    port: null,
    user: null,
    password: null,
    database: null,
    connectionLimit: null
  }
}));

// configuration rules.
injectable(ConfigModules.ConfigRules, [],
  async (): Promise<ConfigTypes.ConfigRule[]> => ([
    { key: 'HTTP_PORT', path: ['http', 'port'], defaultValue: 8080 },
    { key: 'CREDENTIAL_AUTH_ENABLED', path: ['credential', 'authEnabled'], defaultValue: false },
    { key: 'CREDENTIAL_AUTH_SECRET', path: ['credential', 'authSecret'] },
    { key: 'CREDENTIAL_AUTH_SESSION_EXPIRES', path: ['credential', 'sessionExpires'], defaultValue: 60 },
    { key: 'CREDENTIAL_ROOM_SECRET', path: ['credential', 'roomSecret'] },
    { key: 'MYSQL_HOST', path: ['mysql', 'host'] },
    { key: 'MYSQL_PORT', path: ['mysql', 'port'] },
    { key: 'MYSQL_USER', path: ['mysql', 'user'] },
    { key: 'MYSQL_PASSWORD', path: ['mysql', 'password'] },
    { key: 'MYSQL_DATABASE', path: ['mysql', 'database'] },
    { key: 'MYSQL_CONNECTION_LIMIT', path: ['mysql', 'connectionLimit'], defaultValue: 10 }
  ]));

injectable(ConfigModules.ConfigSource,
  [ConfigModules.ConfigReader],
  async (read: ConfigTypes.ConfigReader) => read());

injectable(ConfigModules.RootConfig,
  [ConfigModules.ConfigParser,
   ConfigModules.ConfigSource,
   ConfigModules.ConfigRules],
  async (parse: ConfigTypes.ConfigParser,
    src: ConfigTypes.ConfigSource,
    rules: ConfigTypes.ConfigRule[]): Promise<ConfigTypes.RootConfig> => parse(src, rules));

injectable(ConfigModules.HttpConfig,
  [ConfigModules.RootConfig],
  async (root: ConfigTypes.RootConfig) => root.http);

injectable(ConfigModules.CredentialConfig,
  [ConfigModules.RootConfig],
  async (root: ConfigTypes.RootConfig) => root.credential);

injectable(ConfigModules.MysqlConfig,
  [ConfigModules.RootConfig],
  async (root: ConfigTypes.RootConfig) => root.mysql);

injectable(ConfigModules.Env,
  [ConfigModules.ConfigSource],
  async (src: ConfigTypes.ConfigSource) => {
    const envExpr = src['NODE_ENV'];
    if (!envExpr || envExpr === 'production') return ConfigTypes.Env.DEV;
    return ConfigTypes.Env.PROD;
  });