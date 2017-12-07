var serverState = {
    currentState: null,
    previousState: null
};
var connectionStateChanged = function(state) {
    var stateConversion = { 0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected' };
    serverState.previousState = stateConversion[state.oldState], serverState.currentState = stateConversion[state.newState];
    //console.log('Server state changed from: ' + serverState.previousState + ' to: ' + serverState.currentState);
}
var pushService = function() {
    // $.connection.hub.url = 'http://192.168.1.16:60/api/signalr';
    $.connection.hub.url = 'https://www.weelo.com.eg/api/signalr';
    var proxy = $.connection.notificationHub;
    $.connection.hub.qs = { 'version': '1.0' };
    $.connection.hub.stateChanged(connectionStateChanged);
    $.connection.hub.reconnecting(function() { _pushService.onReconnecting.call(this) });
    $.connection.hub.reconnected(function() { _pushService.onReconnected.call(this) });
    $.connection.hub.disconnected(function() { _pushService.onDisconnected.call(this) });
    $.connection.hub.connectionSlow(function() {
        console.log('We are currently experiencing difficulties with the connection.');
        _pushService.onSlowConnection.call(this);
    });
    if ($.connection.hub.lastError) {
        console.log("Disconnected. Reason: " + $.connection.hub.lastError.message);
        _pushService.onDisconnected.call(this)
    }
    //if ($.connection.hub.state === 4)
    // $.connection.hub.start().done(function () { _pushService.onConnected.call(this) });


    return {
        proxy: proxy,
        on: function(eventName, callback) {
            proxy.on(eventName, function(result) {
                if (callback) {
                    callback(result);
                }
            });
        },
        invoke: function(methodName, params, callback) {
            proxy.invoke(methodName, params).done(function(result) {
                if (callback) {
                    callback(result);
                }
            });
        },
        start: function() {
            setTimeout(function() {
                $.connection.hub.start().done(function() { _pushService.onConnected.call(this) });
            }, 1000);
        },
        stop: function() {
            $.connection.hub.stop();
        }
    };
};
var _pushService = {
    onConnected: function() {},
    onReconnecting: function() {},
    onReconnected: function() {},
    onReconnecting: function() {},
    onDisconnected: function() {},
    onSlowConnection: function() {},
    onError: function() {}
};