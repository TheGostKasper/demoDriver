(function(angular) {
    'use strict';
    angular.module('driverApp').controller('DriverMapController', ["$scope", "$common", "$http", "$OrderAlert", '$ionicActionSheet',
        '$ionicSideMenuDelegate', '$sharedList', "$ionicLoading", "$ionicPopup", "$ionicModal", "$ionicScrollDelegate",
        function($scope, $common, $http, $OrderAlert, $ionicActionSheet, $ionicSideMenuDelegate, $sharedList, $ionicLoading, $ionicPopup,
            $ionicModal, $ionicScrollDelegate) {
            var driverMarker, orderInfo, lastList, lastLoc;
            $scope.ordersList = [];
            var car = "M17.402,0H5.643C2.526,0,0,3.467,0,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644 V6.584C23.044,3.467,20.518,0,17.402,0z M22.057,14.188v11.665l-2.729,0.351v-4.806L22.057,14.188z M20.625,10.773 c-1.016,3.9-2.219,8.51-2.219,8.51H4.638l-2.222-8.51C2.417,10.773,11.3,7.755,20.625,10.773z M3.748,21.713v4.492l-2.73-0.349 V14.502L3.748,21.713z M1.018,37.938V27.579l2.73,0.343v8.196L1.018,37.938z M2.575,40.882l2.218-3.336h13.771l2.219,3.336H2.575z M19.328,35.805v-7.872l2.729-0.355v10.048L19.328,35.805z";
            var map;
            var directionDisplay;
            var directionsService;
            var stepDisplay;
            var markerArray = [];
            var position;
            var marker = null;
            var polyline = null;
            var poly2 = null;
            var speed = 0.000005,
                wait = 1;
            var infowindow = null;
            var timerHandle = null;
            var directionsDisplay;
            var startLocation;
            var endLocation;
            var icon;
            $scope.ordermodal;
            $scope.isTempList = false;
            // $sharedList.clear();

            function InitializeMap(lat, lng) {
                var mapCanvas = document.getElementById('map'),
                    myLatLng = { lat: lat, lng: lng };
                var mapOptions = {
                    center: myLatLng,
                    zoom: 13,
                    disableDefaultUI: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                directionsService = new google.maps.DirectionsService();

                $scope.map = new google.maps.Map(mapCanvas, mapOptions);

                icon = {
                    path: car,
                    scale: .7,
                    strokeColor: 'white',
                    strokeWeight: .10,
                    fillOpacity: 1,
                    fillColor: '#404040',
                    offset: '5%',
                    // rotation: parseInt(heading[i]),
                    anchor: new google.maps.Point(10, 25) // orig 10,50 back of car, 10,0 front of car, 10,25 center of car
                };

                driverMarker = new google.maps.Marker({
                    map: $scope.map,
                    draggable: false,
                    icon: icon,
                    position: myLatLng,
                    zIndex: Math.round(myLatLng.lat * -100000) << 5
                });

                var rendererOptions = {
                    map: $scope.map,
                };
                directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

                polyline = new google.maps.Polyline({
                    path: [],
                    strokeColor: '#FF0000',
                    strokeWeight: 3
                });
                poly2 = new google.maps.Polyline({
                    path: [],
                    strokeColor: '#FF0000',
                    strokeWeight: 3
                });
            };

            var getUserLocation = function(callback) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(callback);
                } else {
                    x.innerHTML = "Geolocation is not supported by this browser.";
                }
            }
            $scope.acceptOrder = function() {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                $OrderAlert.Stop();
                circle.stop();
                //calcRoute(orderInfo.merchantCoords.latitude + "," + orderInfo.merchantCoords.longitude);
                var url = $common.makeApiUrl('shopper', 'order/accept');
                $common.post(url, { orderId: orderInfo.id }).then(function(response) {
                    $ionicLoading.hide();
                    if (response.data != null) {
                        $scope.OrderAccepted();
                        orderInfo.state = response.data.state;
                        $sharedList.update($sharedList.getCurrOrderId(), orderInfo);
                        var locationD = window.localStorage.getItem("driverLocation");

                        $scope.orderNavigation = "https://www.google.com/maps/dir/" + $sharedList.getDriverLocation().lat + "," + $sharedList.getDriverLocation().lng + "/" + orderInfo.merchantCoords.latitude + "," + orderInfo.merchantCoords.longitude + "";
                    }
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert(e);
                });
            };
            $scope.OrderAccepted = function() {
                $sharedList.setDriverOn();
                $sharedList.setOrderLevel(1);
                $scope.showMapAlert = false;
                $scope.isAccepted = true;
                if (!$scope.$$phase) $scope.$apply();
            };
            $scope.cancelOrder = function() {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                var url = $common.makeApiUrl('shopper', 'order/cancel');
                $common.post(url, { OrderId: orderInfo.id, ShopperId: _glob_shopperId, cancellingReason: '' }).then(function(response) {
                    $scope.showMapAlert = false;
                    $ionicLoading.hide();
                    $OrderAlert.Stop();
                    circle.stop();
                    $scope.showMapAlertbtns = false;
                    $sharedList.del($sharedList.getCurrOrderId());
                    window.location.href = "#/"
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert(e);
                });
            };

            $scope.pickingOrder = function() {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                var url = $common.makeApiUrl('shopper', 'order/picking');
                $common.post(url, { OrderId: orderInfo.id }).then(function(response) {
                    $ionicLoading.hide();
                    orderInfo.state = response.data.state;
                    $sharedList.update($sharedList.getCurrOrderId(), orderInfo);
                    $scope.OrderPicked();
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert(JSON.stringify(e));
                });
            };
            $scope.readyOrder = function() {
                debugger;
                if ($scope.isPicked) {
                    $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                    var url = $common.makeApiUrl('shopper', 'order/ready');
                    $common.post(url, { OrderId: orderInfo.id }).then(function(response) {
                        $ionicLoading.hide();
                        orderInfo.state = response.data.state;
                        $sharedList.update($sharedList.getCurrOrderId(), orderInfo);
                        $scope.OrderReady();
                        $scope.orderNavigation = "https://www.google.com/maps/dir/" + orderInfo.merchantCoords.latitude + "," + orderInfo.merchantCoords.longitude + "/" + orderInfo.customer.coords.latitude + "," + orderInfo.customer.coords.longitude + "";
                    }).catch(function(e) {
                        $ionicLoading.hide();
                        $scope.showAlert(e);
                    });
                }
            };
            $scope.dropOffOrder = function() {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                var url = $common.makeApiUrl('shopper', 'order/delivered');
                $common.post(url, { OrderId: orderInfo.id }).then(function(response) {
                    $scope.showMapAlertbtns = false;
                    $ionicLoading.hide();
                    $scope.OrderCompleted();
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert(e);
                });
            };
            $scope.OrderPicked = function() {
                //debugger;
                $sharedList.setOrderLevel(2);
                $scope.isPicking = true;
                $scope.isTempList = true;
                //$scope.ordermodal.show();
            };

            $scope.OrderReady = function() {
                $sharedList.setOrderLevel(3);
                $scope.isReady = true;
                $scope.isPicked = true;
                $scope.isTempList = false;
                //calcRoute(orderInfo.customer.coords.latitude + "," + orderInfo.customer.coords.longitude);
            };
            $scope.OrderCompleted = function() {
                $scope.isAccepted = false;
                $scope.isPicking = false;
                $scope.isPicked = false;
                $scope.isReady = false;
                $scope.isReady = false;
                $scope.isDelivered = true;
                $scope.ordersList = [];
                //InitializeMap($sharedList.getDriverLocation().lat, $sharedList.getDriverLocation().lng);
                $sharedList.del($sharedList.getCurrOrderId());
                if (!$scope.$$phase) $scope.$apply();
            };

            $scope.showMenu = function() {
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        { text: 'Call' },
                        { text: 'Send Message' }
                    ],
                    //destructiveText: 'Delete',
                    titleText: 'Help Menu',
                    cancelText: 'Cancel',
                    cancel: function() {
                        // add cancel code..
                    },
                    buttonClicked: function(index) {
                        if (index == 0) {
                            window.location.href = 'tel:' + orderInfo.customer.mobile + '';
                        }
                        if (index == 1) {
                            window.location.href = 'sms:' + orderInfo.customer.mobile + '';
                        }

                        return true;
                    }
                });
            };

            var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            $('#map-p').css('height', h - 100);
            var element = document.getElementById('map-loader');
            var circle = new ProgressBar.Circle('#map-loader', {
                color: '#e5e5e5',
                strokeWidth: 5,
                trailWidth: 1,
                duration: 10000,
                text: {
                    value: '0'
                },
                step: function(state, bar) {
                    $('.progressbar-text').text((bar.value() * 10).toFixed(0));
                }
            });

            //$sharedList.clear();
            var init = function() {
                // debugger;
                if (navigator.geolocation) {
                    var x = true;
                } else {
                    var x = false;
                }
                navigator.geolocation.getCurrentPosition(function(data) {

                    if (orderInfo != null && !$scope.isPicked) {
                        $scope.orderNavigation = "https://www.google.com/maps/dir/" + $sharedList.getDriverLocation().lat + "," + $sharedList.getDriverLocation().lng + "/" + orderInfo.merchantCoords.latitude + "," + orderInfo.merchantCoords.longitude + "";
                        //  calcRoute(orderInfo.merchantCoords.latitude + ',' + orderInfo.merchantCoords.longitude);
                    } else if (orderInfo != null && $scope.isPicked) {
                        $scope.orderNavigation = "https://www.google.com/maps/dir/" + $sharedList.getDriverLocation().lat + "," + $sharedList.getDriverLocation().lng + "/" + orderInfo.customer.coords.latitude + "," + orderInfo.customer.coords.longitude + "";
                        // calcRoute(orderInfo.customer.coords.latitude + "," + orderInfo.customer.coords.longitude);
                    }

                    $sharedList.setDriverLocation(data.coords.latitude, data.coords.longitude);

                    //loadOrder();

                });
            };
            $scope.$on('$viewContentLoaded', function() {
                loadOrder();
                if ($sharedList.getDriverLocation() != null) {
                    // InitializeMap($sharedList.getDriverLocation().lat, $sharedList.getDriverLocation().lng);

                }
            });

            $scope.getProducts = function(id, callback) {
                $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                var url = $common.makeApiUrl('shopper', 'order/products');
                $common.post(url, { OrderId: id }).then(function(response) {
                    $ionicLoading.hide();
                    var order = $sharedList.get(id);
                    order.products = response.data;
                    $sharedList.update(id, order);
                    orderInfo = order;
                    callback();
                }).catch(function(e) {
                    $ionicLoading.hide();
                    $scope.showAlert();
                });
            }

            //$sharedList.clear()
            var loadOrder = function() {
                orderInfo = $sharedList.get($sharedList.getCurrOrderId());
                if (orderInfo.products == null) {
                    $scope.getProducts(orderInfo.id, function() {
                        afterLoadProducts();

                    });
                } else {
                    afterLoadProducts();
                }

            }

            function afterLoadProducts() {
                if (orderInfo != null) {
                    if ($sharedList.getOrderLevel() == '0') {
                        $scope.showMapAlert = true;
                        $scope.showMapAlertbtns = true;
                        $sharedList.setOrderLevel(0);
                        circle.animate(1);
                        $scope.ordersList = [];
                        if (!$scope.$$phase) $scope.$apply();
                    } else if ($sharedList.getOrderLevel() == '1') {
                        $scope.showMapAlertbtns = true;
                        $scope.OrderAccepted();
                    } else if ($sharedList.getOrderLevel() == '2') {
                        $scope.showMapAlertbtns = true;
                        $scope.OrderAccepted();
                        $scope.OrderPicked();
                    } else if ($sharedList.getOrderLevel() == '3') {
                        $scope.showMapAlertbtns = true;
                        $scope.OrderAccepted();
                        $scope.OrderPicked();
                        $scope.OrderReady();
                    }



                    var c = 0;
                    for (var i = 0; i < orderInfo.products.length; i++) {
                        if (orderInfo.products[i].state.toLowerCase() != 'pending') {
                            c++;
                            if (c == orderInfo.products.length) {
                                $scope.isPicked = true;
                            }
                        }

                    }
                }
                if (orderInfo != null) {
                    $scope.ordersList.push(orderInfo);

                }
            }
            $scope.productAction = function(action, state, orderId, productId, orderItemId) {
                if (state != '0') {
                    $ionicLoading.show({ template: '<ion-spinner icon="android"></ion-spinner>' });
                    var url = $common.makeApiUrl('v1', 'product/state');
                    var data = { OrderId: orderId, ProductId: productId, ProductState: state, OrderItemId: orderItemId };
                    $common.put(url, data).then(function(response) {
                        if (response.data != null) {
                            orderInfo = $sharedList.get($sharedList.getCurrOrderId());
                            orderInfo.total = response.data.total;
                            orderInfo.grandTotal = response.data.grandTotal;
                            orderInfo.products = response.data.products;
                            $scope.ordersList[0] = orderInfo;
                            $sharedList.update($sharedList.getCurrOrderId(), orderInfo);
                            var c = 0;
                            for (var i = 0; i < orderInfo.products.length; i++) {
                                if (orderInfo.products[i].state.toLowerCase() != 'pending') {
                                    c++;
                                    if (c == orderInfo.products.length) {
                                        $scope.isPicked = true;
                                    }
                                }
                            }
                        }
                        $ionicLoading.hide();
                    }).catch(function(e) {
                        $ionicLoading.hide();
                        $scope.showAlert(e);
                    });
                }

            };
            $scope.getListHeight = function() {

            }
            $scope.$on('$destroy', function() {
                //functionCaller.stop(checkOrder);
                //functionCaller.stop(checkLocation);
            });
            $scope.showAlert = function(e) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Oops...',
                    template: e //'Something went wrong. we\'re working on getting it fixed as soon as we can. '
                });
                circle.stop();
                // $scope.showMapAlertbtns = false;
                // $scope.showMapAlert = false;
                $OrderAlert.Stop();
            };


            function onSuccess(position) {
                var data = { shopperId: _glob_shopperId, latitude: position.coords.latitude, longitude: position.coords.longitude };
                var url = $common.makeApiUrl('shopper', 'coordinates');
                $sharedList.setDriverLocation(position.coords.latitude, position.coords.longitude);
                // DriverOnMap($sharedList.getDriverLocation());
                $common.post(url, data).then(function(response) {
                    $scope.userInfo = response.data;

                    if (orderInfo != null && !$scope.isPicked) {
                        $scope.orderNavigation = "https://www.google.com/maps/dir/" + $sharedList.getDriverLocation().lat + "," + $sharedList.getDriverLocation().lng + "/" + orderInfo.merchantCoords.latitude + "," + orderInfo.merchantCoords.longitude + "";
                        //  calcRoute(orderInfo.merchantCoords.latitude + ',' + orderInfo.merchantCoords.longitude);
                    } else if (orderInfo != null && $scope.isPicked) {
                        $scope.orderNavigation = "https://www.google.com/maps/dir/" + $sharedList.getDriverLocation().lat + "," + $sharedList.getDriverLocation().lng + "/" + orderInfo.customer.coords.latitude + "," + orderInfo.customer.coords.longitude + "";
                        // calcRoute(orderInfo.customer.coords.latitude + "," + orderInfo.customer.coords.longitude);
                    }
                }).catch(function(e) {
                    //$scope.showAlert(JSON.stringify(e));
                });
            }

            function onError(error) {
                //alert('code: ' + error.code + '\n' +
                //      'message: ' + error.message + '\n');
            }
            var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });

            var DriverOnMap = function(myLatLng) {
                //$scope.map.setCenter(myLatLng)
                // driverMarker.setPosition(myLatLng);
            }
            init();

            function calcRoute(_end) {
                if (timerHandle) {
                    clearTimeout(timerHandle);
                }
                //if (driverMarker) {
                //    driverMarker.setMap(null);
                //}
                polyline.setMap(null);
                poly2.setMap(null);
                directionsDisplay.setMap(null);
                polyline = new google.maps.Polyline({
                    path: [],
                    strokeColor: '#FF0000',
                    strokeWeight: 3
                });
                poly2 = new google.maps.Polyline({
                    path: [],
                    strokeColor: '#FF0000',
                    strokeWeight: 3
                });
                // Create a renderer for directions and bind it to the map.
                var rendererOptions = {
                    map: $scope.map,
                };
                directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

                var start = $sharedList.getDriverLocation().lat + ',' + $sharedList.getDriverLocation().lng;
                var end = _end;
                var travelMode = google.maps.DirectionsTravelMode.DRIVING;

                var request = {
                    origin: start,
                    destination: end,
                    travelMode: travelMode
                };

                // Route the directions and pass the response to a
                // function to create markers for each step.
                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);

                        var bounds = new google.maps.LatLngBounds();
                        var route = response.routes[0];
                        startLocation = new Object();
                        endLocation = new Object();

                        // For each route, display summary information.
                        var path = response.routes[0].overview_path;
                        var legs = response.routes[0].legs;
                        for (var i = 0; i < legs.length; i++) {
                            if (i === 0) {
                                startLocation.latlng = legs[i].start_location;
                                startLocation.address = legs[i].start_address;
                                //   marker = createMarker(legs[i].start_location, "start", legs[i].start_address, "green");
                            }
                            endLocation.latlng = legs[i].end_location;
                            endLocation.address = legs[i].end_address;
                            var steps = legs[i].steps;
                            for (var j = 0; j < steps.length; j++) {
                                var nextSegment = steps[j].path;
                                for (var k = 0; k < nextSegment.length; k++) {
                                    polyline.getPath().push(nextSegment[k]);
                                    bounds.extend(nextSegment[k]);
                                }
                            }
                        }
                        polyline.setMap(map);
                        $scope.map.fitBounds(bounds);
                        $scope.map.setZoom(18);
                        //startAnimation();
                    }
                });
            }

            // $ionicModal.fromTemplateUrl('views/orderlist.html', {
            //     scope: $scope
            // }).then(function(modal) {

            //     if ($scope.isPicking && !$scope.isReady) {
            //         modal.show();
            //         $scope.orderModal = modal;
            //     }
            // });
            // $scope.goback = function() {
            //     window.location.href = '/#';

            //     $scope.orderModal.hide();
            // }
            $scope.goHome = function() {
                window.location.href = '/#';
            }

            /*******************************************************************/

            var step = 50; // 5; // metres
            var tick = 100; // milliseconds
            var eol;
            var k = 0;
            var stepnum = 0;
            var speed = "";
            var lastVertex = 1;


            //=============== animation functions ======================
            function updatePoly(d) {
                // Spawn a new polyline every 20 vertices, because updating a 100-vertex poly is too slow
                if (poly2.getPath().getLength() > 20) {
                    poly2 = new google.maps.Polyline([polyline.getPath().getAt(lastVertex - 1)]);
                    // map.addOverlay(poly2)
                }

                if (polyline.GetIndexAtDistance(d) < lastVertex + 2) {
                    if (poly2.getPath().getLength() > 1) {
                        poly2.getPath().removeAt(poly2.getPath().getLength() - 1);
                    }
                    poly2.getPath().insertAt(poly2.getPath().getLength(), polyline.GetPointAtDistance(d));
                } else {
                    poly2.getPath().insertAt(poly2.getPath().getLength(), endLocation.latlng);
                }
            }

            function animate(d) {
                if (d > eol) {
                    $scope.map.panTo(endLocation.latlng);
                    driverMarker.setPosition(endLocation.latlng);
                    return;
                }
                var p = polyline.GetPointAtDistance(d);
                $scope.map.panTo(p);
                var lastPosn = driverMarker.getPosition();
                driverMarker.setPosition(p);
                var heading = google.maps.geometry.spherical.computeHeading(lastPosn, p);
                icon.rotation = heading;
                driverMarker.setIcon(icon);
                updatePoly(d);
                timerHandle = setTimeout(function() { animate(d + step) }, tick);
            }

            function startAnimation() {
                eol = polyline.Distance();
                $scope.map.setCenter(polyline.getPath().getAt(0));
                driverMarker = new google.maps.Marker({
                    position: polyline.getPath().getAt(0),
                    map: $scope.map,
                    icon: icon
                });

                poly2 = new google.maps.Polyline({
                    path: [polyline.getPath().getAt(0)],
                    strokeColor: "#0000FF",
                    strokeWeight: 10
                });
                // map.addOverlay(poly2);
                setTimeout(function() { animate(50) }, 2000); // Allow time for the initial map display
            }

            /*  window.onload = function () {
                 
                  google.maps.LatLng.prototype.distanceFrom = function (newLatLng) {
                      var EarthRadiusMeters = 6378137.0; // meters
                      var lat1 = this.lat();
                      var lon1 = this.lng();
                      var lat2 = newLatLng.lat();
                      var lon2 = newLatLng.lng();
                      var dLat = (lat2 - lat1) * Math.PI / 180;
                      var dLon = (lon2 - lon1) * Math.PI / 180;
                      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                      var d = EarthRadiusMeters * c;
                      return d;
                  }

                  google.maps.LatLng.prototype.latRadians = function () {
                      return this.lat() * Math.PI / 180;
                  }

                  google.maps.LatLng.prototype.lngRadians = function () {
                      return this.lng() * Math.PI / 180;
                  }

                  // === A method which returns the length of a path in metres ===
                  google.maps.Polygon.prototype.Distance = function () {
                      var dist = 0;
                      for (var i = 1; i < this.getPath().getLength() ; i++) {
                          dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
                      }
                      return dist;
                  }

                  // === A method which returns a GLatLng of a point a given distance along the path ===
                  // === Returns null if the path is shorter than the specified distance ===
                  google.maps.Polygon.prototype.GetPointAtDistance = function (metres) {
                      // some awkward special cases
                      if (metres == 0) return this.getPath().getAt(0);
                      if (metres < 0) return null;
                      if (this.getPath().getLength() < 2) return null;
                      var dist = 0;
                      var olddist = 0;
                      for (var i = 1;
                      (i < this.getPath().getLength() && dist < metres) ; i++) {
                          olddist = dist;
                          dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
                      }
                      if (dist < metres) {
                          return null;
                      }
                      var p1 = this.getPath().getAt(i - 2);
                      var p2 = this.getPath().getAt(i - 1);
                      var m = (metres - olddist) / (dist - olddist);
                      return new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m);
                  }

                  // === A method which returns an array of GLatLngs of points a given interval along the path ===
                  google.maps.Polygon.prototype.GetPointsAtDistance = function (metres) {
                      var next = metres;
                      var points = [];
                      // some awkward special cases
                      if (metres <= 0) return points;
                      var dist = 0;
                      var olddist = 0;
                      for (var i = 1;
                      (i < this.getPath().getLength()) ; i++) {
                          olddist = dist;
                          dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
                          while (dist > next) {
                              var p1 = this.getPath().getAt(i - 1);
                              var p2 = this.getPath().getAt(i);
                              var m = (next - olddist) / (dist - olddist);
                              points.push(new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m));
                              next += metres;
                          }
                      }
                      return points;
                  }

                  // === A method which returns the Vertex number at a given distance along the path ===
                  // === Returns null if the path is shorter than the specified distance ===
                  google.maps.Polygon.prototype.GetIndexAtDistance = function (metres) {
                      // some awkward special cases
                      if (metres == 0) return this.getPath().getAt(0);
                      if (metres < 0) return null;
                      var dist = 0;
                      var olddist = 0;
                      for (var i = 1;
                      (i < this.getPath().getLength() && dist < metres) ; i++) {
                          olddist = dist;
                          dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i - 1));
                      }
                      if (dist < metres) {
                          return null;
                      }
                      return i;
                  }
                  // === Copy all the above functions to GPolyline ===
                  google.maps.Polyline.prototype.Distance = google.maps.Polygon.prototype.Distance;
                  google.maps.Polyline.prototype.GetPointAtDistance = google.maps.Polygon.prototype.GetPointAtDistance;
                  google.maps.Polyline.prototype.GetPointsAtDistance = google.maps.Polygon.prototype.GetPointsAtDistance;
                  google.maps.Polyline.prototype.GetIndexAtDistance = google.maps.Polygon.prototype.GetIndexAtDistance;


              };*/

            // var ModalInstanceCtrl = function($scope, $modalInstance) {

            //     $scope.ok = function() {
            //         $modalInstance.close();
            //     };

            //     $scope.cancel = function() {
            //         $modalInstance.dismiss('cancel');
            //     };
            // };


        }


    ]);
})(angular);