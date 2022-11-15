// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

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

const validTypes = ['text/plain', 'text/markdown', 'text/html', 'application/json'];

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
      this.created = created || new Date();
      this.updated = updated || new Date();
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
    if (expand) return Promise.all(ids.map((id) => Fragment.byId(ownerId, id)));
    else return ids;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    return new Fragment(await readFragment(ownerId, id));
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
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    this.size = data.length;
    await writeFragmentData(this.ownerId, this.id, data);
    return this.save();
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
      switch (extension) {
        case '.html': {
          const rawData = await this.getData();
          convertedData = md.render(rawData.toString());
          mimeType = 'text/html';
          break;
        }
        case '.txt':
          convertedData = (await this.getData()).toString();
          mimeType = 'text/plain';
          break;
        default:
          throw new Error(`Unsupported extension: ${extension}`);
      }
    }
    if (this.mimeType === 'text/html') {
      switch (extension) {
        case '.txt':
          convertedData = (await this.getData()).toString();
          mimeType = 'text/plain';
          break;
        default:
          throw new Error(`Unsupported extension: ${extension}`);
      }
    }
    if (this.mimeType === 'text/plain') {
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
      switch (extension) {
        case '.txt':
          convertedData = (await this.getData()).toString();
          mimeType = 'text/plain';
          break;
        default:
          throw new Error(`Unsupported extension: ${extension}`);
      }
    }
    return { convertedData, mimeType };
  }
}

module.exports.Fragment = Fragment;
