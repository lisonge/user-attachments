import {
  obj2form,
  defaultHeaders,
  acceptMimeMap,
  UploadError,
  filterNotNullObject,
} from './util';
import type { SubFetch } from './util';

export { acceptMimeMap, UploadError };
export type { SubFetch };

interface UploadPoliciesAssetsRsonpse {
  upload_url: string;
  upload_authenticity_token: string;
  form: Record<string, string>;
  header: Record<string, string>;
  asset: PoliciesAsset;
  asset_upload_url: string;
  asset_upload_authenticity_token: string;
  same_origin: boolean;
}

export interface PoliciesAsset {
  id: number;
  name: string;
  size: number;
  content_type: string;
  original_name: string;
  href: string;
}

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

export const uploadPoliciesAssets = async (options: UolpadOptions) => {
  const { cookie, fetch = globalThis.fetch, repositoryId } = options;

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

  const formData = new FormData();
  if (repositoryId) {
    formData.append('repository_id', String(repositoryId));
  }
  formData.append('name', file.name);
  formData.append('size', file.size.toString());
  formData.append('content_type', file.type);
  // prepare upload asset
  const policiesResp: UploadPoliciesAssetsRsonpse = await fetch(
    `https://github.com/upload/policies/assets`,
    {
      method: 'POST',
      body: formData,
      headers: filterNotNullObject({
        ...defaultHeaders,
        cookie: cookie,
        'GitHub-Verified-Fetch': 'true',
        'X-Requested-With': 'XMLHttpRequest',
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
      authenticity_token: policiesResp.same_origin
        ? policiesResp.upload_authenticity_token
        : undefined,
      ...defaultHeaders,
      ...policiesResp.header,
      cookie,
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
        cookie,
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      }),
    }
  ).then(async (r) => {
    if (!r.ok) {
      throw new UploadError(`failed check authenticity upload`, r);
    }
  });

  return policiesResp.asset;
};
