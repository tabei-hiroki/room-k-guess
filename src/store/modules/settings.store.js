import bbox from '@turf/bbox';
import firebase from 'firebase/app';
import 'firebase/database';
import { GAME_MODE, SCORE_MODE } from '../../constants';
import i18n from '../../lang';
import router from '../../router';
import { getMaxDistanceBbox } from '../../utils';
import * as MutationTypes from '../mutation-types';

export class GameSettings {
  constructor(
    _allPanorama = false,
    _timeLimitation = 0,
    _mode = GAME_MODE.CLASSIC,
    _timeAttack = false,
    _zoomControl = true,
    _moveControl = true,
    _panControl = true,
    _countdown = 0,
    _scoreMode = SCORE_MODE.NORMAL,
    _areaParams = null,
    _optimiseStreetView = true,
    _nbRound = 5,
    _scoreLeaderboard = true,
    _guessedLeaderboard = true,
  ) {
    this.allPanorama = _allPanorama;
    this.time = _timeLimitation;
    this.modeSelected = _mode;
    this.timeAttackSelected = _timeAttack;
    this.zoomControl = _zoomControl;
    this.moveControl = _moveControl;
    this.panControl = _panControl;
    this.countdown = _countdown;
    this.scoreMode = _scoreMode;
    this.areaParams = _areaParams;
    this.optimiseStreetView = _optimiseStreetView;
    this.nbRoundSelected = _nbRound;
    this.scoreLeaderboard = _scoreLeaderboard;
    this.guessedLeaderboard = _guessedLeaderboard;
  }
}

/* ========= 追加：名前バリデーション ========= */

// NFKC 正規化：全角→半角統一、結合文字の正規化、前後空白除去
function normalizeName(str) {
  return String(str || '').normalize('NFKC').trim();
}

// 許可文字：英数字（半角/全角）＋ ひらがな ＋ カタカナ（長音符ー・半角ｶﾅ・濁/半濁）＋ 漢字（CJK）＋ 々 ＋ "_" ＋ "-"
const PLAYER_NAME_ALLOWED_RE =
  /^[A-Za-z0-9_\-\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\u3040-\u309F\u30A0-\u30FF\uFF66-\uFF9D\uFF9E\uFF9F\u4E00-\u9FFF々ー]+$/u;

const PLAYER_NAME_MIN = 1;
const PLAYER_NAME_MAX = 20;

