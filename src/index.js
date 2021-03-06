// @flow
import {Map, OrderedSet, List} from 'immutable'
import {createSelector} from 'reselect'
import { get } from 'lodash'

const defaultMap = new Map()
const defaultOrderedSet = new OrderedSet()

type $$state = Object;
type $$props = Object;

type $$selector<X> = (state: $$state, props: $$props) => X;

type $$idSelector = $$selector<number | string>;
type $$idsSelector = $$selector<$Iterable<number, *, *>>;
type $$selectorExact<X> = $$selector<$Exact<X>>;
type $$id = number | string;

const bindMethods = function(klass, ...methodNames){
  methodNames.forEach((methodName)=>{
    //$FlowFixMe
    klass[methodName] = klass[methodName].bind(klass)
  })
}

const defaultIdSelector = function (state: Object, props: Object) {
  if (props && props.id) {
    return props.id
  }
  return 0
}

const getErschemaReducer = (erschemaReducerPathOrFunction: string | Function)=>{
  if (typeof erschemaReducerPathOrFunction === 'string') {
    return (state)=>get(state, erschemaReducerPathOrFunction);
  }
  return erschemaReducerPathOrFunction;
}

export default class Selector <X> {
  name: string;
  getErschemaReducer: Function;
  defaultModel: X;
  constructor (erschemaReducerName: string | Function, name: string, model: X) {
    this.getErschemaReducer = getErschemaReducer(erschemaReducerName);
    this.name = name
    this.defaultModel = model
    bindMethods(
      this,
      'findEntityData',
      'get',
      'find',
      'getRelatedIds',
      'findRelatedId',
      'getRawRelatedIds',
      'findMonoRelationshipData',
      'findManyRelationshipData',
    )
  }
  findEntityData () : $$selector<Map<string, X>> {
    return createSelector(
      [
        (state) => this.getErschemaReducer(state).entities[this.name]
      ],
      (entities: Map<string, X>) => entities
    )
  }
  findManyRelationshipData (relationshipName: string) : $$selector<Map<string, X>> {
    return createSelector(
      [
        (state) => this.getErschemaReducer(state).relationships[this.name][relationshipName]
      ],
      (relationships: Map<string, OrderedSet<$$id>>) => (relationships || defaultMap)
    )
  }
  findMonoRelationshipData (relationshipName: string) : $$selector<Map<string, X>> {
    return createSelector(
      [
        (state) => this.getErschemaReducer(state).relationships[this.name][relationshipName]
      ],
      (relationships: Map<string, $$id>) => (relationships || defaultMap)
    )
  }
  get (idsSelector: $$selector<List<$$id>>) : $$selector<List<X>> {
    return createSelector(
      [
        idsSelector,
        this.findEntityData()
      ],
      (ids: List<$$id>, entities: Map<string, X>) => {
        return ids.map(id => entities.get(`${id}`) || this.defaultModel)
      }
    )
  }

  find (idSelector?: $$idSelector = defaultIdSelector) : $$selector<X> {
    return createSelector(
      [
        idSelector,
        this.findEntityData()
      ],
      (id: $$id, entities: Map<string, X>) => {
        return entities.get(`${id}`) || this.defaultModel
      }
    )
  }
  getRawRelatedIds (relationshipName: string, idSelector?: $$idSelector = defaultIdSelector) : $$selector<OrderedSet<$$id>> {
    return createSelector(
      [
        idSelector,
        this.findManyRelationshipData(relationshipName),
      ],
      (id: $$id, relationships: Map<string, OrderedSet<$$id>>) => {
        return (relationships.get(`${id}`) || defaultOrderedSet)
      }
    )
  }
  getRelatedIds (relationshipName: string, idSelector?: $$idSelector = defaultIdSelector) : $$selector<List<$$id>> {
    return createSelector(
      [
        this.getRawRelatedIds(relationshipName, idSelector)
      ],
      (ids: OrderedSet<$$id>) => ids.toList()
    )
  }
  findRelatedId (relationshipName: string, idSelector?: $$idSelector = defaultIdSelector) : $$selector<$$id> {
    return createSelector(
      [
        idSelector,
        this.findMonoRelationshipData(relationshipName),
      ],
      (id: $$id, relationships: Map<string, $$id>) => relationships.get(`${id}`, 0)
    )
  }
}

export class PageSelector<X> {
  name: string;
  model: X;
  getErschemaReducer: Function;
  constructor(erschemaReducerName: string | Function, name: string, model: X) {
    this.name = name;
    this.model = model;
    this.getErschemaReducer = getErschemaReducer(erschemaReducerName);
    bindMethods(
      this,
      'find',
      'getRelatedIds',
      'getRawRelatedIds',
      'findRelatedId',
    )
  }
  find = (): any => {
    return (state: $$state) =>
    this.getErschemaReducer(state).entities.pages.getIn([this.name]) || this.model;
  };
  getRelatedIds = (relationshipName: string): any => {
    return createSelector(
      [
        this.getRawRelatedIds(relationshipName),
      ],
      (relatedIds: OrderedSet<$$id>) =>
        (relatedIds || new OrderedSet()).toList()
    );
  };
  getRawRelatedIds = (relationshipName: string): any => {
    return state => {
      if (!this.getErschemaReducer(state).relationships.pages[relationshipName]) {
        throw new Error(
          `Missing relationship ${relationshipName} in pages schema ${this
            .name}`
        );
      }
      return this.getErschemaReducer(state).relationships.pages[relationshipName].get(
        this.name
      );
    }
  };
  findRelatedId = (relationshipName: string): any => {
    return state =>
    this.getErschemaReducer(state).relationships.pages[relationshipName].get(this.name);
  };
}