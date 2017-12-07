(function (angular) {
    'use strict';
    angular.module('driverApp').controller('DriverEarningController', ["$scope", "$common", "$http", "$ionicLoading", "$ionicPopup", '$ionicSideMenuDelegate', function ($scope, $common, $http, $ionicLoading, $ionicPopup, $ionicSideMenuDelegate) {

        var getDriverEarning = function () {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
            //$scope.earning.m = "0";
            var url = $common.makeApiUrl('driver', 'GetDriverEarning');
            $common.get(url).then(function (data) {
                $scope.earning = data;
                $ionicLoading.hide();
            }).catch(function (e) {
                $ionicLoading.hide();
                $scope.showAlert();
            });
        };
        var init = function () {
            getDriverEarning();
        }.call();
        $scope.showAlert = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops...',
                template: 'Something went wrong. we\'re working on getting it fixed as soon as we can. '
            });
        };
    }]);
})(angular);