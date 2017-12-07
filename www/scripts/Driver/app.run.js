/* RootScope Initial */
(function(angular, $) {
    'use strict';
    var app = angular.module(appModuleName);
    app.run(['$rootScope', '$ODS', '$common', '$ionicLoading', '$ionicPopup', '$sharedList', '$OrderAlert', '$ionicModal', '$window',
        function($rootScope, $ODS, $common, $ionicLoading, $ionicPopup, $sharedList, $OrderAlert, $ionicModal, $window) {
            $rootScope.dStatus = userStatus();
            if (JSON.parse(window.localStorage.getItem("driver"))) {
                _glob_shopperId = JSON.parse(window.localStorage.getItem("driver")).id;
                updateConnectionId();
            }
            if ($window.localStorage.getItem('shopperToken') == null) {
                window.location.href = 'page.html';
                //$window.localStorage.setItem('shopperToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiU2hvcHBlciIsInVuaXF1ZV9uYW1lIjoic2hvcHBlckB3ZWVsby5jb20uZWciLCJzdWIiOiJzaG9wcGVyQHdlZWxvLmNvbS5lZyIsImlzcyI6Imh0dHA6Ly8xOTIuMTY4LjEuMTAwIiwiYXVkIjoiYXVkaWVuY2UiLCJleHAiOjE1NDM0MDM3MDMsIm5iZiI6MTUxMTg2NzcwM30.Se_HCQb_fwjaWNjwH_f5Wo4ANKxWNLIR7XSPRM8cZTk')
            }

            $rootScope.$on('$routeChangeStart', function() {

            });
            $rootScope.$on('$routeChangeSuccess', function() {
                $('.ngview-loader').hide();
                $ODS.init();
            });
            $rootScope.$on('$routeChangeStart', function() {
                //  $.connection.hub.stop();
            });

            $rootScope.changeStatus = function() {
                if ($rootScope.dStatus == 'online') {
                    $rootScope.dStatus = 'offline';
                    changeStatus();
                } else {
                    $rootScope.modal.show();
                    $rootScope.dStatus = 'online';
                }
            };

            $ionicModal.fromTemplateUrl('views/budget.html', {
                scope: $rootScope
            }).then(function(modal) {
                $rootScope.modal = modal;
            });

            $rootScope.updateBudget = function(budget) {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                var url = $common.makeApiUrl('shopper', 'budget/update');
                var shopper = JSON.parse($window.localStorage.getItem("driver"));
                $common.post(url, { shopperId: shopper.id, currentBudget: budget }, {}).then(function(response) {
                    $ionicLoading.hide();

                    if (response.errorCode != 200) {
                        $rootScope.showAlert();
                    } else {
                        changeStatus();
                        $window.localStorage.setItem('driver', JSON.stringify(response.data));
                        $rootScope.modal.hide();
                        window.location.href = '#/';
                    }
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $rootScope.showAlert();
                });
            }

            function changeStatus() {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                var url = $common.makeApiUrl('shopper', 'status');
                $common.post(url, { shopperId: _glob_shopperId, status: toTitleCase($rootScope.dStatus) }, {}).then(function(response) {
                    if (response.data.status.toLowerCase() == 'online') {
                        window.location.href = '#/';
                        setStatus(true);
                    } else {
                        window.location.href = '#/dashboard';
                        setStatus(false);
                        $sharedList.clear();
                    }

                    $ionicLoading.hide();
                }).catch(function(e) {
                    $ionicLoading.hide();
                    showAlert();
                });
            }

            function updateConnectionId() {
                $.connection.hub.start().done(function() {
                    var url = $common.makeApiUrl('shopper', 'update/connectionId');
                    $common.post(url, { shopperId: _glob_shopperId, ConnectionId: $.connection.hub.id }, {}).then(function(response) {
                        console.log(response);
                    }).catch(function(e) {
                        showAlert();
                    });
                });
            }

            $.connection.notificationHub.client.updateCancelOrder = function(orderId) {
                removeOrderById(orderId);
            }
            $.connection.notificationHub.client.addNewMessageToPage = function(name, message) {
                $ionicPopup.alert({
                    title: name,
                    template: message
                });
            }

            function removeOrderById(orderId) {
                var orders = JSON.parse($window.localStorage.getItem("orders"));
                _.remove(orders, function(ord) {
                    return ord.id == orderId;
                });
                $window.localStorage.setItem("orders", JSON.stringify(orders));
            }

            function toTitleCase(str) {
                return str.replace('/\w\S*/g', function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            }

            function userStatus() {
                var status = localStorage.getItem("userStatus");
                if (status == null)
                    return 'offline';
                return status;
            };
            var setStatus = function(a) {
                if (!a)
                    localStorage.setItem("userStatus", 'offline')
                else
                    localStorage.setItem("userStatus", 'online')
            }
            var showAlert = function() {
                var alertPopup = $ionicPopup.alert({
                    title: 'Oops...',
                    template: 'Something went wrong. we\'re working on getting it fixed as soon as we can. '
                });
            }

            //var _push = new pushService();
            $.connection.notificationHub.client.shopperNewOrder = function(data) {

                if (data != null) {
                    $OrderAlert.Start();
                    var order = $sharedList.get(data.id);
                    if (!order) {
                        if (!$sharedList.isDriverBusy()) {
                            $OrderAlert.Start();
                            $sharedList.set(data);
                            $sharedList.setCurrOrderId(data.id);
                            $sharedList.setOrderLevel(0);
                            // if (!window.location.hash.includes('#/map')) {
                            window.location.href = '#/map/';

                            //  }
                        } else {
                            $sharedList.set(data);
                            $OrderAlert.StartVib();
                        }
                    }
                }


            };
            //_push.start();
        }
    ]);

})(angular, jQuery);