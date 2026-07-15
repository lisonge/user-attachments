import assert from 'node:assert/strict';
import test from 'node:test';
import { uploadPoliciesAssets } from '../src/index.ts';
import type { PoliciesAsset, SubFetch } from '../src/index.ts';

test('uploads a file through the policies flow', async () => {
  const expectedAsset: PoliciesAsset = {
    id: 1,
    name: 'file.txt',
    size: 3,
    content_type: 'text/plain',
    original_name: 'file.txt',
    href: 'https://github.com/user-attachments/files/1/file.txt',
  };
  const calls: Array<{ input: string; body?: FormData }> = [];

  const fetch: SubFetch = async (input, init) => {
    calls.push({ input, body: init.body });

    if (calls.length === 1) {
      return Response.json({
        upload_url: 'https://uploads.example.test',
        upload_authenticity_token: 'upload-token',
        form: { key: 'asset-key' },
        header: { 'x-upload-header': 'upload-value' },
        asset: expectedAsset,
        asset_upload_url: '/user-attachments/assets/1',
        asset_upload_authenticity_token: 'asset-token',
        same_origin: true,
      });
    }

    return new Response(null, { status: 204 });
  };

  const asset = await uploadPoliciesAssets({
    repositoryId: '693968148',
    file: new File(['233'], 'file.txt'),
    fetch,
  });

  assert.deepEqual(asset, expectedAsset);
  assert.deepEqual(
    calls.map(({ input }) => input),
    [
      'https://github.com/upload/policies/assets',
      'https://uploads.example.test',
      'https://github.com/user-attachments/assets/1',
    ]
  );
  assert.equal(calls[0]?.body?.get('content_type'), 'text/plain');
  assert.equal(calls[1]?.body?.get('key'), 'asset-key');
  assert.equal(calls[2]?.body?.get('authenticity_token'), 'asset-token');
});
