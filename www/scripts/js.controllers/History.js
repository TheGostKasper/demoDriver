(function (angular) {
    'use strict';
    angular.module('driverApp').controller('DriverHistoryController', ["$scope", "$common", "$http", "$ionicLoading", "$ionicPopup", '$ionicSideMenuDelegate', '$ionicScrollDelegate', function ($scope, $common, $http, $ionicLoading, $ionicPopup, $ionicSideMenuDelegate, $ionicScrollDelegate) {
        $scope.ordersHistoryList = [];
        var getOrdersHistory = function () {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
            var url = $common.makeApiUrl('driver', 'GetCompletedOrders');
            $common.get(url).then(function (data) { $scope.ordersHistoryList = data; console.log(data) })
             .finally(function () {
                 if ($scope.ordersHistoryList.length == 0)
                     $scope.noRequest = true;
                 else
                     $scope.noRequest = false;
                 $scope.$broadcast('scroll.refreshComplete');
                 $ionicLoading.hide();
             }).catch(function (e) {
                 $ionicLoading.hide();
                 $scope.showAlert();
             });
        }
        $scope.doRefresh = function () {
            getOrdersHistory();
        };
        getOrdersHistory.call();
        $scope.showAlert = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops...',
                template: 'Something went wrong. we\'re working on getting it fixed as soon as we can. '
            });
        };
        $scope.$on('$destroy', function () {
            $scope.doRefresh = function () {
                $ionicScrollDelegate.scrollTop(true);
                return false;
            };
        });
    }]);
})(angular);