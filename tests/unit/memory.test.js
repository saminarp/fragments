const memory = require('../../src/model/data/memory/index');

describe('fragment database related calls', () => {
  test('writeFragment() returns nothing', async () => {
    const result = await memory.writeFragment({ ownerId: '', id: '', fragment: '' });
    expect(result).toBe(undefined);
  });

  test('readFragment() returns what we writeFragment() into the db', async () => {
    const fragment = { ownerId: '77', id: '777', fragment: '7777' };
    await memory.writeFragment(fragment);
    const result = await memory.readFragment(fragment.ownerId, fragment.id);
    expect(result).toEqual(fragment);
  });

  test('writeFragmentData() returns nothing', async () => {
    const rawData = Buffer.from([], 'utf8');
    const fragmentData = { ownerId: '', id: '', value: rawData };
    const result = await memory.writeFragmentData(
      fragmentData.ownerId,
      fragmentData.id,
      fragmentData.value
    );
    expect(result).toBe(undefined);
  });

  test('readFragmentData() returns what we writeFragmentData() into the db', async () => {
    const bufferStr = Buffer.from('somefile', 'utf8');
    const fragmentData = { ownerId: '77', id: '777', value: bufferStr };
    await memory.writeFragmentData(fragmentData.ownerId, fragmentData.id, fragmentData.value);
    const dbResult = await memory.readFragmentData(fragmentData.ownerId, fragmentData.id);
    expect(dbResult).toEqual(fragmentData.value);
  });

  test('listFragments() returns all fragmentMetada', async () => {
    const fragmentMetadata = { ownerId: '77', id: '777', fragment: '7777' };
    await memory.writeFragment(fragmentMetadata);
    const results = await memory.listFragments('77', true); // true = include data
    expect(results).toEqual([{ ...fragmentMetadata }]);
  });

  test('listFragments() return only array of ids', async () => {
    const fragmentMetadata = { ownerId: '77', id: '777', fragment: '7777' };
    await memory.writeFragment(fragmentMetadata);
    const results = await memory.listFragments('77', false); // false = only ids
    expect(results).toEqual([fragmentMetadata.id]);
  });

  test('deleteFragment() removes value what writeFragment() writes into db', async () => {
    const fragmentMetadata = { ownerId: '77', id: '777', fragment: '7777' };
    await memory.writeFragment(fragmentMetadata);
    expect(await memory.readFragment(fragmentMetadata.ownerId, fragmentMetadata.id)).toEqual(
      fragmentMetadata
    );
    await memory.deleteFragment(fragmentMetadata.ownerId, fragmentMetadata.id);
    expect(await memory.readFragment(fragmentMetadata.ownerId, fragmentMetadata.id)).toBe(
      undefined
    );
  });

  test('deleteFragment() indeed throws', async () => {
    const fragmentMetadata = { ownerId: '77', id: '777', fragment: '7777' };
    await memory.writeFragment(fragmentMetadata);
    expect(await memory.readFragment(fragmentMetadata.ownerId, fragmentMetadata.id)).toEqual(
      fragmentMetadata
    );
    await expect(memory.deleteFragment(fragmentMetadata.ownerId, 'nonexistent')).rejects.toThrow();
  });

});
