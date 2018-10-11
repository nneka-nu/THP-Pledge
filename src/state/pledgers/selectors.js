import {
  isMatch,
  mapKeys,
  reduce,
  mapValues,
  filter,
} from 'lodash';
import { createSelector } from 'reselect';

import {
  getUsState,
  getDistricts,
  getFilterBy,
} from '../selections/selectors';

export const getAllPledgers = state => state.pledgers.allPledgers;

export const getFilteredPledgers = createSelector([getAllPledgers], (allPledgers) => {
  if (!allPledgers) {
    return null;
  }
  return mapValues(allPledgers);
});

export const allTotalPledged = createSelector([getAllPledgers], (allPledgers) => {
  if (!allPledgers) {
    return null;
  }

  return reduce(allPledgers, (acc, pledgersInState) => {
    acc += filter(pledgersInState, 'pledged').length;
    return acc;
  }, 0);
});

export const allPledgersOnBallot = createSelector([getAllPledgers], (allPledgers) => {
  if (!allPledgers) {
    return null;
  }

  return reduce(allPledgers, (acc, pledgersInState) => {
    acc += filter(pledgersInState, { pledged: true, status: 'Nominee' }).length;
    return acc;
  }, 0);
});

export const groupByStateAndDistrict = createSelector(
  [
    getFilterBy,
    getFilteredPledgers,
  ],
  (filterObj, allPledgers) => {
    if (!allPledgers) {
      return null;
    }
    return mapValues(allPledgers, allPledgersInState => reduce(allPledgersInState, (acc, cur) => {
      if (cur.district) {
        if (!acc[cur.district]) {
          acc[cur.district] = [];
        }
        if (!filterObj || isMatch(cur, filterObj)) {
          acc[cur.district].push(cur);
        }
      } else {
        if (!acc[cur.role]) {
          acc[cur.role] = [];
        }
        if (!filterObj || isMatch(cur, filterObj)) {
          acc[cur.role].push(cur);
        }
      }
      return acc;
    }, {}));
  },
);

export const getPledgersByUsState = createSelector(
  [
    groupByStateAndDistrict,
    getUsState,
  ],
  (
    pledgersGroupedByDistrict,
    usState,
  ) => {
    if (usState === '') {
      return pledgersGroupedByDistrict;
    }
    const toReturn = pledgersGroupedByDistrict[usState] ? pledgersGroupedByDistrict[usState] : null;
    return { [usState]: toReturn };
  },
);

export const getPledgersByDistrict = createSelector(
  [
    getPledgersByUsState,
    getUsState,
    getDistricts,
  ],
  (
    pledgersInState,
    usState,
    districts,
  ) => {
    if (districts.length === 0 || usState === '') {
      return pledgersInState;
    }
    if (!pledgersInState[usState]) {
      return { [usState]: null };
    }
    const toReturn = reduce(districts, (acc, cur) => {
      const district = Number(cur);
      acc[district] = pledgersInState[usState][district];
      return acc;
    }, {});
    return { [usState]: toReturn };
  },
);