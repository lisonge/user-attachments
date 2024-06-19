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
import { uploadPoliciesAssets } from 'user-attachments';

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
export type UolpadOptions = {
  file: File;

  /**
   * the cookie string of the github page, you can get it from the browser developer tools
   *
   * if you not set it, you must set fetch parameter
   */
  cookie?: string;

  /**
   * the gihtub page url where the file will be uploaded, it must be a page that contains the file-attachment element
   * @default
   * 'https://github.com/lisonge/user-attachments/issues/1'
   */
  url?: string;

  /**
   * get the authenticity token and repository id from the page
   */
  getAuthenticity?: () => Promise<Authenticity> | Authenticity;

  /**
   * if you want to use a custom fetch function to skip cors limitation
   *
   * or you can use it to set the cookie
   *
   * @default globalThis.fetch
   */
  fetch?: SubFetch;
};
```

## demo

you must use [Disable-CSP](https://github.com/lisonge/Disable-CSP) to disable github csp for script

![image](https://github.com/lisonge/user-attachments/assets/38517192/cd0ccced-8a56-4f8b-9fa4-27764f055dd0)
