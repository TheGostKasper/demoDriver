var _debug = true;
(function(angular) {
    'use strict';

    var app = angular.module(appModuleName);

    app.factory('$common', ['$log', '$rootScope', '$http', '$q', '$timeout', '$location', '$route', '$window', '$ionicPopup',
        function($log, $rootScope, $http, $q, $timeout, $location, $route, $window, $ionicPopup) {

            // $log.info('$common is initialized!');


            // We want to update menu only when a route is actually changed
            // as $location.path() will get updated immediately (even if route
            // change fails!)
            $rootScope.$on('$routeChangeSuccess', function() {
                if ($route && $route.current && $route.current.originalPath) {
                    //$log.info('rout is succeess, path changed to: ' + $route.current.originalPath);
                }
            });

            // Async helpers
            function _deferred() { return $q.defer(); }

            function _timeout(cb, delay) { $timeout(cb, delay); }

            // HTTP Requests
            var _getTemplate = function(name, params) {
                var url = $('html').attr('data-urlroot') + '/html/' + name;
                var config = { method: "get", url: url, cache: true };
                if (params != null && angular.isObject(params)) config.params = params;
                return ($http(config).then(handleSuccess, handleError));
            }

            var _request = function(url, data, params) {
                var config = { method: "post", url: url, cache: false };
                if (params != null && angular.isObject(params)) config.params = params;
                if (data != null && angular.isObject(data)) config.data = data;
                return ($http(config).then(handleSuccess, handleError));
            }
            var _get_request = function(url, data, params) {
                var config = { method: "get", url: url, cache: false };
                if (params != null && angular.isObject(params)) config.params = params;
                if (data != null && angular.isObject(data)) config.data = data;
                return ($http(config).then(handleSuccess, handleError));
            }
            var _get = function(url, data, headers, params) {
                if (!headers) headers = {};
                headers.Authorization = 'Bearer ' + $window.localStorage.getItem('shopperToken');
                var config = { method: "get", url: url, cache: false, headers: headers };
                if (params != null && angular.isObject(params)) config.params = params;
                if (data != null && angular.isObject(data)) config.data = data;
                return ($http(config).then(handleSuccess, handleError));
            }
            var _post = function(url, data, headers, params) {
                if (!headers) headers = {};
                headers.Authorization = 'Bearer ' + $window.localStorage.getItem('shopperToken');
                var config = { method: "post", url: url, cache: false, headers: headers };
                if (params != null && angular.isObject(params)) config.params = params;
                if (data != null && angular.isObject(data)) config.data = data;
                return ($http(config).then(handleSuccess, handleError));
            }
            var _getToken = function(url, data, headers, params) {
                var config = { method: "post", url: url, cache: false, headers: headers };
                if (params != null && angular.isObject(params)) config.params = params;
                if (data != null && angular.isObject(data)) config.data = data;
                return ($http(config).then(handleSuccess, handleError));
            }




            var _put = function(url, data, headers, params) {
                if (!headers) headers = {};
                headers.Authorization = 'Bearer ' + $window.localStorage.getItem('shopperToken');
                var config = { method: "put", url: url, cache: false, headers: headers };
                if (params != null && angular.isObject(params)) config.params = params;
                if (data != null && angular.isObject(data)) config.data = data;
                return ($http(config).then(handleSuccess, handleError));
            }
            var _info = function(a) { if (_debug) $log.info(a); }
            var _redirectTo = function(a) {
                if (a == null || a.length < 1) a = '/';
                $location.path(a);
            }

            var _guidCounter = 1;
            var _newGuid = function() {
                return _guidCounter++;
            }

            var _makeApiUrl = function(controller, action) {
                // var result = "http://192.168.1.16:60/api/" + controller;
                var result = "https://www.weelo.com.eg/api/" + controller;
                if (action) result = result + '/' + action;
                return result;
            }

            var _createTempAnchor = function(url) {
                var div = document.createElement('div');
                div.innerHTML = "<a></a>";
                div.firstChild.href = url; // Ensures that the href is properly escaped
                div.innerHTML = div.innerHTML; // Run the current innerHTML back through the parser
                return div.firstChild;
            }

            var _appendRouteParams = function(targetUrl) {
                var a = _createTempAnchor($location.url()),
                    res = a.search;
                a.href = targetUrl;
                if (angular.isString(res) && res.length > 1) {
                    if (a.href.indexOf('?') > 0)
                        res = res.replace('?', '&');
                    res = a.href + res;
                } else
                    res = a.href;
                return res;
            }

            var _error = function(msg) {
                return msg;
            }



            // ---
            // PRIVATE METHODS.
            // ---

            var _showAlert = function(msgs) {
                $('.alert').html('');
                if (!angular.isObject(msgs)) return;
                for (var i = 0; i < msgs.length; i++) {
                    var dv = $('<div/>');
                    dv.append($('<strong class="error-header"/>').html(msgs[i].Key + ' - '));
                    dv.append($('<span class="error-desc"/>').html(msgs[i].Message))
                    $('.alert').append(dv);
                }
                if (!$('.alert').is(':visible')) {
                    $('.alert').slideDown('fast');
                }
            }
            var _closeAlert = function() {
                $('.alert').hide();
                $('.alert').html('');
            };

            // I transform the error response, unwrapping the application dta from
            // the API response payload.
            var _unknownError = {
                Succeeded: false,
                ValidationMessages: [{
                    IsOverridable: false,
                    Key: "UnknownError",
                    Level: 2,
                    Message: "An unknown error occurred."
                }]
            };

            function handleError(response) {

                // The API response from the server should be returned in a
                // nomralized format. However, if the request was not handled by the
                // server (or what not handles properly - ex. server error), then we
                // may have to normalize it on our end, as best we can.
                if (!angular.isObject(response.data) || !response.data.ValidationMessages) {
                    return ($q.reject(_unknownError));
                }

                switch (response.data.ErrorCode) {
                    case 2:
                        ; // Redirect to login page
                }

                _showAlert(response.data.ValidationMessages);
                // Otherwise, use expected error message.
                return ($q.reject(response.data));
            }


            // I transform the successful response, unwrapping the application data
            // from the API response payload.
            function handleSuccess(response) {
                _closeAlert();
                return (response.data);
            }

            // $common services
            return {
                'info': _info,
                'request': _request,
                'showAlert': _showAlert,
                'closeAlert': _closeAlert,
                'get': _get,
                'post': _post,
                'getToken': _getToken,
                'getRequest': _get_request,
                'put': _put,
                'redirectTo': _redirectTo,
                'newGuid': _newGuid,
                getTemplate: _getTemplate,
                'makeApiUrl': _makeApiUrl,
                "appendRouteParams": _appendRouteParams,
                error: _error,
                'deferred': _deferred,
                'timeout': _timeout
            };

        }
    ]);
})(angular);