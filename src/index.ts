import {
  obj2form,
  defaultHeaders,
  acceptMimeMap,
  UploadError,
  defaultGetAuthenticity,
  filterNotNullObject,
} from './util';
import type { Authenticity, SubFetch } from './util';

export { acceptMimeMap, UploadError };
export type { Authenticity, SubFetch };

type UploadPoliciesAssetsRsonpse = {
  upload_url: string;
  form: Record<string, string>;
  asset: PoliciesAsset;
  asset_upload_url: string;
  asset_upload_authenticity_token: string;
};

export type PoliciesAsset = {
  id: number;
  name: string;
  size: number;
  content_type: string;
  original_name: string;
  href: string;
};

const defaultUrl = 'https://github.com/lisonge/user-attachments/issues/1';

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

export const uploadPoliciesAssets = async (options: UolpadOptions) => {
  const { cookie, url = defaultUrl, fetch = globalThis.fetch } = options;

  // check file name extension
  const fileExt = options.file.name.substring(
    options.file.name.lastIndexOf('.') + 1
  );

  const content_type = acceptMimeMap[fileExt];
  if (!content_type) {
    throw new Error(`not support file type ${fileExt}`);
  }

  // auto set content type
  const file = options.file.type
    ? options.file
    : new File([options.file], options.file.name, {
        type: content_type,
      });

  const { authenticity_token, repository_id } = await (options.getAuthenticity
    ? options.getAuthenticity()
    : defaultGetAuthenticity(fetch, url, cookie));

  // prepare upload asset
  const policiesResp: UploadPoliciesAssetsRsonpse = await fetch(
    `https://github.com/upload/policies/assets`,
    {
      method: `POST`,
      body: obj2form({
        authenticity_token,
        content_type: file.type,
        name: file.name,
        size: file.size.toString(),
        repository_id,
      }),
      headers: filterNotNullObject({
        ...defaultHeaders,
        cookie: cookie,
        referer: url,
      }),
    }
  ).then(async (r) => {
    if (!r.ok) {
      throw new UploadError(`failed upload policies assets`, r);
    }
    return r.json();
  });

  // upload to s3
  await fetch(policiesResp.upload_url, {
    method: `POST`,
    body: obj2form({
      ...policiesResp.form,
      file,
    }),
    headers: filterNotNullObject({
      ...defaultHeaders,
      cookie,
      referer: url,
    }),
  }).then(async (r) => {
    if (!r.ok) {
      throw new UploadError(`failed upload to s3`, r);
    }
  });

  // check assets
  await fetch(
    new URL(policiesResp.asset_upload_url, `https://github.com/`).href,
    {
      method: `PUT`,
      body: obj2form({
        authenticity_token: policiesResp.asset_upload_authenticity_token,
      }),
      headers: filterNotNullObject({
        ...defaultHeaders,
        // must add `Accept` request headers
        Accept: `application/json`,
        cookie,
        referer: url,
      }),
    }
  ).then(async (r) => {
    if (!r.ok) {
      throw new UploadError(`failed check authenticity upload`, r);
    }
  });

  return policiesResp.asset;
};
