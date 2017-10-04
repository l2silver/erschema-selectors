# erschema-selectors

A class of selectors for use with the erschema-redux-immutable library

## Usage
```
import Selector from 'erschema-selectors'
import erschema from 'erschema-redux-immutable'
import { createStore, combineReducers } from 'redux';
import { Record } from 'immutable'
import schema from './schema'
import reducers from './reducer'

const store = createStore(combineReducer({
  ...reducers,
  erschema({
    schema,
  })
}))

class UserModel extends Record({
  name: '',
  id: '',
}){}

const defaultUserModel = new UserModel()

const userSelectors(
  ((state)=>state.erschema) | 'erschema',
  'users',
  defaultUserModel
)

const mapStateToProps = (state, props)=>{
  return {
    user: userSelectors.find((props)=>props.id)(state, props)
  }
}
```

## Properties

```
type $idSelector = (state: Object, props: Object)=>any
const defaultIdSelector = (s, p)=>p.id

type $idsSelector = (state: Object, props: Object)=>any[]

```
### findEntityData
```
userSelectors.findEntityData()
===>
returns all of the models for users entity type in an immutable Map
```


### find
```
userSelectors.find(idSelector?: $idSelector = defaultIdSelector)
===>
returns the user model if it exists, or the default user model
```

### get
```
userSelectors.find(idSelectors: $idsSelector)
===>
returns the ids iterator type mapped with the user models if they exists, or the default user model
```

### get
```
userSelectors.find(idSelectors: $idsSelector)
===>
returns the ids iterator type mapped with the user models if they exists, or the default user model
```

### findManyRelationshipData
```
userSelectors.findManyRelationshipData(relationshipName)
===>
returns the entire immutable Map of relationship values

ie. userSelectors.findManyRelationshipData('friends')
===>
Immutable.Map({
  [id]: Immutable.OrderedSet([...ids])
})
```

### findMonoRelationshipData
```
userSelectors.findMonoRelationshipData(relationshipName)
===>
returns the entire immutable Map of relationship values

ie. userSelectors.findManyRelationshipData('friends')
===>
Immutable.Map({
  [id]: id
})
```

### getRawRelatedIds
```
userSelectors.getRawRelatedIds(relationshipName, idSelector?: $$idSelector = defaultIdSelector)
===>
returns the relationship for a specific id as an Immutable OrderedSet if it exists, or a empty OrderedSet if no relationship for that id exists
```
### getRelatedIds
```
Same as getRawRelatedIds except returns an Immutable List instead of an OrderedSet, which is easier to work with
```

### findRelatedId
```
userSelectors.findRelatedId(relationshipName, idSelector?: $$idSelector = defaultIdSelector)
===>
returns the related id for a specific ids relationship  if it exists, or a 0 if it does not exist
```
