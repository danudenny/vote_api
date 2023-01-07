import { LoaderEnv } from './loader';

const config = {
  ...LoaderEnv.getTypeOrmConfig(),
};

if (LoaderEnv.isDebugMode()) {
  console.dir(config, { colors: true, depth: null });
}

module.exports = config;
