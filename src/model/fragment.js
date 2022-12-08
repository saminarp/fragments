// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const sharp = require('sharp');

const md = require('markdown-it')();
// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const validTypes = [
  'text/plain',
  'text/markdown',
  'text/html',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];
class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
      throw new Error('Fragment requires an id, ownerId, and type');
    } else if (!Fragment.isSupportedType(type)) {
      throw new Error(`Unsupported type: ${type}`);
    } else if (size < 0 || !Number.isInteger(size)) {
      throw new Error(`Invalid size: ${size}`);
    } else {
      this.id = id || randomUUID();
      this.ownerId = ownerId;
      this.created = created || new Date().toISOString();
      this.updated = updated || new Date().toISOString();
      this.type = type;
      this.size = size;
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    const ids = await listFragments(ownerId);
    if (expand) {
      return Promise.all(ids.map((id) => Fragment.byId(ownerId, id)));
    } else return ids;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const result = await readFragment(ownerId, id);
    if (!result) {
      throw new Error(`Fragment with id: ${id} for user: ${ownerId} not found.`);
    }
    return new Fragment(result);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  async save() {
    this.updated = new Date().toISOString();
    return await writeFragment(this);
  }
  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Received data is not a Buffer object');
    } else {
      this.size = Buffer.byteLength(data);
      this.save();
      try {
        return await writeFragmentData(this.ownerId, this.id, data);
      } catch (err) {
        throw new Error('unable to set fragment data');
      }
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/') ? true : false;
  }
  /**
   * Returns the fragment's data as a string (e.g., for text/* types)
   * @returns {string} fragment's data as a string
   */
  get formats() {
    if (this.mimeType === 'text/plain') return ['.txt'];
    if (this.mimeType === 'text/markdown') return ['.md', '.html', '.txt'];
    if (this.mimeType === 'text/html') return ['.html', '.txt'];
    if (this.mimeType === 'application/json') return ['.json', '.txt'];
    if (this.mimeType === 'image/png') return ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    if (this.mimeType === 'image/jpeg') return ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    if (this.mimeType === 'image/webp') return ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    if (this.mimeType === 'image/gif') return ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

    return [];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    return validTypes.includes(type);
  }

  /**
   *
   * @param {string} extension file extension (e.g., '.md') that has specified in the URL id:.ext
   * @returns {string} the Content-Type value for the given extension (e.g., 'text/markdown') and the converted data
   * @throws {Error} if the extension is not supported
   * @throws {Error} if the fragment's data cannot be converted to the given extension
   */
  async convertedData(extension) {
    let mimeType, convertedData;

    if (this.mimeType === 'text/markdown') {
      // The text/markdown type supports conversion of
      // .md -> .html
      // .md -> .txt
      // .md -> .md
      switch (extension) {
        case '.html': {
          const rawData = await this.getData();
          convertedData = md.render(rawData.toString());
          mimeType = 'text/html';
          break;
        }
        case '.txt': {
          convertedData = (await this.getData()).toString();
          mimeType = 'text/plain';
          break;
        }
        case '.md': {
          convertedData = (await this.getData()).toString();
          mimeType = 'text/markdown';
          break;
        }
        default:
          throw new Error(`Unsupported extension: ${extension}`);
      }
    }
    if (this.mimeType === 'text/html') {
      // The text/html type supports conversion of
      // .html -> .txt
      // .html -> .html
      switch (extension) {
        case '.txt':
          convertedData = (await this.getData()).toString();
          mimeType = 'text/plain';
          break;
        case '.html':
          convertedData = (await this.getData()).toString();
          mimeType = 'text/html';
          break;
        default:
          throw new Error(`Unsupported extension: ${extension}`);
      }
    }
    if (this.mimeType === 'text/plain') {
      // The text/plain type supports conversion of
      // .txt -> .txt
      switch (extension) {
        case '.txt':
          convertedData = (await this.getData()).toString();
          mimeType = 'text/plain';
          break;
        default:
          throw new Error(`Unsupported extension: ${extension}`);
      }
    }

    if (this.mimeType === 'application/json') {
      // The application/json type supports conversion of
      // .json -> .txt
      // .json -> .json
      switch (extension) {
        case '.txt':
          convertedData = (await this.getData()).toString();
          mimeType = 'text/plain';
          break;
        case '.json':
          convertedData = (await this.getData()).toString();
          mimeType = 'application/json';
          break;
        default:
          throw new Error(`Unsupported extension: ${extension}`);
      }
    }

    if (
      this.mimeType === 'image/png' ||
      this.mimeType === 'image/jpeg' ||
      this.mimeType === 'image/webp' ||
      this.mimeType === 'image/gif'
    ) {
      if (extension === '.png') {
        const rawData = await this.getData();
        convertedData = await sharp(rawData).toFormat('png').toBuffer();
        mimeType = 'image/png';
      } else if (extension === '.jpg' || extension === '.jpeg') {
        const rawData2 = await this.getData();
        convertedData = await sharp(rawData2).toFormat('jpeg').toBuffer();
        mimeType = 'image/jpeg';
      } else if (extension === '.webp') {
        const rawData3 = await this.getData();
        convertedData = await sharp(rawData3).toFormat('webp').toBuffer();
        mimeType = 'image/webp';
      } else if (extension === '.gif') {
        const rawData4 = await this.getData();
        convertedData = await sharp(rawData4).toFormat('gif').toBuffer();
        mimeType = 'image/gif';
      } else {
        throw new Error(`Unsupported extension: ${extension}`);
      }
    }

    return { convertedData, mimeType };
  }
}

module.exports.Fragment = Fragment;
