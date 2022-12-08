const { Fragment } = require('../../src/model/fragment');
const fs = require('fs');

// Wait for a certain number of ms. Returns a Promise.
const wait = async (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

const validTypes = [
  `text/plain`,
  `text/markdown`,
  `text/html`,
  `application/json`,
  `image/png`,
  `image/jpeg`,
  `image/webp`,
  `image/gif`,
];

describe('Fragment class', () => {
  test('common formats are supported', () => {
    validTypes.forEach((format) => expect(Fragment.isSupportedType(format)).toBe(true));
  });
  /* 
else if (!validTypes.some((validType) => type.includes(validType))) {
      throw new Error('type not supported');  
  */

  describe('Fragment()', () => {
    test('ownerId and type are required', () => {
      expect(() => new Fragment({})).toThrow();
    });

    test('ownerId is required', () => {
      expect(() => new Fragment({ type: 'text/plain', size: 1 })).toThrow();
    });

    test('type is required', () => {
      expect(() => new Fragment({ ownerId: '1234', size: 1 })).toThrow();
    });

    test('type can be a simple media type', () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 });
      expect(fragment.type).toEqual('text/plain');
    });

    test('type can include a charset', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain; charset=utf-8',
        size: 0,
      });
      expect(fragment.type).toEqual('text/plain; charset=utf-8');
    });

    test('size gets set to 0 if missing', () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain' });
      expect(fragment.size).toBe(0);
    });

    test('size must be a number', () => {
      expect(() => new Fragment({ ownerId: '1234', type: 'text/plain', size: '1' })).toThrow();
    });

    test('size can be 0', () => {
      expect(() => new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 })).not.toThrow();
    });

    test('size cannot be negative', () => {
      expect(() => new Fragment({ ownerId: '1234', type: 'text/plain', size: -1 })).toThrow();
    });

    test('invalid types throw', () => {
      expect(
        () => new Fragment({ ownerId: '1234', type: 'application/msword', size: 1 })
      ).toThrow();
    });

    test('valid types can be set', () => {
      validTypes.forEach((format) => {
        const fragment = new Fragment({ ownerId: '1234', type: format, size: 1 });
        expect(fragment.type).toEqual(format);
      });
    });

    test('fragments have an id', () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 1 });
      expect(fragment.id).toMatch(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
      );
    });

    test('fragments use id passed in if present', () => {
      const fragment = new Fragment({
        id: 'id',
        ownerId: '1234',
        type: 'text/plain',
        size: 1,
      });
      expect(fragment.id).toEqual('id');
    });

    test('fragments get a created datetime string', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain',
        size: 1,
      });
      expect(Date.parse(fragment.created)).not.toBeNaN();
    });

    test('fragments get an updated datetime string', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain',
        size: 1,
      });
      expect(Date.parse(fragment.updated)).not.toBeNaN();
    });
  });

  describe('isSupportedType()', () => {
    test('common text types are supported, with and without charset', () => {
      expect(Fragment.isSupportedType('text/plain')).toBe(true);
      expect(Fragment.isSupportedType('text/plain; charset=utf-8')).toBe(true);
    });

    test('other types are not supported', () => {
      expect(Fragment.isSupportedType('application/octet-stream')).toBe(false);
      expect(Fragment.isSupportedType('application/msword')).toBe(false);
      expect(Fragment.isSupportedType('audio/webm')).toBe(false);
      expect(Fragment.isSupportedType('video/ogg')).toBe(false);
    });
  });

  describe('mimeType, isText', () => {
    test('mimeType returns the mime type without charset', () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain; charset=utf-8',
        size: 0,
      });
      expect(fragment.type).toEqual('text/plain; charset=utf-8');
      expect(fragment.mimeType).toEqual('text/plain');
    });

    test('mimeType returns the mime type if charset is missing', () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 });
      expect(fragment.type).toEqual('text/plain');
      expect(fragment.mimeType).toEqual('text/plain');
    });

    test('isText return expected results', () => {
      // Text fragment
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain; charset=utf-8',
        size: 0,
      });
      expect(fragment.isText).toBe(true);
    });
  });

  describe('formats', () => {
    test('formats returns expected results', () => {
      // Text fragment
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain; charset=utf-8',
        size: 0,
      });
      expect(fragment.formats).toEqual(['.txt']);

      const fragment2 = new Fragment({
        ownerId: '1234',
        type: 'text/markdown; charset=utf-8',
        size: 0,
      });
      expect(fragment2.formats).toEqual(['.md', '.html', '.txt']);

      const fragment3 = new Fragment({
        ownerId: '1234',
        type: 'text/html; charset=utf-8',
        size: 0,
      });
      expect(fragment3.formats).toEqual(['.html', '.txt']);

      const fragment4 = new Fragment({
        ownerId: '1234',
        type: 'application/json; charset=utf-8',
        size: 0,
      });
      expect(fragment4.formats).toEqual(['.json', '.txt']);

      // image png
    });
  });

  describe('save(), getData(), setData(), byId(), byUser(), delete()', () => {
    test('byUser() returns an empty array if there are no fragments for this user', async () => {
      expect(await Fragment.byUser('1234')).toEqual([]);
    });

    test('a fragment can be created and save() stores a fragment for the user', async () => {
      const data = Buffer.from('hello');
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(data);

      const fragment2 = await Fragment.byId('1234', fragment.id);
      expect(fragment2).toEqual(fragment);
      expect(await fragment2.getData()).toEqual(data);
    });

    test('save() updates the updated date/time of a fragment', async () => {
      const ownerId = '7777';
      const fragment = new Fragment({ ownerId, type: 'text/plain', size: 0 });
      const modified1 = fragment.updated;
      await wait();
      await fragment.save();
      const fragment2 = await Fragment.byId(ownerId, fragment.id);
      expect(Date.parse(fragment2.updated)).toBeGreaterThan(Date.parse(modified1));
    });

    test('setData() updates the updated date/time of a fragment', async () => {
      const data = Buffer.from('hello');
      const ownerId = '7777';
      const fragment = new Fragment({ ownerId, type: 'text/plain', size: 0 });
      await fragment.save();
      const modified1 = fragment.updated;
      await wait();
      await fragment.setData(data);
      await wait();
      const fragment2 = await Fragment.byId(ownerId, fragment.id);
      expect(Date.parse(fragment2.updated)).toBeGreaterThan(Date.parse(modified1));
    });

    test("a fragment is added to the list of a user's fragments", async () => {
      const data = Buffer.from('hello');
      const ownerId = '5555';
      const fragment = new Fragment({ ownerId, type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(data);

      expect(await Fragment.byUser(ownerId)).toEqual([fragment.id]);
    });

    test('full fragments are returned when requested for a user', async () => {
      const data = Buffer.from('hello');
      const ownerId = '6666';
      const fragment = new Fragment({ ownerId, type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(data);

      expect(await Fragment.byUser(ownerId, true)).toEqual([fragment]);
    });

    test('setData() throws if not give a Buffer', () => {
      const fragment = new Fragment({ ownerId: '123', type: 'text/plain', size: 0 });
      expect(() => fragment.setData()).rejects.toThrow();
    });

    test('setData() updates the fragment size', async () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(Buffer.from('a'));
      expect(fragment.size).toBe(1);

      await fragment.setData(Buffer.from('aa'));
      const { size } = await Fragment.byId('1234', fragment.id);
      expect(size).toBe(2);
    });

    test('a fragment can be deleted', async () => {
      const fragment = new Fragment({ ownerId: '1234', type: 'text/plain', size: 0 });
      await fragment.save();
      await fragment.setData(Buffer.from('a'));

      await Fragment.delete('1234', fragment.id);
      expect(() => Fragment.byId('1234', fragment.id)).rejects.toThrow();
    });
  });

  describe('convertedData(extension)', () => {
    test('converts markdown to html', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/markdown',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(Buffer.from('# Hello'));
      const { convertedData, mimeType } = await fragment.convertedData('.html');
      expect(convertedData).toBe('<h1>Hello</h1>\n');
      expect(mimeType).toBe('text/html');
    });

    test('converts markdown to text', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/markdown',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(Buffer.from('# Hello'));
      const { convertedData, mimeType } = await fragment.convertedData('.txt');
      expect(convertedData).toBe('# Hello');
      expect(mimeType).toBe('text/plain');
      expect(mimeType).not.toBe('text/markdown');
    });

    test('converts html to text', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/html',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(Buffer.from('<h1>Hello</h1>'));
      const { convertedData, mimeType } = await fragment.convertedData('.txt');
      expect(convertedData).toBe('<h1>Hello</h1>');
      expect(mimeType).toBe('text/plain');
    });

    test('converts txt to text', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/plain',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(Buffer.from('Hello'));
      const { convertedData, mimeType } = await fragment.convertedData('.txt');
      expect(convertedData).toBe('Hello');
      expect(mimeType).toBe('text/plain');
      expect(() => fragment.convertedData('.html')).rejects.toThrow();
    });

    test('converts json to text', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'application/json',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(Buffer.from('{"a":1}'));
      const { convertedData, mimeType } = await fragment.convertedData('.txt');
      expect(convertedData).toBe('{"a":1}');
      expect(mimeType).toBe('text/plain');
      expect(() => fragment.convertedData('.html')).rejects.toThrow();
    });

    /* ========  PNG IMAGE FILE CONVERSIONS ======== */
    test('converts png to jpg', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/png',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/pngTest.png'));
      const { convertedData, mimeType } = await fragment.convertedData('.jpg');
      expect(mimeType).toBe('image/jpeg');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    test('converts png to jpeg', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/png',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/pngTest.png'));
      const { convertedData, mimeType } = await fragment.convertedData('.jpeg');
      expect(mimeType).toBe('image/jpeg');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    test('converts png to webp', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/png',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/pngTest.png'));
      const { convertedData, mimeType } = await fragment.convertedData('.webp');
      expect(mimeType).toBe('image/webp');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    test('converts png to gif', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/png',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/pngTest.png'));
      const { convertedData, mimeType } = await fragment.convertedData('.gif');
      expect(mimeType).toBe('image/gif');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    /* ========  JPEG IMAGE FILE CONVERSIONS ========  */
    test('converts jpeg to png', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/jpeg',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/jpegTest.jpeg'));
      const { convertedData, mimeType } = await fragment.convertedData('.png');
      expect(mimeType).toBe('image/png');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    test('converts jpeg to webp', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/jpeg',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/jpegTest.jpeg'));
      const { convertedData, mimeType } = await fragment.convertedData('.webp');
      expect(mimeType).toBe('image/webp');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    test('converts jpeg to gif', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/jpeg',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/jpegTest.jpeg'));
      const { convertedData, mimeType } = await fragment.convertedData('.gif');
      expect(mimeType).toBe('image/gif');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    /* ========  WEBP IMAGE FILE CONVERSIONS ========  */
    test('converts webp to png', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/webp',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/webpTest.webp'));
      const { convertedData, mimeType } = await fragment.convertedData('.png');
      expect(mimeType).toBe('image/png');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    test('converts webp to jpeg', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/webp',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/webpTest.webp'));
      const { convertedData, mimeType } = await fragment.convertedData('.jpeg');
      expect(mimeType).toBe('image/jpeg');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    test('converts webp to jpg', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/webp',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/webpTest.webp'));
      const { convertedData, mimeType } = await fragment.convertedData('.jpg');
      expect(mimeType).toBe('image/jpeg');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    test('converts webp to gif', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'image/webp',
        size: 0,
      });

      await fragment.save();
      await fragment.setData(fs.readFileSync('tests/images/webpTest.webp'));
      const { convertedData, mimeType } = await fragment.convertedData('.gif');
      expect(mimeType).toBe('image/gif');
      expect(convertedData).toBeInstanceOf(Buffer);
    });

    //test throws error if extension is not supported
    test('throws error if extension is not supported', async () => {
      const fragment = new Fragment({
        ownerId: '1234',
        type: 'text/markdown',
        size: 0,
      });
      await fragment.save();
      await fragment.setData(Buffer.from('# Hello'));
      expect(() => fragment.convertedData('.jpg')).rejects.toThrow();
    });
  });
});