export default {
  namespaced: true,

  state: () => ({
    // Dialog
    isOpenDialogRoom: false,
    loadRoom: false,
    currentComponent: 'settingsMap',
    singlePlayer: true,

    // ROOM
    room: null,
    roomName: '',
    roomErrorMessage: null,
    playerNumber: 0,

    // SETTINGS
    gameSettings: new GameSettings(),
    players: [],
    // ★ 過去名は引き継がない
    name: '',
    invalidName: false,

    // 内部管理
    bboxObj: null,
    difficulty: undefined,

    // ★ 多重入室/多重リスナー防止フラグ
    joining: false,
    joined: false,
    roomListenerAttached: false,
  }),

  mutations: {
    [MutationTypes.SETTINGS_SET_ROOM](state, roomName) {
      // ★ 既に join 済み/進行中なら何もしない
      if (state.joined || state.joining) return;

      state.joining = true;
      state.room = firebase.database().ref(roomName);
      state.roomName = roomName;

      // Open Modal
      if (!state.isOpenDialogRoom) {
        state.loadRoom = true;
        state.isOpenDialogRoom = true;
      }

      state.room.once('value', (snapshot) => {
        if (snapshot.child('started').val()) {
          state.roomErrorMessage = i18n.t('DialogRoom.alreadyStarted');
          state.room.off();
          state.loadRoom = false;
          state.joining = false;
          return;
        }

        // ★ 一意のプレイヤー番号をトランザクション採番
        state.room.child('playersCounter').transaction(
          (curr) => (curr || 0) + 1,
          (error, committed, counterSnap) => {
            if (error || !committed) {
              state.roomErrorMessage = 'Failed to join the room. Please try again.';
              state.loadRoom = false;
              state.joining = false;
              return;
            }

            const playerNumber = counterSnap.val(); // 1,2,3,...
            state.playerNumber = playerNumber;

            const fallbackName = i18n.t('CardRoomPlayerName.anonymousPlayerName') + playerNumber;
            const pickedName = (state.name && state.name.trim() !== '') ? state.name : fallbackName;

            // ★ 切断時クリーンアップ（自分のスロットのみ）
            state.room.child(`playerName/player${playerNumber}`).onDisconnect().remove();

            // ★ 自分の仮名を書き込み（※ 同名掃除はやらない）
            state.room.child(`playerName/player${playerNumber}`).set(pickedName, (err) => {
              if (err) {
                state.roomErrorMessage = 'Failed to join the room. Please try again.';
                state.loadRoom = false;
                state.joining = false;
                return;
              }

              // 1人目は作成時刻を付けて設定画面へ、2人目以降は名前入力ステップへ
              if (playerNumber === 1) {
                state.room.update({
                  createdAt: firebase.database.ServerValue.TIMESTAMP,
                });
                state.currentComponent = 'settingsMap';
              } else {
                state.currentComponent = 'playerName';
              }

              state.loadRoom = false;
              state.joined = true;   // ★ これ以降は再実行しない
              state.joining = false;
            });
          }
        );
      });
    },

    [MutationTypes.SETTINGS_SET_ROOM_ERROR](state, error) {
      state.roomErrorMessage = error;
    },

    [MutationTypes.SETTINGS_SET_GAME_SETTINGS](state, settings) {
      if (settings.modeSelected) {
        settings.areaParams = null;
      }
      if (settings.areaParams) {
        settings.modeSelected = GAME_MODE.CUSTOM_AREA;
      }
      state.gameSettings = { ...state.gameSettings, ...settings };
    },

    [MutationTypes.SETTINGS_SET_DIFFICULTY](state, difficulty) {
      state.difficulty = difficulty;
    },

    [MutationTypes.SETTINGS_SET_BBOX](state, bbox) {
      state.bboxObj = bbox;
    },

    [MutationTypes.SETTINGS_SET_OPEN_DIALOG_ROOM](state, open) {
      state.isOpenDialogRoom = open;
    },

    [MutationTypes.SETTINGS_SET_MODE_DIALOG_ROOM](state, singlePlayer) {
      state.singlePlayer = singlePlayer;
      state.currentComponent = singlePlayer ? 'settingsMap' : 'roomName';
    },

    [MutationTypes.SETTINGS_SET_STEP_DIALOG_ROOM](state, step) {
      state.currentComponent = step;
    },

    // valid のときだけ RTDB に書く
    [MutationTypes.SETTINGS_SET_PLAYER_NAME](state, payload) {
      const { playerName, invalid } = payload;
      state.invalidName = !!invalid;
      state.name = playerName;

      if (state.invalidName) return;
      if (state.room && state.playerNumber > 0) {
        state.room.child('playerName/player' + state.playerNumber).set(playerName);
      }
    },

    [MutationTypes.SETTINGS_SET_PLAYERS](state, players) {
      state.players = players;
    },

    [MutationTypes.SETTINGS_RESET](state) {
      state.room = null;
      state.roomName = '';
      state.playerNumber = 0;
      state.roomErrorMessage = null;
      state.players = [];
      state.gameSettings = new GameSettings();
      state.bboxObj = null;
      state.difficulty = undefined;
      state.invalidName = false;

      // ★ フラグも初期化
      state.joining = false;
      state.joined = false;
      state.roomListenerAttached = false;
    },
  },

  getters: {
    areasJson(state) {
      return state.areas;
    },
  },

  actions: {
    closeDialogRoom({ state, commit, dispatch }, cleanRoom = true) {
      commit(MutationTypes.SETTINGS_SET_OPEN_DIALOG_ROOM, false);

      if (state.room != null) {
        // ルームリスナー解除（重複登録防止）
        state.room.off();

        if (cleanRoom) {
          if (state.playerNumber === 1) {
            // 1人目はルーム丸ごと削除
            state.room.remove();
          } else {
            // 自分のノードだけ削除
            state.room.child('playerName/player' + state.playerNumber).remove();
          }
        }
      }

      dispatch('setMapLoaded', new Map(), { root: true });
      commit(MutationTypes.SETTINGS_RESET);
    },

    openDialogRoom({ commit }, isSinglePlayer = true) {
      commit(MutationTypes.SETTINGS_SET_MODE_DIALOG_ROOM, isSinglePlayer);
      commit(MutationTypes.SETTINGS_SET_OPEN_DIALOG_ROOM, true);
    },

    searchRoom({ commit, dispatch, state }, roomName) {
      commit(MutationTypes.SETTINGS_SET_MODE_DIALOG_ROOM, false);

      if (!roomName) {
        commit(MutationTypes.SETTINGS_SET_ROOM_ERROR, i18n.t('DialogRoom.invalidRoomName'));
        return;
      }

      // 既に同じ部屋へ join 済みなら再実行しない
      if (state.joined && state.roomName === roomName) return;

      commit(MutationTypes.SETTINGS_SET_ROOM, roomName);

      // ★ ルームの value リスナーは一度だけ登録
      if (!state.roomListenerAttached) {
        state.roomListenerAttached = true;

        state.room.on('value', (snapshot) => {
          if (snapshot.child('playerName').exists()) {
            state.players = Object.values(snapshot.child('playerName').val());
          }

          if (
            state.currentComponent === 'playerName' &&
            state.playerNumber !== 1 &&
            snapshot.hasChild('size') &&
            snapshot.hasChild('streetView')
          ) {
            dispatch('startGame');
          }
        });
      }
    },

    setSettings({ commit, state, rootState, dispatch }) {
      let difficulty = 2000;
      let bboxObj;

      if (rootState.homeStore.map?.geojson) {
        bboxObj = bbox(rootState.homeStore.map.geojson);
        commit(MutationTypes.SETTINGS_SET_BBOX, bboxObj);
        difficulty = getMaxDistanceBbox(bboxObj) / 10;
      }

      commit(MutationTypes.SETTINGS_SET_DIFFICULTY, difficulty);

      if (!state.room) {
        router.push({
          name: 'street-view',
          params: {
            ...state.gameSettings,
            difficulty,
            placeGeoJson: rootState.homeStore.map?.geojson,
            bboxObj,
            ...(rootState.homeStore.map ? { mapDetails: rootState.homeStore.map.details } : undefined),
          },
        });
        dispatch('closeDialogRoom');
      } else {
        state.room.update(
          {
            ...state.gameSettings,
            timeLimitation: state.gameSettings.time,
            difficulty,
            ...(bboxObj && { bboxObj }),
          },
          (error) => {
            if (!error) {
              commit(MutationTypes.SETTINGS_SET_STEP_DIALOG_ROOM, 'playerName');
            }
          }
        );
      }
    },

    // 名前セット（バリデーション + 重複名チェック）
    setPlayerName({ commit, state }, raw) {
      const norm = normalizeName(raw).slice(0, PLAYER_NAME_MAX);

      let invalid = false;
      if (norm.length < PLAYER_NAME_MIN || norm.length > PLAYER_NAME_MAX) {
        invalid = true;
      } else if (!PLAYER_NAME_ALLOWED_RE.test(norm)) {
        invalid = true;
      } else {
        const occur = state.players.filter((n) => n === norm).length;
        const selfAdjust = (state.name === norm) ? 1 : 0;
        const duplicateOthers = (occur - selfAdjust) > 0;
        if (duplicateOthers) invalid = true;
      }

      commit(MutationTypes.SETTINGS_SET_PLAYER_NAME, { playerName: norm, invalid });
    },

    startGame({ state, dispatch, rootState }) {
      let gameParams = {};
      if (state.playerNumber === 1) {
        gameParams = {
          ...state.gameSettings,
          difficulty: state.difficulty,
          placeGeoJson: rootState.homeStore.map?.geojson,
          bboxObj: state.bboxObj,
        };
        // Set flag started
        state.room.update({
          size: state.players.length,
          started: true,
        });
        dispatch('startGameMultiplayer', gameParams);
      } else {
        state.room.once('value', (snapshot) => {
          gameParams = {
            difficulty: snapshot.child('difficulty').val(),
            bboxObj: snapshot.child('bboxObj').val(),
            modeSelected: snapshot.child('modeSelected').val(),
            timeAttackSelected: snapshot.child('timeAttackSelected').val(),
            zoomControl: snapshot.child('zoomControl').val(),
            moveControl: snapshot.child('moveControl').val(),
            panControl: snapshot.child('panControl').val(),
            countdown: snapshot.child('countdown').val(),
            allPanorama: snapshot.child('allPanorama').val(),
            scoreMode: snapshot.child('scoreMode').val(),
            areaParams: snapshot.child('areaParams').val(),
            optimiseStreetView: snapshot.child('optimiseStreetView').val(),
            nbRoundSelected: snapshot.child('nbRoundSelected').val(),
            scoreLeaderboard: snapshot.child('scoreLeaderboard').val(),
            guessedLeaderboard: snapshot.child('guessedLeaderboard').val(),
          };
          dispatch('startGameMultiplayer', gameParams);
        });
      }
    },

    startGameMultiplayer({ state, rootState, dispatch }, gameParams) {
      // roomId を確実に解決：store → RTDB ref.key → 現在のURLパラメータ
      const fromStore = state.roomName;
      const fromRef   = state.room && typeof state.room.key === 'string' ? state.room.key : '';
      const fromRoute =
        router.currentRoute?.params?.roomName ||
        router.currentRoute?.params?.room ||
        router.currentRoute?.params?.id ||
        '';

      const rid = fromStore || fromRef || fromRoute;

      if (!rid || /[.#$\[\]]/.test(rid)) {
        console.error('[with-friends] roomName is empty or invalid. Abort navigation.', {
          fromStore, fromRef, fromRoute
        });
        dispatch('closeDialogRoom', false);
        router.replace({ name: 'home' });
        return;
      }

      router.push({
        name: 'with-friends',
        params: {
          roomName: rid,
          playerName: state.name,
          playerNumber: state.playerNumber,
          multiplayer: true,
          ...gameParams,
          placeGeoJson: rootState.homeStore.map?.geojson,
        },
      });

      dispatch('closeDialogRoom', false);
    },
  },
};
