var appModuleName = 'driverApp',
    appIsRTF = false,
    appIsDebug = true;
var _glob_shopperId = 1;
(function(angular) {
    'use strict';
    var app = angular.module(appModuleName, ['ngRoute', 'ngAnimate', 'ngResource', 'ngSanitize', 'ngTouch', 'ionic']);

    app.factory('$OrderAlert', ['$rootScope', function($rootScope) {
        return {
            Start: function() {
                var oAudio = $('#driver_alert')[0];
                oAudio.play();
                try {
                    navigator.vibrate([1000, 1000, 3000, 1000, 5000]);
                } catch (e) {

                }
            },
            StartVib: function() {
                navigator.vibrate([1000, 1000, 3000, 1000, 5000]);
            },
            Stop: function() {
                var oAudio = $('#driver_alert')[0];
                oAudio.pause();
                oAudio.currentTime = 0;
                navigator.vibrate(0);
            }
        }
    }]);
    app.factory('$sharedList', ['$rootScope', '$window', function($rootScope, $window) {

        function set(data) {
            var orderList = [];
            if ($window.localStorage.getItem("orders") != null) {
                orderList = JSON.parse($window.localStorage.getItem("orders"));
                orderList.push(data);
            } else {
                orderList.push(data);
            }
            $window.localStorage.setItem("orders", JSON.stringify(orderList));

        }

        function get(id) {
            if ($window.localStorage.getItem("orders") != null) {
                var orderList = JSON.parse($window.localStorage.getItem("orders"));
                return $.grep(orderList, function(e) { return e.id == id; })[0];
            }
            // return savedList;
        }

        function orders() {
            if ($window.localStorage.getItem("orders") != null) {
                var orderList = JSON.parse($window.localStorage.getItem("orders"));
                return orderList;
            }
        }

        function del(id) {
            if ($window.localStorage.getItem("orders") != null) {
                var orderList = JSON.parse($window.localStorage.getItem("orders"));
                var o = $.grep(orderList, function(e) { return e.id == id; })[0];
                var index = orderList.lastIndexOf(o);
                orderList.splice(index, 1);
                DriverOff();
                setOrderLevel(-1);
                $window.localStorage.removeItem("currOrderId");
                $window.localStorage.setItem("orders", JSON.stringify(orderList));

            }
        }

        function cancel(id) {
            if ($window.localStorage.getItem("orders") != null) {
                var orderList = JSON.parse($window.localStorage.getItem("orders"));
                var o = $.grep(orderList, function(e) { return e.id == id; })[0];
                var index = orderList.lastIndexOf(o);
                orderList.splice(index, 1);
                $window.localStorage.setItem("orders", JSON.stringify(orderList));

            }
        }

        function getDriverLocation() {
            return JSON.parse($window.localStorage.getItem("driverLocation"));
        }

        function setDriverLocation(lat, lng) {
            var driverloc = { lat: lat, lng: lng, alt: 0 };
            $window.localStorage.setItem("driverLocation", JSON.stringify(driverloc));
        }

        function update(id, newData) {
            if ($window.localStorage.getItem("orders") != null) {
                var orderList = JSON.parse($window.localStorage.getItem("orders"));
                var o = $.grep(orderList, function(e) { return e.id == id; })[0];
                var index = orderList.lastIndexOf(o);
                orderList[index] = newData;
                $window.localStorage.setItem("orders", JSON.stringify(orderList));
            }
        }

        function isBusy() {
            if ($window.localStorage.getItem("isDriverBusy") == 'false' || $window.localStorage.getItem("isDriverBusy") == null)
                return false;
            else
                return true;
        }

        function SetCurrOrderId(id) {
            $window.localStorage.setItem("currOrderId", id);
        }

        function GetCurrOrderId() {
            return $window.localStorage.getItem("currOrderId");

        }

        function DriverOn() {
            $window.localStorage.setItem("isDriverBusy", 'true');
        }

        function DriverOff() {
            $window.localStorage.setItem("isDriverBusy", 'false');
        }

        function setOrderLevel(a) {
            $window.localStorage.setItem("OrderLevel", a);
        }

        function getOrderLevel() {
            if ($window.localStorage.getItem("OrderLevel") != null) {
                return $window.localStorage.getItem("OrderLevel");
            }
            return 0;
        }

        function clear() {
            $window.localStorage.removeItem("orders");
            $window.localStorage.setItem("currOrderId", 0);
            DriverOff();
            setOrderLevel(-1);
        }

        function clearOrders() {
            $window.localStorage.removeItem("orders");
        }
        return {
            set: set,
            get: get,
            isDriverBusy: isBusy,
            setDriverOn: DriverOn,
            setDriverOff: DriverOff,
            setOrderLevel: setOrderLevel,
            getOrderLevel: getOrderLevel,
            clear: clear,
            clearOrders: clearOrders,
            setCurrOrderId: SetCurrOrderId,
            getCurrOrderId: GetCurrOrderId,
            del: del,
            update: update,
            cancel: cancel,
            getDriverLocation: getDriverLocation,
            setDriverLocation: setDriverLocation,
            orders: orders

        }
    }]);
    app.factory('$ODS', ['$rootScope', '$sharedList', '$OrderAlert', function($rootScope, $sharedList, $OrderAlert) {
        var isServerOn = true;
        var _push = new pushService();
        _pushService.onConnected = function() {
            isServerOn = true;
        };
        _pushService.onDisconnected = function() {
            isServerOn = false;
        };
        _push.on('Notify', function(data) {
            data = JSON.parse(data);
            if (data != null && data.length > 0) {
                console.log(data);
                $sharedList.set(data);
                $OrderAlert.Start();
                window.location.href = '#/map';
            }
        });
        var getuserlocation = function(callback) {
            if (navigator.geolocation) {
                navigator.geolocation.getcurrentposition(callback);
            } else {
                x.innerhtml = "geolocation is not supported by this browser.";
            }
        }
        var functionCaller = {
            interval: 10000,
            start: function(a) {
                if (a.prototype.inProgress == undefined || !a.prototype.inProgress || a.prototype.inProgress == null) {
                    a.prototype.timer = setInterval(function() {
                        a();
                    }, this.interval);
                }
                a.prototype.inProgress = true;
            },
            stop: function(a) {
                clearInterval(a.prototype.timer);
                a.prototype.inProgress = false;
            }
        };

        function init() {
            _push.start();
            // functionCaller.start(getNewOrders);
        }

        function getNewOrders() {
            //if (isServerOn)
            //    if ($sharedList.get().length == 0) {
            //        _push.invoke('Notify', '0', function (data) { });
            //    }
        }

        function saveDriverLocation() {
            if (isServerOn)
                getUserLocation(function(data) {
                    var location = { Name: '', Latitude: data.coords.latitude, Longitude: data.coords.longitude };
                    if (loc != location) {
                        _push.invoke('TrackDriverLocation', location, function(data) {});
                        loc = location;
                    }

                });
        }
        return {
            init: init,
            getNewOrders: getNewOrders,
            saveDriverLocation: saveDriverLocation
        }

    }]);
})(angular);