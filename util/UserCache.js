var UserCache = function() {};

UserCache.prototype.set = user => {
    this._user = user;
    return this._user;
};

UserCache.prototype.get = () => {
    return this._user;
};

let _uc = new UserCache();
_uc.set({});

module.exports = _uc;
