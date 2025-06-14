import request from 'request';
import _ from 'underscore';
import config from '../config.js';

var LiveConnectClient = function () {
    var oauthAuthorizeUrl = 'https://login.live.com/oauth20_authorize.srf',
        oauthTokenUrl = 'https://login.live.com/oauth20_token.srf',
        clientId = config.clientId,
        clientSecret = config.clientSecret,
        redirectUrl = config.redirectUrl;

    // Helper function to create an encoded url query string from an object
    function toQueryString(obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }

    /**
     * Obtain a Live Connect authorization endpoint URL based on configuration.
     * @returns {string} The authorization endpoint URL
     */
    this.getAuthUrl = function () {
        var scopes = ['wl.signin', 'wl.basic', 'wl.offline_access', 'office.onenote_create',
            'office.onenote_update_by_app', 'office.onenote',
            'office.onenote_update', 'office.onenote', 'office.onenote',
            'Notes.Read', 'Notes.ReadWrite', 'Notes.ReadWrite.CreatedByApp'
        ];

        var query = toQueryString({
            'client_id': clientId,
            'scope': scopes.join(' '),
            'redirect_uri': redirectUrl,
            'display': 'page',
            'locale': 'en',
            'response_type': 'code'
        });
        return oauthAuthorizeUrl + "?" + query;
    };

    /* Live Connect API request sender */
    function requestAccessToken(data, callback) {
        request.post({
            url: oauthTokenUrl,
            form: _.extend({
                'client_id': clientId,
                'client_secret': clientSecret,
                'redirect_uri': redirectUrl
            }, data)
        },
            function (error, response, body) {
                if (error) {
                    callback({});
                } else {
                    callback(JSON.parse(body));
                }
            });
    }

    /**
     * @callback accessTokenCallback
     * @param {object} Response data parsed from JSON API result
     */

    /**
     * Request an access token by supplying an authorization code.
     * @param {string} authCode The authorization code
     * @param {accessTokenCallback} callback The callback with response data
     */
    this.requestAccessTokenByAuthCode = function (authCode, callback) {
        requestAccessToken({ 'code': authCode, 'grant_type': 'authorization_code' }, callback);
    };

    /**
     * Request an access token by supplying a refresh token.
     * @param {string} refreshToken The refresh token
     * @param {accessTokenCallback} callback The callback with response data
     */
    this.requestAccessTokenByRefreshToken = function (refreshToken, callback) {
        requestAccessToken({ 'refresh_token': refreshToken, 'grant_type': 'refresh_token' }, callback);
    };



};
export default new LiveConnectClient();