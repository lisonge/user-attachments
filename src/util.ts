export const obj2form = (
  obj: Record<string, string | File | Blob | undefined>
) => {
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
  referer: 'https://github.com/',
};

export const acceptMimeMap: Record<string, string> = {
  // File types that are acceptable in any context
  svg: 'image/svg+xml',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  mov: 'video/quicktime',
  mp4: 'video/mp4',
  webm: 'video/webm',

  // File types that are only acceptable when there is a target repo to upload to, include the upper list
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

export interface SubFetch {
  (
    input: string,
    init: {
      method?: string;
      headers?: Record<string, string>;
      body?: FormData;
    }
  ): Promise<Response>;
}

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
