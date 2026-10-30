import { expect, it } from 'vitest';

import * as entry from '../src/index.js';

it('loads the package entry', () => {
  expect(entry).toBeTypeOf('object');
});
