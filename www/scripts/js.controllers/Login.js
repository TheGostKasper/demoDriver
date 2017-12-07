(function(angular) {
    'use strict';
    angular.module('driverApp').controller('DriverLoginController', ["$scope", "$common", "$http", "$ionicLoading", "$ionicPopup", "$window",
        function($scope, $common, $http, $ionicLoading, $ionicPopup, $window) {

            $scope.data = {
                username: 'nyrywedop@gmail.com',
                password: '123456'
            }

            if ($window.localStorage.getItem('shopperToken')) window.location.href = '#/';

            $scope.login = function(model) {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                getToken(model).then(function(response) {
                    if (response)
                        $window.localStorage.setItem('shopperToken', response.data.access_token);

                    var url = $common.makeApiUrl('shopper', 'Login');
                    model.email = model.username;
                    $common.post(url, model, {}).then(function(response) {
                        $ionicLoading.hide();
                        if (response.errorCode != 200) {
                            $scope.showAlert();
                        } else {
                            $window.localStorage.setItem('driver', JSON.stringify(response.data))
                            window.location.href = '#/';
                        }
                    }).catch(function(e) {
                        $ionicLoading.hide();
                        $scope.showAlert();
                    })
                }, function() {
                    $ionicLoading.hide();
                    $scope.showAlert();
                });

            }

            function getToken(model) {
                var _body = "username=" + model.username + "&password=" + model.password + "&grant_type=password"
                var req = {
                    method: 'POST',
                    // url: 'http://192.168.1.16:60/api/token',
                    url: 'https://www.weelo.com.eg/api/token',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    data: _body.toString()
                }
                return $http(req);
            }

            $scope.showAlert = function() {
                var alertPopup = $ionicPopup.alert({
                    title: 'Oops...',
                    template: 'Email or password is uncorrect ! '
                });
            };
        }
    ]);
})(angular);