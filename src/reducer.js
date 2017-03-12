// @flow
import reduxOverlord from 'redux-overlord'
import {combineReducers} from 'redux'
import {entityReducer, relationshipReducer, relationshipPageReducer} from 'erschema-action-handlers'
import hor from './hor'
import type {$schema, $entitySchema} from 'erschema/types'
import type {$mapOf, $reducer} from './hor'

type $input = {
  schema: $schema,
  mapOfEntityReducers?: $mapOf<$mapOf<$reducer>>,
  mapOfRelationshipReducers?: $mapOf<$mapOf<$reducer>>,
  overlordActions?: $mapOf<$reducer>,
  pageSchema?: $schema,
}

const getPageRelationships = function getPageRelationships(pageSchema: $schema){
  return Object.keys(pageSchema).reduce((finalResult, pageName)=>{
    finalResult[pageName] = pageSchema[pageName].relationships
    return finalResult
  }, {})
}

const getPageModelGenerator = function(schema: $schema){
  return function(entity){
    return schema[entity.id].Model
  }
}

export default function({schema, mapOfEntityReducers = {}, mapOfRelationshipReducers = {}, overlordActions = {}, pageSchema}: $input){
  const pageEntity = {}
  const pageRelationship = {}
  if(pageSchema){
    pageEntity.pages = mapOfEntityReducers.pages || entityReducer({name: 'pages', modelGenerator: getPageModelGenerator(pageSchema)})
    pageRelationship.pages = mapOfRelationshipReducers.pages || relationshipPageReducer({name: 'pages', relationships: getPageRelationships(pageSchema)})
  }
  const entities = Object.keys(schema).reduce((finalResult, schemaName)=>{
    const entitySchema = schema[schemaName]
    finalResult[schemaName] = mapOfEntityReducers[schemaName] || entityReducer({
      name: schemaName,
      Model: entitySchema.Model
    })
    return finalResult
  }, pageEntity)
  const relationships = Object.keys(schema).reduce((finalResult, schemaName)=>{
    const entitySchema = schema[schemaName]
    // $FlowFixMe
    const {relationships} = entitySchema
    finalResult[schemaName] = mapOfRelationshipReducers[schemaName] || relationshipReducer({
      name: schemaName,
      relationships,
    })
    return finalResult
  }, pageRelationship)
  const entityRelationshipReducers = combineReducers({
    entities: combineReducers(entities),
    relationships: combineReducers(relationships),
  })
  return reduxOverlord(entityRelationshipReducers, hor(overlordActions))
}