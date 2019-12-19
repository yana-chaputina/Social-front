import Api from './http.js';
import Translator from './translator.js';
import Router from './router.js';
import MainPage from './pages/MainPage.js'
import MessagesPage from './pages/MessagesPage.js'

class Context {
    constructor(rootEl, api, router, translator, mediaUrl, websocketUrl) {
        this._rootEl = rootEl;
        this._api = api;
        this._router = router;
        this._router.onUserGoBack(path => {
            this.route(path, false);
        });
        this._translator = translator;
        this._path = '/';
        this._pathParams = {};
        this._component = null;
        this._mediaUrl = mediaUrl;
        this._websocketUrl = websocketUrl;
        this.route(this._path);
    }

    rootEl() {
        return this._rootEl;
    }

    translate(code) {
        console.log(code);
        return this._translator.translate(code);
    }

    route(path, push = true) {
        this.destroyComponent();
        this._path = path;
        const {component, params} = this._router.route(path, push);
        this._component = new component(this);
        this._pathParams = params;
        this.initComponent();
    }

    pathParams() {
        return this._pathParams;
    }

    get(path, headers = {}, onSuccess = null, onFail = null) {
        this._api.get(path, headers, onSuccess, onFail);
    };

    post(path, data, headers = {}, onSuccess = null, onFail = null) {
        this._api.post(path, data, headers, onSuccess, onFail);
    };

    delete(path, headers = {}, onSuccess = null, onFail = null) {
        this._api.delete(path, headers, onSuccess, onFail);
    };

    mediaUrl() {
        return this._mediaUrl;
    }

    webSocketUrl() {
        return this._websocketUrl;
    }

    initComponent() {
        if (!this._component) {
            return;
        }
        if (typeof this._component.init !== 'function') {
            return;
        }
        this._component.init();
    }

    destroyComponent() {
        if (!this._component) {
            return;
        }
        if (typeof this._component.destroy !== 'function') {
            return;
        }
        this._component.destroy();
    }
}


const translator = new Translator();
const router = new Router();

router.register('/', MainPage);
router.register('/messages', MessagesPage);

const [backendUrl, websocketUrl] = ['localhost', '127.0.0.1'].includes(window.location.hostname) ?
    ['http://localhost:9999', 'ws://localhost:9999/ws'] : ['https://socialnetwork-back.herokuapp.com', 'wss://socialnetwork-back.herokuapp.com/ws'];

const api = new Api(`${backendUrl}/api`);
new Context(document.getElementById('root'), api, router, translator, backendUrl, websocketUrl);

