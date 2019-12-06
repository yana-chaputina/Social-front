export default class Router {
    constructor() {
        this._mappings = new Map();
        this._callback = null;
        this.subscribe();
    }

    init() {
        // todo: route to current path
    }

    register(path, component) {
        this._mappings.set(path, component);
    }

    route(path, push = true) {
        const [route] = Array.from(this._mappings.entries()).filter(o => Router.isRouteMatch(o, path));
        if (route === undefined) {
            throw new Error(`no component registered for route: ${path}`);
        }
        if (push) {
            window.history.pushState(null, '', route[0]);
        }
        return {component: route[1], params: Router.parseRouteParams(route[0], path)};
    }

    static isRouteMatch([k, v], path) {
        if (k instanceof RegExp) {
            return k.test(path);
        }
        return k === path;
    }

    static parseRouteParams([k, v], path) {
        if (k instanceof RegExp) {
            return k.matches(path);
        }
        return {};
    }

    subscribe() {
        window.onpopstate = evt => {
            if (typeof this._callback !== 'function') {
                return;
            }
            // window.history.back();
            this._callback(document.location.pathname);
        };
    }

    onUserGoBack(callback) {
        this._callback = callback;
    }
}
