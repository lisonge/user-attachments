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

const cookie = (
  await fs.readFile(process.cwd() + '/test/cookie.txt', 'utf-8')
).trimEnd();

const asset = await uploadPoliciesAssets({
  cookie,
  file: new File(['233'], 'file.txt'),
  repositoryId: '693968148',
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

/*
// if you uplod image
{
  id: 340077278,
  name: 'test.png',
  size: 119,
  content_type: 'image/png',
  href: 'https://github.com/user-attachments/files/assets/38517192/a7d6a234-6019-44e0-a8a8-e4bc145c852c',
  original_name: 'test.png'
}
*/
```

## options

```ts
export interface UolpadOptions {

  /**
   * the repository id
   * 
   * example https://api.github.com/repos/lisonge/user-attachments
   */
  repositoryId: string | number;

  file: File;

  /**
   * the cookie string of the github page, you can get it from the browser developer tools
   *
   * if you not set it, you must set fetch parameter
   */
  cookie?: string;

  /**
   * if you want to use a custom fetch function to skip cors limitation
   *
   * or you can use it to set the cookie
   *
   * @default globalThis.fetch
   */
  fetch?: SubFetch;
}
```

## example

Install [Disable-CSP](https://github.com/lisonge/Disable-CSP), Disable HTTP CSP

open devtools console and run [browser.mjs](./test/browser.mjs)

![Image](https://github.com/user-attachments/assets/e02db90f-f065-48ea-b893-600a1da83ac5)
