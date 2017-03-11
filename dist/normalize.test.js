'use strict';

var _normalize2 = require('./normalize');

var _normalize3 = _interopRequireDefault(_normalize2);

var _erschema = require('erschema');

var _chance = require('chance');

var _chance2 = _interopRequireDefault(_chance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var chance = new _chance2.default();
describe('reducerUtils', function () {
  describe('normalize', function () {
    var input = void 0,
        schema = void 0,
        relationshipSchema = void 0,
        comment = void 0;
    beforeEach(function () {
      comment = {
        id: chance.natural(),
        content: chance.sentence()
      };
      input = {
        id: 1,
        title: chance.word(),
        comments: [comment]
      };

      schema = (0, _erschema.schemaMapper)([(0, _erschema.standardizeEntity)({
        name: 'articles',
        properties: ['id', 'title'],
        relationships: [{ name: 'comments' }]
      }), (0, _erschema.standardizeEntity)({
        name: 'comments',
        properties: ['id', 'content']
      })]);
    });
    it('returns entities and relationships based on the input', function () {
      var _normalize = (0, _normalize3.default)(input, 'articles', schema),
          entities = _normalize.entities,
          relationships = _normalize.relationships;

      expect(entities).toEqual({
        articles: _defineProperty({}, input.id, {
          id: input.id,
          title: input.title
        }),
        comments: _defineProperty({}, comment.id, comment)
      });
      expect(relationships).toEqual({
        articles: {
          comments: _defineProperty({}, input.id, [comment.id])
        }
      });
    });
  });
});