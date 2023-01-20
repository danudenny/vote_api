import * as dotEnvExtended from 'dotenv-extended';
import * as dotEnvParseVariables from 'dotenv-parse-variables';
import * as path from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { CustomNamingStrategy } from './CustomNamingStrategies';
import { ExtractJwt } from 'passport-jwt';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

// Load `.env.defaults` then `.env` file.
// `load()` only returning from these files!
const fileEnvs = dotEnvExtended.load({
  errorOnMissing: true, // ensure to validate the schema throw error if not valid.
});

// Load `.env.defaults` then `.env` file and include OS Env.
const osEnvs = dotEnvParseVariables(
  dotEnvExtended.load({
    includeProcessEnv: true, // used when you want include OS to the object.
    overrideProcessEnv: false, // if true will override OS Env with .env file.
  }),
);

// The purpose of this thing is
// We want to get value from OS Env
// But only the key from declared .env file.
const envs: any = {};
for (const key of Object.keys(fileEnvs)) {
  envs[key] = osEnvs[key];
}

if (envs.DEBUG) {
  // tslint:disable-next-line: no-console
  console.dir(envs, { colors: true, depth: null });
}

export class LoaderEnv {
  public static envs = envs;

  public static isProduction() {
    console.dir(envs, { colors: true, depth: null });
    return envs.NODE_ENV === 'production';
  }

  public static isDebugMode() {
    return envs.DEBUG === true;
  }

  public static bull() {
    return {
      redis: {
        host: envs.REDIS_BULL_HOST,
        port:  envs.REDIS_BULL_PORT,
      }
    }
  }

  public static googleStrategy() {
    return {
      clientID: envs.GOOGLE_CLIENT_ID,
      clientSecret: envs.GOOGLE_SECRET_ID,
      callbackURL: `${envs.APP_URL}/auth${envs.GOOGLE_CALLBACK_URL}`,
      scope: ['email', 'profile']
    }
  }

  public static twitterStrategy() {
    return {
      clientType: envs.TWITTER_CLIENT_TYPE,
      clientID: envs.TWITTER_CLIENT_ID,
      clientSecret: envs.TWITTER_CLIENT_SECRETT,
      callbackURL: envs.TWITTER_CALLBACK_URL,
      scope: ['tweet.read', 'users.read', 'offline.access']
    }
  }

  public static kakaoStrategy() {
    return {
      clientID: envs.KAKAO_CLIENT_ID,
      clientSecret: envs.KAKAO_SECRET_ID,
      callbackURL: `${envs.APP_URL}/auth${envs.KAKAO_CALLBACK_URL}`,
      scope: ['profile_nickname', 'profile_image', 'account_email']
    }
  }

  public static jwtStrategy() {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envs.JWT_SECRET,
    }
  }

  public static mailCred() {    
    return {
      transport: {
        host: envs.MAIL_HOST,
        secure: envs.MAIL_SSL,
        port: envs.MAIL_PORT,
        auth: {
          user: envs.MAIL_USER,
          pass: envs.MAIL_PASS,
        },
      },
      defaults: {
        from: `"No Reply" <${envs.MAIL_FROM}>`,
      },
      template: {
        dir: path.join(__dirname, '../', 'mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }
  }

  public static getTypeOrmConfig(useReplication = false): TypeOrmModuleOptions {
    let config: PostgresConnectionOptions = {
      type: 'postgres',
      entities: [path.join(__dirname, '../', '**/*.entity{.ts,.js}')],
      migrationsTableName: 'typeorm_migrations',
      migrations: [path.join(__dirname, '../', 'migrations/*.ts')],
      logging: LoaderEnv.isDebugMode(),
      namingStrategy: new CustomNamingStrategy(),
    };

    const ssl = LoaderEnv.envs.POSTGRES_USE_SSL || false;
    const dbMaster = {
      host: envs.POSTGRES_HOST,
      port: envs.POSTGRES_PORT,
      username: envs.POSTGRES_USER,
      password: envs.POSTGRES_PASSWORD,
      database: envs.POSTGRES_DATABASE,
      ssl,
    };

    if (useReplication || LoaderEnv.isProduction()) {
      let dbSlaves = LoaderEnv.envs.POSTGRES_SLAVE_URLS;
      let slaves = [];

      if (dbSlaves) {
        if (!Array.isArray(dbSlaves)) {
          dbSlaves = [dbSlaves];
        }
        slaves = dbSlaves.map((c) => ({ url: c, ssl }));
      }

      config = Object.assign(
        {
          replication: {
            master: dbMaster,
            slaves,
          },
        },
        config,
      );
    } else {
      config = Object.assign(dbMaster, config);
    }

    return config;
  }
}
