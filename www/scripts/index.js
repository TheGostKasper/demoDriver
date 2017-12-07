// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function() {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);
    // var url = 'http://192.168.1.16:60/api';
    var url = 'https://www.weelo.com.eg/api/';

    function onBackKeyDown(e) {
        navigator.Backbutton.goHome(function() {
            console.log('success')
        }, function() {
            console.log('fail')
        });
    }

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);
        document.addEventListener("online", onOnline.bind(this), false);
        document.addEventListener("backbutton", onBackKeyDown, false);

        var watchID;

        cordova.plugins.backgroundMode.setDefaults({ title: 'Weelo', text: 'Weelo Shopper' });
        cordova.plugins.backgroundMode.enable();
        cordova.plugins.backgroundMode.onactivate = function() {
                watchID = navigator.geolocation.watchPosition(onSuccess, onError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });

            }
            // if (window.plugin) {
            //     self.gMap = new window.plugin.google.maps.Map; //.getMap(div);
            // }
    };

    function onSuccess(position) {
        var data = { shopperId: _glob_shopperId, latitude: position.coords.latitude, longitude: position.coords.longitude };
        callAjax('shopper/coordinates', 'POST', data).then(function(response) {
            // cordova.plugins.backgroundMode.configure({
            //     text: 'Weelo Shopper' + ' ' + Date.now()
            // });
            //navigator.geolocation.clearWatch(watchID);
        }).catch(function(e) {
            // cordova.plugins.backgroundMode.configure({
            //     text: 'error updating location'
            // });
        });
    }

    function onError(error) {
        // watchID = navigator.geolocation.watchPosition(onSuccess, onError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: false });
        // cordova.plugins.backgroundMode.configure({
        //     text: error.message + ' ' + (i++)
        // });
    }


    function callAjax(endPoint, type, data) {
        return $.ajax({
            url: url + endPoint,
            type: type,
            data: data,
            headers: {
                'Authorization': 'Bearer ' + window.localStorage.getItem('shopperToken')
            },
            dataType: "json",
        });
    }

    function onOnline() {

    }

    function onResume() {
        // cordova.plugins.backgroundMode.configure({
        //     text: 'resume'
        // });
    }

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function loadMapsApi() {
        // if online and maps not already loaded
        //    then load maps api
    }
    //window.onload = function () {
    //    if (!window.device)
    //        onDeviceReady()
    //}
})();