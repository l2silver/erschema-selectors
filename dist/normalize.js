'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = normalize;

var _blacklist = require('blacklist');

var _blacklist2 = _interopRequireDefault(_blacklist);

var _erschema = require('erschema');

var _lodash = require('lodash.pick');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function normalize(input, entityName, schema) {
  var entities = {};
  var relationships = {};
  _normalizeRecursive(input, entityName, schema, entities, relationships);
  return { entities: entities, relationships: relationships };
}

var _normalizeRecursive = function _normalizeRecursive(input, entityName, schema, entities, relationshipData) {
  var entitySchema = schema[entityName];
  if (!entitySchema) {
    throw Error('schema ' + entityName + ' not defined');
  }
  var _schema$entityName = schema[entityName],
      modifier = _schema$entityName.modifier,
      relationships = _schema$entityName.relationships,
      idFunc = _schema$entityName.idFunc,
      properties = _schema$entityName.properties;

  var usedRelationships = [];
  var inputId = idFunc(input);
  relationships.forEach(function (relationshipSchema) {
    var variableRelationshipName = relationshipSchema.variableRelationshipName,
        relationshipName = relationshipSchema.relationshipName;

    var variableIds = {};
    var relation = input[relationshipName];

    if (relation) {
      usedRelationships.push(relationshipName);
      if (relationshipSchema.type === _erschema.relationshipTypes.MANY) {
        var relationshipIds = [];
        relation.forEach(function (relatedEntity) {
          if (typeof relatedEntity === 'number') {
            relationshipIds.push(relatedEntity);
          } else {
            _normalizeRecursive(relatedEntity, relationshipSchema.name, schema, entities, relationshipData);
            if (variableRelationshipName && variableRelationshipName.getRelationshipName) {
              var variableName = variableRelationshipName.getRelationshipName(relatedEntity);
              if (!variableIds[variableName]) {
                variableIds[variableName] = [];
              }
              variableIds[variableName].push(relatedEntity.id);
            }
            relationshipIds.push(relatedEntity.id);
          }
        });
        if (variableRelationshipName && variableRelationshipName.getRelationshipName) {
          Object.keys(variableIds).forEach(function (variableRelationshipName) {
            _addToRelationships(relationshipData, entityName, variableRelationshipName, inputId, variableIds[variableRelationshipName]);
          });
        }
        _addToRelationships(relationshipData, entityName, relationshipName, inputId, relationshipIds);
      } else {
        var relationshipId = void 0;
        if (typeof relation === 'number') {
          relationshipId = relation;
        } else {
          relationshipId = relation.id;
          _normalizeRecursive(relation, relationshipSchema.name, schema, entities, relationshipData);
        }
        _addToRelationships(relationshipData, entityName, relationshipName, inputId, relationshipId);
      }
    }
  });
  _addToEntities(entities, entityName, usedRelationships, input, modifier, properties, inputId);
};

var _addToRelationships = function _addToRelationships(relationships, entityName, relationshipName, entityId, values) {
  if (!relationships[entityName]) {
    relationships[entityName] = {};
  }
  if (!relationships[entityName][relationshipName]) {
    relationships[entityName][relationshipName] = {};
  }
  relationships[entityName][relationshipName][entityId] = values;
};

var _addToEntities = function _addToEntities(entities, entityName, usedRelationships, entity, modifier, properties, id) {
  if (!entities[entityName]) {
    entities[entityName] = {};
  }
  var nextEntity = (0, _lodash2.default)(entity, properties);
  if (usedRelationships.length) {
    nextEntity = _blacklist2.default.apply(null, [entity].concat(_toConsumableArray(usedRelationships)));
  }
  if (Object.keys(nextEntity).length > 1) {
    entities[entityName][id] = modifier ? modifier(nextEntity) : nextEntity;
  }
};