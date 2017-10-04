// @flow
import {Map, OrderedSet, Record, List} from 'immutable'
import Selectors from './'

const getId = ()=>Math.floor(Math.random()*1000000)

class PatientModel extends Record({id: 0}) {}

describe('selectorUtils', function () {
  describe('Selector', function () {
    const selector = new Selectors('erschema', 'patients', new PatientModel())
    const patient1 = new PatientModel({id: getId()})
    const patient2 = new PatientModel({id: getId()})
    const patient3 = new PatientModel({id: getId()})
    const woundId = getId()
    const state = {
      erschema: {
        entities: {
          patients: new Map({
            [patient1.id]: patient1,
            [patient2.id]: patient2,
            [patient3.id]: patient3
          })
        },
        relationships: {
          patients: new class extends Record({wounds: new Map(), wound: new Map()}){}({
            wounds: new Map({
              [patient1.id]: new OrderedSet([woundId])
            }),
            wound: new Map({
              [patient1.id]: woundId
            })
          })
        }
      }
    }
    it('find', function () {
      expect(selector.find()(state, {id: patient1.id})).toBe(patient1)
    })
    it('find returns default', function () {
      expect(selector.find()(state, {id: 0})).toEqual(new PatientModel())
    })
    it('get', function () {
      expect(selector.get(() => new List([patient1.id, patient2.id]))(state, {})).toEqual(new List([patient1, patient2]))
    })
    it('get return default', function () {
      expect(selector.get(() => new List([0, -1]))(state, {})).toEqual(new List([new PatientModel(), new PatientModel()]))
    })
    it('findEntityData', function () {
      expect(selector.findEntityData()(state, {})).toBe(state.erschema.entities.patients)
    })
    it('getRelatedIds', function () {
      // $FlowFixMe
      expect(selector.getRelatedIds('wounds', () => patient1.id)(state)).toEqual(new List([woundId]))
    })
    it('getRelatedIds returns default', function () {
      // $FlowFixMe
      expect(selector.getRelatedIds('wounds', () => patient2.id)(state)).toEqual(new List())
    })
    it('findRelatedId', function () {
      expect(selector.findRelatedId('wound', () => patient1.id)(state, {})).toEqual(woundId)
    })
    it('findRelatedId returns default', function () {
      expect(selector.findRelatedId('wound', () => patient2.id)(state, {})).toEqual(0)
    })
  })
})
