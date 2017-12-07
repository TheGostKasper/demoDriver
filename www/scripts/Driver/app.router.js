(function(angular) {
    'use strict';
    var app = angular.module(appModuleName);
    app.config(['$routeProvider', '$controllerProvider', function($routeProvider, $controller) {
        $routeProvider
            .when("/", {
                controller: "DriverOrdersController",
                label: "orders",
                templateUrl: "views/Orders.html"
            })
            //.when("/", {
            //    controller: "DriverDashboardController", label: "dashbord", templateUrl: "views/Dashboard.html"
            //})
            .when("/profile", {
                controller: "DriverProfileController",
                label: "profile",
                templateUrl: "views/Profile.html"
            })
            .when("/map", {
                controller: "DriverMapController",
                label: "Map",
                templateUrl: "views/Map.html"
            })
            .when("/chat", {
                controller: "DriverChatController",
                label: "chat",
                templateUrl: "views/Chat.html"
            })
            .when("/earning", {
                controller: "DriverEarningController",
                label: "earning",
                templateUrl: "views/Earning.html"
            })
            .when("/", {
                controller: "DriverOrdersController",
                label: "orders",
                templateUrl: "views/Orders.html"
            })
            .when("/order_details", {
                controller: "DriverOrderDetailsController",
                label: "orderdetails",
                templateUrl: "views/OrderDetails.html"
            })
            .when("/history", {
                controller: "DriverHistoryController",
                label: "history",
                templateUrl: "views/History.html"
            })
            .when("/settings", {
                controller: "DriverSettingsController",
                label: "settings",
                templateUrl: "views/Settings.html"
            })
            .when("/login", {
                controller: "DriverLoginController",
                label: "Login",
                templateUrl: "views/login.html"
            })
            .otherwise({ redirectTo: '/' });

    }]);

    app.config(['$locationProvider', function($location) {
        // $location.html5Mode({ enabled: true, requireBase: false });
        $location.hashPrefix('');
    }]);
    app.config(['$compileProvider', function($compileProvider) {
        $compileProvider.debugInfoEnabled(false);
    }]);
})(angular);