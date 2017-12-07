(function (angular) {
    'use strict';
    angular.module('driverApp').controller('DriverOrderDetailsController', ["$scope", "$http", "$OrderAlert", "$ionicActionSheet", "$routeParams", "$sharedList", function ($scope, $http, $OrderAlert, $ionicActionSheet, $routeParams, $sharedList) {
        $OrderAlert.Stop();
        $scope.OrderNumber = $routeParams.id;
        $scope.order = $sharedList.get();
    }]);
})(angular);