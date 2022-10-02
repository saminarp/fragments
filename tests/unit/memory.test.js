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
    const fragment = { ownerId: '', id: '', value: rawData };
    const result = await memory.writeFragmentData(fragment.ownerId, fragment.id, fragment.value);
    expect(result).toBe(undefined);
  });

  test('readFragmentData() returns what we writeFragmentData() into the db', async () => {
    const bufferStr = Buffer.from('somefile', 'utf8');
    const fragment = { ownerId: '77', id: '777', value: bufferStr };
    await memory.writeFragmentData(fragment.ownerId, fragment.id, fragment.value);
    const dbResult = await memory.readFragmentData(fragment.ownerId, fragment.id);
    expect(dbResult).toEqual(fragment.value);
  });
});
