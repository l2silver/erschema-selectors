// @flow
import {Map, OrderedSet, List} from 'immutable'
import {createSelector} from 'reselect'
const defaultMap = new Map()
const defaultOrderedSet = new OrderedSet()

type $$state = Object;
type $$props = Object;

type $$selector<X> = (state: $$state, props: $$props) => X;

type $$idSelector = $$selector<number | string>;
type $$idsSelector = $$selector<$Iterable<number, *, *>>;
type $$selectorExact<X> = $$selector<$Exact<X>>;
type $$id = number | string



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

export default class Selector <X> {
  name: string;
  erschemaReducerName: string;
  defaultModel: X;
  constructor (erschemaReducerName: string, name: string, model: X) {
    this.erschemaReducerName = erschemaReducerName
    this.name = name
    this.defaultModel = model
    bindMethods(this, 'getEntityData', 'getEntities', 'findEntity', 'getRelatedEntityIds', 'findRelatedEntityId', 'getRawRelatedEntityIds')
  }
  getEntityData () : $$selector<Map<string, X>> {
    return createSelector(
      [
        (state) => state[this.erschemaReducerName].entities[this.name].data
      ],
      (entities: Map<string, X>) => entities
    )
  }
  getEntities (idsSelector: $$selector<List<$$id>>) : $$selector<List<X>> {
    return createSelector(
      [
        idsSelector,
        this.getEntityData()
      ],
      (ids: List<$$id>, entities: Map<string, X>) => {
        return ids.map(id => entities.get(`${id}`) || this.defaultModel)
      }
    )
  }

  findEntity (idSelector?: $$idSelector = defaultIdSelector) : $$selector<X> {
    return createSelector(
      [
        idSelector,
        this.getEntityData()
      ],
      (id: $$id, entities: Map<string, X>) => {
        return entities.get(`${id}`) || this.defaultModel
      }
    )
  }
  getRawRelatedEntityIds (relationshipName: string, idSelector?: $$idSelector = defaultIdSelector) : $$selector<OrderedSet<$$id>> {
    return createSelector(
      [
        idSelector,
        state => state[this.erschemaReducerName].relationships[this.name].get(relationshipName, defaultMap)
      ],
      (id: $$id, relationships: Map<string, OrderedSet<$$id>>) => relationships.get(`${id}`) || defaultOrderedSet
    )
  }
  getRelatedEntityIds (relationshipName: string, idSelector?: $$idSelector = defaultIdSelector) : $$selector<List<$$id>> {
    return createSelector(
      [
        this.getRawRelatedEntityIds(relationshipName, idSelector)
      ],
      (ids: OrderedSet<$$id>) => ids.toList()
    )
  }
  findRelatedEntityId (relationshipName: string, idSelector?: $$idSelector = defaultIdSelector) : $$selector<$$id> {
    return createSelector(
      [
        idSelector,
        state => state[this.erschemaReducerName].relationships[this.name].get(relationshipName, defaultMap)
      ],
      (id: $$id, relationships: Map<string, $$id>) => relationships.get(`${id}`, 0)
    )
  }

}
