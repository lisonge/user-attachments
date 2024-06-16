# user-attachments

upload file to github

## install

```shell
pnpm add user-attachments
```

## usage

```ts
import fs from 'node:fs/promises';
import process from 'node:process';
import { uploadPoliciesAssets } from '../src/index';

const asset = await uploadPoliciesAssets({
  cookie: await fs.readFile(process.cwd() + '/test/cookie.txt', 'utf-8'),
  file: new File(['233'], 'file.txt'),
});

console.log(asset);
/*
{
  id: 15856568,
  name: 'file.txt',
  size: 3,
  content_type: 'text/plain',
  href: 'https://github.com/user-attachments/files/15856568/file.txt',
  original_name: 'file.txt'
}
*/
```
