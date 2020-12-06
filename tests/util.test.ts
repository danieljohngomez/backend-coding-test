import assert from 'assert';
import parseNumber from '../src/util';

describe('Util tests', () => {

  describe('parseNumber', () => {
    it('should return value if valid number', () => {
      assert.strictEqual(parseNumber('10', 20), 10)
    });

    it('should return 0 if string is 0', () => {
      assert.strictEqual(parseNumber('0', 20), 0)
    });

    it('should return default value if invalid number', () => {
      assert.strictEqual(parseNumber('invalid', 20), 20)
    });
    
  });

});
