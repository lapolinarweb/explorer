import { REALM, WORLD_EXPLORER } from 'config'
import { call, fork, put, select, takeEvery } from 'redux-saga/effects'
import { getAddedServers, getContentAllowlist } from 'shared/meta/selectors'
import { fecthCatalystRealms, fetchCatalystStatuses, getRealmFromString, pickCatalystRealm } from '.'
import { getFromLocalStorage, saveToLocalStorage } from '../../atomicHelpers/localStorage'
import { waitForMetaConfigurationInitialization } from '../meta/sagas'
import {
  catalystRealmInitialized,
  initCatalystRealm,
  InitCatalystRealm,
  INIT_CATALYST_REALM,
  setAddedCatalystCandidates,
  SetAddedCatalystCandidates,
  setCatalystCandidates,
  SetCatalystCandidates,
  SetCatalystRealm,
  setContentAllowlist,
  SET_ADDED_CATALYST_CANDIDATES,
  SET_CATALYST_CANDIDATES,
  SET_CATALYST_REALM,
  WEB3_INITIALIZED,
} from './actions'
import { ping } from './index'
import { getAllCatalystCandidates } from './selectors'
import { Candidate, Realm, ServerConnectionStatus } from './types'

const CACHE_KEY = 'realm'
const CATALYST_CANDIDATES_KEY = CACHE_KEY + '-' + SET_CATALYST_CANDIDATES

export function* daoSaga(): any {
  yield takeEvery(WEB3_INITIALIZED, loadCatalystRealms)

  yield takeEvery([INIT_CATALYST_REALM, SET_CATALYST_REALM], cacheCatalystRealm)
  yield takeEvery([SET_CATALYST_CANDIDATES, SET_ADDED_CATALYST_CANDIDATES], cacheCatalystCandidates)
}

/**
 * This method will try to load the candidates as well as the selected realm.
 *
 * The strategy to select the realm in terms of priority is:
 * 1- Realm configured in the URL and cached candidate for that realm (uses cache, forks async candidadte initialization)
 * 2- Realm configured in the URL but no corresponding cached candidate (implies sync candidate initialization)
 * 3- Last cached realm (uses cache, forks async candidadte initialization)
 * 4- Best pick from candidate scan (implies sync candidate initialization)
 */
function* loadCatalystRealms() {
  yield call(waitForMetaConfigurationInitialization)

  if (WORLD_EXPLORER) {
    const cachedRealm: Realm | undefined = getFromLocalStorage(CACHE_KEY)

    let realm: Realm | undefined

    // check for cached realms if any
    if (cachedRealm) {
      const cachedCandidates: Candidate[] = getFromLocalStorage(CATALYST_CANDIDATES_KEY) ?? []

      let configuredRealm: Realm
      if (REALM) {
        // if a realm is configured, then try to initialize it from cached candidates
        configuredRealm = yield call(getConfiguredRealm, cachedCandidates)
      } else {
        // in case there are no cached candidates or the realm was not configured in the URL -> use last cached realm
        configuredRealm = cachedRealm
      }

      if (configuredRealm && (yield checkValidRealm(configuredRealm))) {
        realm = configuredRealm

        yield fork(initializeCatalystCandidates)
      }
    }

    // if no realm was selected, then do the whole initialization dance
    if (!realm) {
      yield call(initializeCatalystCandidates)

      const allCandidates: Candidate[] = yield select(getAllCatalystCandidates)

      realm = yield call(getConfiguredRealm, allCandidates)
      if (!realm) {
        realm = yield call(pickCatalystRealm, allCandidates)
      }
    }

    yield put(initCatalystRealm(realm!))
  } else {
    yield put(setCatalystCandidates([]))
    yield put(setAddedCatalystCandidates([]))
    yield put(setContentAllowlist([]))
    yield put(
      initCatalystRealm({
        domain: window.location.origin,
        catalystName: 'localhost',
        layer: 'stub',
        lighthouseVersion: '0.1',
      })
    )
  }

  yield put(catalystRealmInitialized())
}

function getConfiguredRealm(candidates: Candidate[]) {
  if (REALM) {
    return getRealmFromString(REALM, candidates)
  }
}

function* initializeCatalystCandidates() {
  const candidates: Candidate[] = yield call(fecthCatalystRealms)

  yield put(setCatalystCandidates(candidates))

  const added: string[] = yield select(getAddedServers)
  const addedCandidates: Candidate[] = yield call(
    fetchCatalystStatuses,
    added.map((url) => ({ domain: url }))
  )

  yield put(setAddedCatalystCandidates(addedCandidates))

  const allCandidates: Candidate[] = yield select(getAllCatalystCandidates)

  const allowlist: string[] = yield select(getContentAllowlist)
  let allowlistedCandidates = allCandidates.filter((candidate) => allowlist.includes(candidate.domain))
  if (allowlistedCandidates.length === 0) {
    // if intersection is empty (no allowlisted or not in our candidate set) => allowlist all candidates
    allowlistedCandidates = allCandidates
  }

  yield put(setContentAllowlist(allowlistedCandidates))
}

async function checkValidRealm(realm: Realm) {
  return (
    realm.domain &&
    realm.catalystName &&
    realm.layer &&
    (await ping(`${realm.domain}/comms/status`)).status === ServerConnectionStatus.OK
  )
}

function* cacheCatalystRealm(action: InitCatalystRealm | SetCatalystRealm) {
  saveToLocalStorage(CACHE_KEY, action.payload)
}

function* cacheCatalystCandidates(action: SetCatalystCandidates & SetAddedCatalystCandidates) {
  const allCandidates = yield select(getAllCatalystCandidates)

  saveToLocalStorage(CATALYST_CANDIDATES_KEY, allCandidates)
}
