(function(angular) {
    'use strict';
    angular.module('driverApp').controller('DriverProfileController', ["$scope", "$common", "$http", "$ionicLoading", "$ionicPopup", '$ionicSideMenuDelegate', function($scope, $common, $http, $ionicLoading, $ionicPopup, $ionicSideMenuDelegate) {

        var getUserProfile = function() {
            $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
            var url = $common.makeApiUrl('shopper', 'profile');
            $common.post(url, { shopperId: _glob_shopperId }).then(function(response) {
                $scope.userInfo = response.data;
                $ionicLoading.hide();
            }).catch(function(e) {
                $ionicLoading.hide();
                $scope.showAlert(e);
            });
        };
        var init = function() {
            getUserProfile();
        }.call();
        $scope.showAlert = function(e) {
            var alertPopup = $ionicPopup.alert({
                title: 'Oops... ',
                template: e //'Something went wrong. we\'re working on getting it fixed as soon as we can. '
            });
        };
    }]);
})(angular);