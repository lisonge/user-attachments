import fs from 'node:fs/promises';
import process from 'node:process';
import { uploadPoliciesAssets } from '../src/index';

const asset = await uploadPoliciesAssets({
  cookie: await fs.readFile(process.cwd() + '/test/cookie.txt', 'utf-8'),
  file: new File(['233'], 'file.txt'),
});

console.log(asset);
