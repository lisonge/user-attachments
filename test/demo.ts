import fs from 'node:fs/promises';
import process from 'node:process';
import { uploadPoliciesAssets } from '../src/index';

const cookie = (
  await fs.readFile(process.cwd() + '/test/cookie.txt', 'utf-8')
).trimEnd();

const asset = await uploadPoliciesAssets({
  cookie,
  file: new File(['233'], 'file.txt'),
  repositoryId: '693968148',
});

console.log(asset);
