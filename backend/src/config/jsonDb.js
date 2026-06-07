const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class MockModel {
  constructor(filename, defaultData = []) {
    this.filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  _read() {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (e) {
      console.error(`Error reading mock file ${this.filePath}:`, e);
      return [];
    }
  }

  _write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`Error writing mock file ${this.filePath}:`, e);
    }
  }

  async find(query = {}) {
    let items = this._read();
    if (!query || Object.keys(query).length === 0) return items;
    
    return items.filter(item => {
      for (let key in query) {
        const queryVal = query[key];
        const itemVal = item[key];
        
        if (queryVal && typeof queryVal === 'object' && !Array.isArray(queryVal)) {
          if ('$regex' in queryVal) {
            const regex = new RegExp(queryVal.$regex, queryVal.$options || 'i');
            if (!regex.test(itemVal || '')) return false;
          } else {
            if ('$gte' in queryVal && !(itemVal >= queryVal.$gte)) return false;
            if ('$lte' in queryVal && !(itemVal <= queryVal.$lte)) return false;
            if ('$gt' in queryVal && !(itemVal > queryVal.$gt)) return false;
            if ('$lt' in queryVal && !(itemVal < queryVal.$lt)) return false;
            if ('$in' in queryVal) {
              if (!Array.isArray(queryVal.$in) || !queryVal.$in.includes(itemVal)) return false;
            }
          }
        } else {
          if (itemVal !== queryVal) return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const items = await this.find(query);
    return items.length > 0 ? items[0] : null;
  }

  async findById(id) {
    const items = this._read();
    return items.find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    const items = this._read();
    const newItem = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    this._write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const items = this._read();
    const idx = items.findIndex(item => item._id === id || item.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updateData, updatedAt: new Date().toISOString() };
    this._write(items);
    return items[idx];
  }

  async findByIdAndDelete(id) {
    const items = this._read();
    const idx = items.findIndex(item => item._id === id || item.id === id);
    if (idx === -1) return null;
    const removed = items.splice(idx, 1)[0];
    this._write(items);
    return removed;
  }
}

module.exports = MockModel;
