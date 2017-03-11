// @flow
import blacklist from 'blacklist'
import {relationshipTypes} from 'erschema'
import pick from 'lodash.pick'
import type {$schema} from 'erschema/types'

export type $normalizeResponse = {
  entities: $$mapOf<$$numberMapOf<any>>,
  relationships: $$mapOf<$$mapOf<$$numberMapOf<number | number[]>>>
};

export default function normalize(input: Object, entityName: string, schema: $schema) : $normalizeResponse {
  const entities = {}
  const relationships = {}
  _normalizeRecursive(input, entityName, schema, entities, relationships)
  return {entities, relationships}
}

const _normalizeRecursive = function (input, entityName, schema, entities, relationshipData) {
  const entitySchema = schema[entityName]
  if (!entitySchema){
    throw Error(`schema ${entityName} not defined`)
  }
  const {modifier, relationships, idFunc, properties} = schema[entityName]
  const usedRelationships = []
  const inputId = idFunc(input)
  relationships.forEach(relationshipSchema => {
    const {variableRelationshipName, relationshipName} = relationshipSchema
    const variableIds = {}
    const relation = input[relationshipName]

    if (relation) {
      usedRelationships.push(relationshipName)
      if (relationshipSchema.type === relationshipTypes.MANY) {
        let relationshipIds = []
        relation.forEach(relatedEntity => {
          if (typeof relatedEntity === 'number') {
            relationshipIds.push(relatedEntity)
          }
          else {
            _normalizeRecursive(relatedEntity, relationshipSchema.name, schema, entities, relationshipData)
            if (variableRelationshipName && variableRelationshipName.getRelationshipName) {
              const variableName = variableRelationshipName.getRelationshipName(relatedEntity)
              if (!variableIds[variableName]) {
                variableIds[variableName] = []
              }
              variableIds[variableName].push(relatedEntity.id)
            }
            relationshipIds.push(relatedEntity.id)
          }
        })
        if (variableRelationshipName && variableRelationshipName.getRelationshipName) {
          Object.keys(variableIds).forEach(variableRelationshipName => {
            _addToRelationships(relationshipData, entityName, variableRelationshipName, inputId, variableIds[variableRelationshipName])
          })
        }
        _addToRelationships(relationshipData, entityName, relationshipName, inputId, relationshipIds)
      }
      else {
        let relationshipId
        if (typeof relation === 'number') {
          relationshipId = relation
        }
        else {
          relationshipId = relation.id
          _normalizeRecursive(relation, relationshipSchema.name, schema, entities, relationshipData)
        }
        _addToRelationships(relationshipData, entityName, relationshipName, inputId, relationshipId)
      }
    }
  })
  _addToEntities(entities, entityName, usedRelationships, input, modifier, properties, inputId)
}

const _addToRelationships = function (relationships, entityName, relationshipName, entityId, values) {
  if (!relationships[entityName]) {
    relationships[entityName] = {}
  }
  if (!relationships[entityName][relationshipName]) {
    relationships[entityName][relationshipName] = {}
  }
  relationships[entityName][relationshipName][entityId] = values
}

const _addToEntities = function (entities, entityName, usedRelationships, entity, modifier, properties, id) {
  if (!entities[entityName]) {
    entities[entityName] = {}
  }
  let nextEntity = pick(entity, properties)
  if (usedRelationships.length) {
    nextEntity = blacklist.apply(null, [entity,...usedRelationships])
  }
  if (Object.keys(nextEntity).length > 1) {
    entities[entityName][id] = modifier ? modifier(nextEntity) : nextEntity
  }
}
