const { uploadPoliciesAssets } = await import(
  'https://unpkg.com/user-attachments@latest'
);
const asset = await uploadPoliciesAssets({
  file: new File(['233'], 'file.txt'),
  repositoryId: '693968148',
});
console.log(asset);
