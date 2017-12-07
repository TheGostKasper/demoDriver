var _glob_shopperId = 1;
(function (angular) {
    'use strict';
    angular.module('driverApp').controller('DriverDashboardController', ["$scope", "$common", "$http", "$OrderAlert", '$ionicActionSheet', '$ionicSideMenuDelegate', '$ionicLoading', '$sharedList', '$rootScope', function ($scope, $common, $http, $OrderAlert, $ionicActionSheet, $ionicSideMenuDelegate, $ionicLoading, $sharedList, $rootScope) {

        if ($rootScope.dStatus == 'online') {
            window.location.href = '#/map';
        }
        $scope.ordersList = [];
        var _push = new pushService();
        _push.proxy.client.shopperNewOrder = function (data) {
            if (data != null) {
                $scope.ordersList.push(data);
                $sharedList.set(data);
                $scope.noRequest = false;
                $OrderAlert.Start();
                $scope.Orders.current = 1;
                if (!$scope.$$phase) $scope.$apply();
                
            };
        };
        _push.start();
        
        $scope.acceptOrder = function (id) {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>'});
            var url = $common.makeApiUrl('driver', 'AcceptOrder');
            $common.post(url, { OrderId: id }).then(function (response) {
                window.location.href = '#/order_details/id';
                $ionicLoading.hide();
            }).catch(function (e) {
                $ionicLoading.hide();
                $scope.showAlert();
            });
        };
        $scope.cancelOrder = function (id) {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>'});
            var url = $common.makeApiUrl('driver', 'CancelOrder');
            $common.post(url, { OrderId: id }).then(function (response) {
                $ionicLoading.hide();
            }).catch(function (e) {
                $ionicLoading.hide();
                $scope.showAlert();
            });
        };

        $scope.showAlert = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops...',
                template: 'Something went wrong. we\'re working on getting it fixed as soon as we can. '
            });
        };

        function onSuccess(position) {
            var data = { shopperId: _glob_shopperId, latitude: position.coords.latitude, longitude: position.coords.longitude };
            var url = $common.makeApiUrl('shopper', 'coordinates');
            $common.post(url, data).then(function (response) {
                $scope.userInfo = response.data;
                //$ionicLoading.hide();
            }).catch(function (e) {
                //$ionicLoading.hide();
                $scope.showAlert();
            });
        }
        function onError(error) {
            //alert('code: ' + error.code + '\n' +
            //      'message: ' + error.message + '\n');
        }
        var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });

    }]);
})(angular);