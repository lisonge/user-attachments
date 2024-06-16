export const obj2form = (obj: Record<string, string | File | Blob>) => {
  const fd = new FormData();
  for (const k in obj) {
    const v = obj[k];
    if (v instanceof File) {
      fd.append(k, v, v.name);
    } else if (v instanceof Blob) {
      fd.append(k, v);
    } else if (typeof v === 'string') {
      fd.append(k, v);
    }
  }
  return fd;
};

export const defaultHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
  origin: `https://github.com`,
};

export const acceptMimeMap: Record<string, string> = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  png: 'image/png',
  svg: 'image/svg+xml',
  webm: 'video/webm',
  cpuprofile: 'application/json',
  csv: 'text/csv',
  dmp: 'application/octet-stream',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  fodg: 'application/vnd.oasis.opendocument.graphics-flat-xml',
  fodp: 'application/vnd.oasis.opendocument.presentation-flat-xml',
  fods: 'application/vnd.oasis.opendocument.spreadsheet-flat-xml',
  fodt: 'application/vnd.oasis.opendocument.text-flat-xml',
  gz: 'application/gzip',
  json: 'application/json',
  jsonc: 'application/json',
  log: 'text/plain',
  md: 'text/markdown',
  odf: 'application/vnd.oasis.opendocument.formula',
  odg: 'application/vnd.oasis.opendocument.graphics',
  odp: 'application/vnd.oasis.opendocument.presentation',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odt: 'application/vnd.oasis.opendocument.text',
  patch: 'text/x-diff',
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  tgz: 'application/gzip',
  txt: 'text/plain',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/x-zip-compressed',
};

export class UploadError extends Error {
  constructor(
    message: string,
    public response: Response,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}

export type Authenticity = {
  repository_id: string;
  authenticity_token: string;
};

const tokenRegex =
  /\<input\s+type="hidden"\s+value="([0-9a-zA-Z\-_]+)"\s+data-csrf="true"\s+class="js-data-upload-policy-url-csrf"\s+\/\>/;

const repositoryIdRegex = /data-upload-repository-id="([0-9]+)"/;

export const defaultGetAuthenticity = async (
  fetch: SubFetch,
  url: string,
  cookie: string | undefined
): Promise<Authenticity> => {
  const resp = await fetch(url, {
    headers: filterNotNullObject({
      ...defaultHeaders,
      cookie,
    }),
  });
  const text = await resp.text();
  let authenticity_token: string | undefined = undefined;
  let repository_id: string | undefined = undefined;
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    authenticity_token =
      doc
        .querySelector(
          `file-attachment input.js-data-upload-policy-url-csrf[value]`
        )
        ?.getAttribute('value') || undefined;

    repository_id =
      doc
        .querySelector('file-attachment')
        ?.getAttribute('data-upload-repository-id') || undefined;
  } else {
    authenticity_token = text.match(tokenRegex)?.[1];
    repository_id = text.match(repositoryIdRegex)?.[1];
  }

  if (!repository_id) {
    throw new Error('not found repository_id');
  }
  if (!authenticity_token) {
    throw new Error('not found authenticity_token');
  }
  return { authenticity_token, repository_id };
};

export type SubFetch = (
  input: string,
  init: {
    method?: string;
    headers?: Record<string, string>;
    body?: FormData;
  }
) => Promise<Response>;

export const filterNotNullObject = (
  obj: Record<string, string | null | undefined>
): Record<string, string> => {
  const newObj: Record<string, string> = {};
  for (const k in obj) {
    const v = obj[k];
    if (v !== undefined && v !== null) {
      newObj[k] = v;
    }
  }
  return newObj;
};
