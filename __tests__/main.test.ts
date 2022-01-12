import * as dart from '../src/dart';
import * as path from 'path';

import { test } from '@jest/globals';

test('TODO', async () => {
  const result = await dart.analyze(path.resolve(__dirname, '../dart'));
  console.dir(result);
});
