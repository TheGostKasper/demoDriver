(function(angular) {
    'use strict';
    angular.module('driverApp').controller('DriverOrdersController', ["$scope", "$http", "$common", "$ionicLoading", "$ionicPopup", '$ionicActionSheet', '$ionicScrollDelegate', '$sharedList', '$window',
        function($scope, $http, $common, $ionicLoading, $ionicPopup, $ionicActionSheet, $ionicScrollDelegate, $sharedList, $window) {
            $scope.ordersList = [];
            $scope.noRequest = true;
            $scope.acceptOrder = function(id) {
                $ionicLoading.show({
                    template: '<ion-spinner icon="android"></ion-spinner>'
                });
                var url = $common.makeApiUrl('driver', 'AcceptOrder');
                $common.post(url, {
                    OrderId: id
                }).then(function(response) {
                    window.location.href = '#/order_details/id';
                    $ionicLoading.hide();
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert(e);
                });
            };
            $scope.cancelOrder = function(id) {
                $ionicLoading.show({
                    template: '<ion-spinner icon="android"></ion-spinner>'
                });
                var url = $common.makeApiUrl('driver', 'CancelOrder');
                $common.post(url, {
                    OrderId: id
                }).then(function(response) {
                    $ionicLoading.hide();
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert(e);
                });
            };
            $scope.getSeverUpdate = function() {
                var url = $common.makeApiUrl('shopper', 'order/list');
                $common.post(url, {
                    ShopperId: _glob_shopperId
                }).then(function(response) {
                    $ionicLoading.hide();
                    if (response.data != null) {
                        $scope.ordersList = response.data;
                        $window.localStorage.setItem("orders", JSON.stringify(response.data));
                    } else {
                        $scope.noRequest = true;
                    }
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert(e);
                });


            }

            $scope.doRefresh = function() {
                $scope.getSeverUpdate();
            };
            var getOrders = function() {
                $ionicLoading.show({
                    template: '<ion-spinner icon="android"></ion-spinner>'
                });
                if ($sharedList.orders() != null) {
                    $scope.ordersList = $sharedList.orders();
                    if ($scope.ordersList.length == 0)
                        $scope.noRequest = true;
                    else
                        $scope.noRequest = false;
                } else {
                    $scope.getSeverUpdate();
                }
                $scope.$broadcast('scroll.refreshComplete');
                $ionicLoading.hide();

            };
            var init = function() {
                getOrders();
            }.call();
            $scope.orderTime = function(t) {
                var dtNow = moment(new Date());
                var sdlDT = moment.utc(t).toDate();
                return moment.duration(dtNow.diff(sdlDT)).humanize();

            }


            $scope.startOrder = function(id) {
                $sharedList.setCurrOrderId(id);
                $sharedList.setOrderLevel(0);
                window.location.href = '#/map/';
            }
            $scope.acceptOrder = function(id) {

            }
            $scope.continueOrder = function(id, state) {
                $sharedList.setCurrOrderId(id);
                if (state == 'accepted') {
                    $sharedList.setOrderLevel(1);
                } else if (state == 'ready') {
                    $sharedList.setOrderLevel(3);
                } else if (state == 'orderpicking') {
                    $sharedList.setOrderLevel(2);
                }

                window.location.href = '#/map/';
            }
            $scope.cancelOrder = function(id) {
                $ionicLoading.show({
                    template: '<ion-spinner icon="android"></ion-spinner>'
                });
                var url = $common.makeApiUrl('shopper', 'order/cancel');
                $common.post(url, {
                    OrderId: id,
                    ShopperId: _glob_shopperId,
                    cancellingReason: ''
                }).then(function(response) {
                    $ionicLoading.hide();
                    $sharedList.del(id);
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert(e);
                });
            }
            $scope.showAlert = function(e) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Oops...',
                    template: e // 'Something went wrong. we\'re working on getting it fixed as soon as we can. '
                });
            };

            $scope.ShowProducts = function(id) {
                $ionicLoading.show({
                    template: '<ion-spinner icon="android"></ion-spinner>'
                });
                var url = $common.makeApiUrl('shopper', 'order/products');
                $common.post(url, {
                    OrderId: id
                }).then(function(response) {
                    $ionicLoading.hide();
                    var order = $sharedList.get(id);
                    order.products = response.data;
                    $sharedList.update(id, order);
                    $scope.ordersList = $sharedList.orders();
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert(e);
                });
            }


            $scope.$on('$destroy', function() {
                $scope.doRefresh = function() {
                    $ionicScrollDelegate.scrollTop(true);
                    return false;
                };
            });
        }
    ]);
})(angular);