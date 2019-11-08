/* eslint-disable spaced-comment */

(function(window, document) {
    'use strict';

    var charts = window.charts || (window.charts = {});
    window._adalInstance = window._adalInstance || null;
    var list = [];
    var erroredList = [];
    var currentlyLoadingList = [];
    var chartLoadedHandler = null;
    var chartErrorHandler = null;
    var eventLogging = null;
    var PropertyName = {};
    var Events = {};
    var parent;

    function bootstrapCharts() {
        // This token will be replaced with the apropriate per environment settings
        // See the routes/embed.js for more information.
        charts.settings = {"urlArgs":"b=0.57w","charts":{"hostname":"https://charts.ms"},"boards":{"hostname":"https://boards.ms"},"authConfig":{"instance":"https://login.microsoftonline.com/","tenant":"microsoft.onmicrosoft.com","clientId":"1b058d44-1a48-47e2-be6c-f98cd41a6833","cacheLocation":"localStorage","apiEndpoint":"https://graph.microsoft.com"},"localAuth":{"host":"https://charts.ms","port":"3000"}};

        charts.loading = true;
        charts.onloadHandlers = [];
        var headTag = document.getElementsByTagName('head')[0];

        // add css classes to the page
        var styleTag = document.createElement('style');
        styleTag.innerHTML = extractFuncCommentString(function() {
            /*!
            .charts-panel {
                position: relative;
                overflow: hidden;
                height: 100%; width: 100%; clear: both;
            }
            .charts-panel:hover {
                overflow: visible;
            }
            .charts-debug { position: absolute; right: 0; z-index: 1000; display: none; background: #d4dfe8; }
            .chart-menu { position: absolute; right: 0; z-index: 1000; display: none; margin: 5px; }
            .charts-panel:hover .charts-menu {
                transform: translateY(0%);
            }
            .charts-menu:hover {
                background: #d4dfe8;
            }
            .charts-menu:hover .charts-menu-content {
                display: block;
            }
            .charts-menu {
                position: absolute;
                z-index: 999;
                transform: translateY(-100%);
                right: 0;
                background-color: #efefef;
                opacity: 0.85;
                color: #000;
                transition: all 0.1s linear;
            }
            .charts-menu-icon {
                text-align: right;
                font-family: Courier;
                font-size: 14px;
                padding: 0px 5px;
                float: right;
            }
            .charts-debug-header {
                padding: 5px 10px;
                text-align: left;
                font-size: 16px;
            }
            .charts-debug-body{
                padding: 5px 10px;
                margin-bottom: 10px;
            }
            .charts-debug-body a {
                padding: 5px 10px;
                color: #fff;
                margin-right: 10px;
                background: #286090;
            }
            .menubtn:after {
                content: '\2807';
                font-size: 20px;
                cursor: pointer;
            }
            .menubtn:hover, .menubtn:focus {
                background-color: inherit;
            }
            .chart-menu-content {
                display: none;
                position: absolute;
                background-color: #f1f1f1;
                min-width: 100px;
                overflow: auto;
                box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                right: 0;
                z-index: 3;
            }
            .chart-menu-content a {
                color: black;
                padding: 12px 16px;
                text-decoration: none;
                display: block;
            }
            .chart-menu a:hover {
                text-decoration: underline;
                background: #e5e5e5;
            }
            .show {
                z-index: 999;
            }

            .charts-exportcsv{
                position: absolute;
                right: 0;
                background-image: url("./images/download_SVG.svg");
                background-repeat: no-repeat;
                height: 25px;
                width: 25px;
                z-index: 1000;
            }
            .charts-surface {
                height: 100%; width: 100%; clear: both;
            }

            .charts-error {
                padding: 10px 20px;
                width: 100%;
                height: 100%;
                background: #fff;
            }

            .charts-loader {
                min-height: 100px;
                height: inherit;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .charts-cssload-whirlpool,
            .charts-cssload-whirlpool::before,
            .charts-cssload-whirlpool::after {
	            position: absolute;
	            top: 50%;
	            left: 50%;
	            border: 1px solid rgb(204,204,204);
	            border-left-color: rgb(0,0,0);
	            border-radius: 699px;
            }

            .charts-cssload-whirlpool {
	            margin: -17px 0 0 -17px;
	            height: 35px;
	            width: 35px;
	            animation: charts-cssload-rotate 950ms linear infinite;
            }

            .charts-cssload-whirlpool::before {
	            content: "";
	            margin: -16px 0 0 -16px;
	            height: 31px;
	            width: 31px;
	            animation: charts-cssload-rotate 950ms linear infinite;
            }

            .charts-cssload-whirlpool::after {
	            content: "";
	            margin: -20px 0 0 -20px;
	            height: 39px;
	            width: 39px;
	            animation: charts-cssload-rotate 1900ms linear infinite;
            }

            .copy-link {
                white-space: nowrap;
            }

            @keyframes charts-cssload-rotate {
	            100% {
		            transform: rotate(360deg);
	            }
            }
         */
            // this statement causes the AST node in uglify compressor to not be discarded
            // and hence comment is not lost during minification process
            return !false;
        });
        headTag.appendChild(styleTag);

        // load up requirejs if it hasn't been loaded yet
        if (typeof requirejs === 'undefined') {
            var requireJsTag = document.createElement('script');
            requireJsTag.type = 'text/javascript';
            requireJsTag.src = charts.settings.charts.hostname + '/embed/lib/require-2.1.16.js';
            requireJsTag.onload = onRequireJsLoaded;
            headTag.appendChild(requireJsTag);
        }
        else {
            // requirejs was already loaded, configure it
            onRequireJsLoaded();
        }
    }

    function onRequireJsLoaded() {
        // requirejs has been loaded, configure it now
        requirejs.config({
            urlArgs: charts.settings.urlArgs,
            waitSeconds: 20,
            baseUrl: charts.settings.charts.hostname + '/embed/',
            map: {
                // '*' means all modules will get 'jquery-private'
                // for their 'jquery' dependency.
                '*': { 'jquery': 'jquery-private' },

                // 'jquery-private' wants the real jQuery module
                // though. If this line was not here, there would
                // be an unresolvable cyclic dependency.
                'jquery-private': { 'jquery': 'jquery' }
            },
            paths: {
                jquery: 'lib/jquery-2.1.3',
                d3: 'lib/d3-3.5.5',
                highcharts: 'lib/highcharts-plotline',
                highcharts4: 'lib/highcharts-4.2.5',
                highcharts5: 'lib/highcharts-5.0.10',
                highchartsMore: 'lib/highcharts-more-4.2.5',
                highchartsFunnel: 'lib/highcharts-funnel',
                underscore: 'lib/underscore-1.8.2',
                motion: 'lib/motion',
                datatables: 'lib/jquery.dataTables-1.10.5',
                highmaps: 'lib/highcharts-maps-4.2.5',
                highmapsWorld: 'lib/highmaps-world',
                jqueryui: 'lib/jquery-ui',
                wordcloud2: 'lib/wordcloud2',
                jscookie: 'lib/js.cookie',
                semantic: 'lib/semantic-dropdown',
                adal: '../scripts/lib/adal',
                ariainsights: '../scripts/lib/aria-webjs-sdk-1.8.3',
                eventLogging: 'eventLogging',
            },
            shim: {
                'highcharts': {
                    // This is a plotline fix for Highcharts that must be loaded after the library
                    deps: ['highcharts4']
                },
                'highcharts4': {
                    exports: 'Highcharts',
                    // These script dependencies should be loaded before loading highcharts
                    deps: ['jquery']
                },
                'highcharts5': {
                    exports: 'Highcharts5',
                    // These script dependencies should be loaded before loading highcharts
                    deps: ['jquery']
                },
                'highchartsMore': {
                    deps: ['highcharts']
                },
                'highchartsFunnel': {
                    deps: ['highcharts5']
                },
                'motion': {
                    deps: ['highcharts']
                },
                'highmaps': {
                    deps: ['highcharts']
                },
                'highmapsWorld': {
                    deps: ['highmaps']
                },
                'datatables': {
                    deps: ['jquery'],
                    exports: 'datatables'
                },
                'jqueryui': {
                    deps: ['jquery']
                },
                'semantic': {
                    deps: ['jquery']
                },
                'adal': {
                    exports: 'AuthenticationContext'
                },
                'ariainsights': {
                    exports: 'ariainsights'
                },
                'eventLogging': {
                    exports: 'ChartEventLogging'
                }
            }
        });

        checkAuthentication();
    }

    function propagateErrors(err) {
        document.querySelectorAll('.charts-surface').forEach(function(element) {
            element.innerHTML = err;
        });
    }

    function getUserToken() {
        return new Promise(function(resolve, reject) {
            var isCallback = window._adalInstance.isCallback(window.location.hash);
            window._adalInstance.handleWindowCallback();
            if (isCallback) {
                var loginError = window._adalInstance.getLoginError();
                if (loginError) {
                    reject(loginError);
                }
                window.location = window._adalInstance._getItem(window._adalInstance.CONSTANTS.STORAGE.LOGIN_REQUEST);
            }
            var cachedUser = window._adalInstance.getCachedUser();
            if (!cachedUser) { // if there's no user cached then force a login
                return window._adalInstance.login();
            }
            charts.user = cachedUser.userName;
            var access_token = window._adalInstance.getCachedToken(window.charts.settings.authConfig.apiEndpoint);
            if (!access_token) {
                return window._adalInstance.acquireToken(window.charts.settings.authConfig.apiEndpoint, function(err, access_token) {
                    if (err) {
                        window._adalInstance.acquireTokenRedirect(window.charts.settings.authConfig.apiEndpoint);
                    }
                    else {
                        resolve('Bearer ' + access_token);
                    }
                });
            }
            else {
                resolve('Bearer ' + access_token);
            }
        });
    }

    // todo: bring auth config from appconfig.json on the server...somehow
    function checkAuthentication() {
        if (!window.charts.getUserToken) {
            require(['adal'], function(AuthenticationContext) {
                if (!window._adalInstance) {
                    var config = { redirectUri: window.location.origin, postLogoutRedirectUri: window.location.origin };
                    window._adalInstance = new AuthenticationContext(Object.assign(config, window.charts.settings.authConfig));
                }
                // token from getUserToken() isn't being used here but we need to handle adal login
                // and cache token before calling onChartsBootstrapped
                getUserToken().then(function() {
                    onChartsBootstrapped();
                }).catch(function(err) {
                    propagateErrors(err);
                });
                // attach getUserToken method to global charts object
                window.charts.getUserToken = getUserToken;
            }, function(err) {
                console.error(err);
                // TODO: displayError for '401 not authorized' on all charts surfaces on page (how to find?) rather than redirecting
                propagateErrors(err);
            });
        }
        else {
            onChartsBootstrapped();
        }
    }

    function onChartsBootstrapped() {
        // fire all queued up chart loads
        for (var i = 0; i < charts.onloadHandlers.length; i++) {
            charts.onloadHandlers[i]();
        }
        // clean up onloadhandlers. It's possible for embed.js to be loaded onto a page multiple times within iframes, etc...
        // make sure that onloadHandlers are only called once.
        charts.onloadHandlers = [];
        charts.loading = false;
    }

    // Orignally: https://gist.github.com/lavoiesl/5880516
    // Modified for charts use
    function extractFuncCommentString(func) {
        var matches = func.toString().match(/function\s*\(\)\s*\{\s*\/\*\!?\s*([\s\S]+?)\s*\*\/\s*/);
        if (!matches) return false;

        return matches[1];
    }

    function exportToPNG(selector) {
        var chart = list[selector];

        if (chart != null && typeof chart != 'undefined') {
            var querystring = '';
            for (var i = 0; i < chart.customVariables.length; i++) {
                querystring += chart.customVariables[i].name + '=' + chart.customVariables[i].defaultValue + '&';
            }
            var chartsUrl = charts.settings.charts.hostname + '/view/' + chart.id + '?' + querystring;
            var url = 'http://mvr/urlrender/render?delay=5000&url=' + encodeURIComponent(chartsUrl);
            window.open(url, '_blank');
        }
    }

    function exportToCSV(selector) {
        var chart = list[selector];
        var fileName = '';

        if (chart != null && typeof chart != 'undefined') {
            var csvString = ConvertToCSV(chart);

            var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

            if (chart.options.title != null && typeof chart.options.title != 'undefined') {
                var div = document.createElement('div');
                div.innerHTML = chart.options.title;
                var title = div.textContent || div.innerText || chart.id;
                fileName = title;
            }
            else {
                fileName = chart.id;
            }

            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(blob, fileName + '.csv');
            }
            else {
                var link = document.createElement('a');
                if (link.download !== undefined) {
                    var url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', fileName + '.csv');
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        }
    }
    // Linking to a specific part of a page can easly be achived by #targetname.
    // Unfortunately, angular routing is using # so that using #targetname will confuse the routing insted we used this workaround.
    function copyURLToClipboard(selector) {
        var textArea = document.createElement('textarea');
        // Place in top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;

        // Ensure it has a small width and height
        textArea.style.width = '1px';
        textArea.style.height = '1px';

        // Reducing the size if it does flash render.
        textArea.style.padding = 0;

        // Clean up any borders.
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';

        // Avoid flash of white box if rendered for any reason.
        textArea.style.background = 'transparent';

        // Set or replace selector on the url
        if (location.href.indexOf('?') >= 0 &&
            location.href.split('?')[1].indexOf('selector') >= 0) {
            var prevSelector = getSelectorFromUrl();
            textArea.value = location.href.replace(prevSelector, selector.split('#')[1]);
        }
        else {
            if (location.href.indexOf('?') >= 0) {
                textArea.value = location.href + '&selector=' + selector.split('#')[1];
            }
            else {
                textArea.value = location.href + '?selector=' + selector.split('#')[1];
            }
        }

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            fireChartSharedEvent(textArea);
        }
        catch (err) {
            console.log('Oops, Unable to copy: ' + err);
        }

        document.body.removeChild(textArea);
    }

    function compareSelector(selector) {
        var queries;

        queries = parseQueryString(location.href);
        // A selector ("#cg1553105772961 .charts-surface") contains class name.
        if (queries.selector == selector.split(' ')[0] || queries.selector == selector.split(' ')[0].split('#')[1])
            return true;
        else
            return false;
    }

    function getSelectorFromUrl() {
        var queries;

        queries = parseQueryString(location.href);
        return queries.selector;
    }

    function parseQueryString(url) {
        var params = {}, queryString, queries, temp, i, l;

        // split the url in to two;
        queryString = url.split('?');
        if (queryString.length > 1) {
            // Split into key/value pairs
            queries = queryString[1].split('&');
            // Convert the array of strings into an object
            for ( i = 0, l = queries.length; i < l; i++ ) {
                temp = queries[i].split('=');
                params[temp[0]] = temp[1];
            }
        }
        return params;
    }

    function fireChartSharedEvent(element) {
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent('HTMLEvents');
            event.initEvent('chart-shared', true, true);
            event.eventName = 'chart-shared';
            element.dispatchEvent(event);
        }
        else {
            event = document.createEventObject();
            event.eventType = 'chart-shared';
            event.eventName = 'chart-shared';
            element.fireEvent('on' + event.eventType, event);
        }
    }

    function ConvertToCSV(chartObject) {
        var arrData = chartObject.rows;
        var exportableCols = chartObject.exportableColumns();
        var CSV = '';
        var row = '';
        // all the columns are hidden. return empty string
        if (exportableCols.length < 1)
            return row;
        // This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            // check if index is present in explorable cols
            if (exportableCols.indexOf(index) > -1)
            // Now convert each value to string and comma-seprated
                row += index + ',';
        }
        row = row.slice(0, -1);

        // append Label row with line break
        CSV += row + '\r\n';

        for (var i = 0; i < arrData.length; i++) {
            var row = '';
            // 2nd loop will extract each column and convert it in string comma-seprated
            for (var index in arrData[i]) {
                // only extract data from exportable columns
                if (exportableCols.indexOf(index) > -1) {
                    var div = document.createElement('div');
                    div.innerHTML = arrData[i][index];
                    var text = div.textContent || div.innerText || '';
                    row += '"' + text + '",';
                }
            }
            row = row.slice(0, row.length - 1);

            // add a line break after each row
            CSV += row + '\r\n';
        }

        return CSV;
    }

    function setupContainer(selector, chartId, variables) {
        var el = document.querySelector(selector);
        var params = '?';
        if (variables) {
            variables = Object(variables);
            params += Object.keys(variables).map(function(k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(variables[k]);
            }).join('&');
        }

        var selectorName = 'Selector';
        if (window.chartEventLogging) {
            selectorName = window.chartEventLogging.PropertyName.SELECTOR;
        }
        var edit = charts.settings.charts.hostname + '/#/edit/' + chartId;
        var detail = charts.settings.charts.hostname + '/#/details/' + chartId + params;
        var html =
            '<div class="charts-panel">' +
                // '<div class="charts-menu">' +
                //    '<div class="charts-menu-icon">i</div>' +
                //    '<div class="charts-menu-content">' +
                //    '</div>' +
                // '</div>' +
                '<div class="charts-debug">' +
                    '<div class="charts-debug-header">Chart Id: ' + chartId + '</div>' +
                    '<div class="charts-debug-body">' +
                        '<a href="' + edit + '" target="_blank" onClick="charts.trackEvent(\'Edit\',' + chartId + ',{\'' + selectorName + '\' : \'' + selector + '\',\'Source\' : \'charts-debug\'})">Edit</a>' +
                        '<a href="' + detail + '" target="_blank" onClick="charts.trackEvent(\'Details\',' + chartId + ',{\'' + selectorName + '\' : \'' + selector + '\',\'Source\' : \'charts-debug\'})">Details</a>' +
                        '<a href="javascript:charts.exportToCSV(\'' + selector + '\');" onClick="charts.trackEvent(\'export_to_csv\',' + chartId + ',{\'' + selectorName + '\' : \'' + selector + '\',\'Source\' : \'charts-debug\'})">CSV</a>' +
                        '<a class="copy-link" href="javascript:charts.copyURLToClipboard(\'' + selector + '\');" onClick="charts.trackEvent(\'Copy Link\',' + chartId + ',{\'' + selectorName + '\' : \'' + selector + '\',\'Source\' : \'charts-debug\'})">Copy Link</a>' +
                    // '<a href="javascript:charts.exportToPNG(\'' + selector + '\');">PNG</a>' +
                    '</div>' +
                '</div>' +
                // '<a href="javascript:charts.exportToCSV(\'' + selector + '\');"><div class="charts-exportcsv">  </div></a>' +
                '<div class="chart-menu">' +
                '<div class="menubtn" onclick="charts.chartMenuBtn(\'' + selector + '\',' + chartId + ')"></div>' +
                '<div class="chart-menu-content">' +
                    '<a href="' + edit + '" target="_blank" onClick="charts.chartMenuOption(\'' + selector + '\',\'Edit\',' + chartId + ',{\'' + selectorName + '\' : \'' + selector + '\',\'Source\' : \'chart-menu\'})">Edit</a>' +
                    '<a href="' + detail + '" target="_blank" onClick="charts.chartMenuOption(\'' + selector + '\',\'Details\',' + chartId + ',{\'' + selectorName + '\' : \'' + selector + '\',\'Source\' : \'chart-menu\'})">Details</a>' +
                    '<a href="javascript:charts.exportToCSV(\'' + selector + '\');" onClick="charts.chartMenuOption(\'' + selector + '\',\'export_to_csv\',' + chartId + ',{\'' + selectorName + '\' : \'' + selector + '\',\'Source\' : \'chart-menu\'})">CSV</a>' +
                    '<a class="copy-link" href="javascript:charts.copyURLToClipboard(\'' + selector + '\');" onClick="charts.chartMenuOption(\'' + selector + '\',\'Copy Link\',' + chartId + ',{\'' + selectorName + '\' : \'' + selector + '\',\'Source\' : \'chart-menu\'})">Copy Link</a>' +
                    '</div>' +
                '</div>' +
                '<div class="charts-surface"></div>' +
            '</div>';

        if (el) {
            el.innerHTML = html;
        }
        else {
            console.log('charts: setupContainer: error: selector element not found');
        }
    }

    // Show or hide menu content for specific chart
    function chartMenuBtn(selector, chartId) {
        var extraProperties = {};
        extraProperties[PropertyName.SELECTOR] = selector;
        trackEvent(Events.INTERACTIVE_MENU_CLICK, chartId, extraProperties);
        var el = document.querySelector(selector);
        // Increase stack order to make the chart menu's content in front of another chart if it is covered
        el.getElementsByClassName('chart-menu-content')[0].classList.toggle('show');
    }

    // When chart menu option is clicked the original z-index (parentZindex) will be set back to the parent div.
    function chartMenuOption(selector, event, chartId, extraProperties) {
        trackEvent(event, chartId, extraProperties);
    }
    // Close all chart menus if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.menubtn')) {
            var menus = document.getElementsByClassName('chart-menu-content');
            var i;
            for (i = 0; i < menus.length; i++) {
                var openMenu = menus[i];
                if (openMenu.classList.contains('show')) {
                    openMenu.classList.remove('show');
                }
            }
        }
    };

    function trackEvent(event, chartId, extraProperties) {
        window.chartEventLogging && window.chartEventLogging.trackEvent(event,
            charts.user,
            window.chartEventLogging.ChartsObjects.CHART, chartId, extraProperties);
    }

    function displayLoader(selector) {
        var el = document.querySelector(selector);

        var loaderHtml =
            '<div class="charts-loader">' +
                '<div class="charts-cssload-whirlpool"></div>' +
            '</div>';

        if (el) {
            el.innerHTML = loaderHtml;
        }
        else {
            console.log('charts: displayLoader: error: selector element not found');
        }
    }

    function displayError(selector, err) {
        var errorString = '';
        if (typeof err === 'string') {
            errorString = err;
        }
        else {
            errorString = err.message;
            console.log(err.stack);
        }

        var el = document.querySelector(selector);
        var errorHtml =
            '<div class="charts-error">' +
                '<h4>Oops, we could not load this chart...</h4>' +
                errorString +
            '</div>';

        if (el) {
            el.innerHTML = errorHtml;
        }
        else {
            console.log('charts: displayError: error: selector element not found, inner error: ' + errorString);
        }
    }

    function initialize(cb) {
        // if charts lib is being bootstrapped then queue up the cb otherwise fire it right away
        if (charts.loading) {
            charts.onloadHandlers.push(cb);
        }
        else {
            cb();
        }
    }

    function getSurface(selector) {
        return selector + ' .charts-surface';
    }

    function updateChartOptions(chart, cols, rows) {
        var optionsObj = chart.options;
        if (cols) {
            var dimensionString = JSON.stringify(chart.dimensions);
            if (dimensionString.match(/\@@([a-z0-9]+)/gi)) {
                dimensionString = dimensionString.replace(/\@@([a-z0-9]+)/gi, function(match, v) {
                    for (var i = 0; i < cols.length; i++) {
                        if (cols[i].name.toLowerCase() === v.toLowerCase()) {
                            return rows.length > 0 ? rows[0][cols[i].name] : '';
                        }
                    }
                });
            }
            chart.dimensions = JSON.parse(dimensionString);
            var keys = Object.keys(optionsObj);
            for (var i = 0; i < keys.length; i++) {
                var value = optionsObj[keys[i]];
                if (typeof value === 'string' || value instanceof String) {
                    var newString = '';
                    if (value.match(/\@@([a-z0-9]+)/gi)) {
                        newString = value.replace(/\@@([a-z0-9]+)/gi, function(match, v) {
                            for (var i = 0; i < cols.length; i++) {
                                if (cols[i].name.toLowerCase() === v.toLowerCase()) {
                                    return rows.length > 0 ? rows[0][cols[i].name] : '';
                                }
                            }
                        });
                        chart.options[keys[i]] = newString;
                    }
                }
            }
        }
    }

    function updateChart(selector, chartId, variables, loadedCallback) {
        if (list[selector]) {
            var chart = list[selector];
            var customVariables = chart.customVariables;
            var keys = Object.keys(variables);
            for (var i = 0; i < keys.length; i++) {
                var customVariableUpdated = false;
                for (var j = 0; j < customVariables.length; j++) {
                    if (customVariables[j].name == keys[i]) {
                        customVariables[j].defaultValue = variables[keys[i]];
                        customVariableUpdated = true;
                    }
                }
                if (!customVariableUpdated) {
                    customVariables.push({ name: keys[i], defaultValue: variables[keys[i]] });
                }
            }
            customVariables = JSON.stringify(customVariables);

            loadChart(selector, chartId, customVariables, null, loadedCallback);
        }
    }

    function loadChart(selector, chartId, variables, hostname, loadedCallback) {
        if (hostname) {
            charts.settings.charts.hostname = hostname;
        }

        setupContainer(selector, chartId, variables);

        var surface = getSurface(selector);

        displayLoader(surface);

        var customVariables = variables;
        // convert to json if variables is passed in as an object
        if (typeof variables !== 'string') {
            customVariables = [];
            var keys = Object.keys(variables);
            for (var i = 0; i < keys.length; i++) {
                customVariables.push({ name: keys[i], defaultValue: variables[keys[i]] });
            }
            customVariables = JSON.stringify(customVariables);
        }

        // if the chart is already loading, cancel previous load
        if (currentlyLoadingList[selector]) {
            var xhr = currentlyLoadingList[selector];
            currentlyLoadingList[selector] = null;
            xhr.abort();
        }

        initialize(function() {
            require(['jquery'], function($j) {
                var el = document.querySelector(selector);
                if (compareSelector(selector)) {
                    $j('html, body').animate({
                        scrollTop: $j(selector).offset().top
                    }, 'slow');
                }

                require(['eventLogging'], function(ChartEventLogging) {
                    window.chartEventLogging = new ChartEventLogging();
                    PropertyName = window.chartEventLogging.PropertyName;
                    Events = window.chartEventLogging.Events;
                }, function(err) {
                    console.log(err);
                });

                var startTime = 0;
                $j(el).off('hover');
                $j(el).hover(function(e) {
                    var extraProperties = {};
                    startTime = new Date();
                    extraProperties[PropertyName.START_TIME] = startTime;
                    extraProperties[PropertyName.SELECTOR] = selector;
                    if (e.shiftKey) {
                        $j(el).find('.charts-debug').toggle();
                        $j(el).find('.charts-exportcsv').toggle();
                        e.stopPropagation();
                        trackEvent(Events.SHIFTKEY_MOUSEENTER, chartId, extraProperties);
                    }
                    else {
                        $j(el).find('.chart-menu').toggle();
                        trackEvent(Events.MOUSEENTER, chartId, extraProperties);
                    }
                }, function(e) {
                    var extraProperties = {};
                    var endTime = new Date();
                    extraProperties[PropertyName.START_TIME] = startTime.toLocaleString();
                    extraProperties[PropertyName.END_TIME] = endTime.toLocaleString();
                    extraProperties[PropertyName.TIME_SPENT_IN_MS] = endTime - startTime;
                    extraProperties[PropertyName.SELECTOR] = selector;
                    if (e.shiftKey) {
                        $j(el).find('.charts-debug').toggle();
                        $j(el).find('.charts-exportcsv').toggle();
                        e.stopPropagation();
                        trackEvent(Events.SHIFTKEY_MOUSELEAVE, chartId, extraProperties);
                    }
                    else {
                        $j(el).find('.chart-menu').toggle();
                        // Close all chart menus content if the user leave chart
                        if (el.getElementsByClassName('chart-menu-content').length > 0 && el.getElementsByClassName('chart-menu-content')[0].classList.contains('show')) {
                            el.getElementsByClassName('chart-menu-content')[0].classList.remove('show');
                        }
                        trackEvent(Events.MOUSELEAVE, chartId, extraProperties);
                    }
                });
                var chartLoadStartTime = new Date();
                var chartLoadProperties = {};
                chartLoadProperties[PropertyName.START_TIME] = chartLoadStartTime;
                window.charts.getUserToken().then(function(access_token) {
                    var headers = {
                        authorization: access_token
                    };
                    // jquery is now loaded, we can make ajax call to get more data about this chart
                    var xhr = $j.ajax(charts.settings.charts.hostname + '/embed/data/' + chartId, {
                        type: 'GET',
                        dataType: 'json',
                        cache: false,
                        headers: access_token ? headers : {},
                        data: { v: customVariables },
                        success: function(data) {
                            currentlyLoadingList[selector] = null;
                            $j(document).ready(function() {
                                // load the type of chart that needs to be rendered
                                require([data.chartModule], function(charts) {
                                    // initialize the requested chart type and render it
                                    try {
                                        var chart = new charts(data.options, data.dimensions, data.data);
                                        // TODO: refactor this
                                        chart.id = chartId;
                                        chart.customVariables = JSON.parse(customVariables);
                                        chart.variables = variables;
                                        // refactor end
                                        list[selector] = chart;

                                        if (!document.querySelector(surface)) {
                                            setupContainer(selector, chartId, chart.customVariables);
                                        }

                                        updateChartOptions(chart, data.data.cols, data.data.rows);

                                        chart.render(surface);
                                        var chartLoadEndTime = new Date();
                                        chartLoadProperties[PropertyName.START_TIME] = chartLoadStartTime.toLocaleString();
                                        chartLoadProperties[PropertyName.END_TIME] = chartLoadEndTime.toLocaleString();
                                        chartLoadProperties[PropertyName.TIME_SPENT_IN_MS] = chartLoadEndTime - chartLoadStartTime;
                                        chartLoadProperties[PropertyName.SUCCESS] = true;
                                        trackEvent(Events.CHART_LOAD, chartId, chartLoadProperties);

                                        // Either undefind (not set, mostly for existing charts) or false for this value means do not show the interactive menu dots
                                        if (!data.options.interactiveMenu) {
                                            $j(el).find('.chart-menu').remove();
                                        }

                                        if (chartLoadedHandler) {
                                            chartLoadedHandler(selector);
                                        }
                                        else if (loadedCallback) {
                                            loadedCallback(selector);
                                        }
                                    }
                                    catch (err) {
                                        console.log(err);
                                        erroredList[selector] = {
                                            err: err,
                                            chartId: chartId,
                                            variables: variables
                                        };
                                        displayError(surface, err);
                                        if (chartErrorHandler) {
                                            chartErrorHandler(selector, chartId, variables, err);
                                        }
                                    }
                                });
                            });
                        },
                        error: function(jqXhr, textStatus, errorThrown) {
                            if (currentlyLoadingList[selector] === null) {
                                // request was aborted by user
                                return;
                            }

                            var errorText = '';
                            if (jqXhr.responseText) {
                                try {
                                    var serverError = JSON.parse(jqXhr.responseText);
                                    if (serverError.code) {
                                        errorText = 'Error: <br/>' + serverError.code + ': ';
                                    }
                                    if (serverError.message) {
                                        errorText += serverError.message;
                                    }
                                }
                                catch (err) {
                                    errorText = textStatus + ': ' + errorThrown;
                                }
                            }

                            erroredList[selector] = {
                                err: errorText,
                                chartId: chartId,
                                variables: variables
                            };

                            displayError(surface,
                                'Unable to load chart data at this time. <br />' +
                                errorText
                            );
                            var chartLoadEndTime = new Date();
                            chartLoadProperties[PropertyName.START_TIME] = chartLoadStartTime.toLocaleString();
                            chartLoadProperties[PropertyName.END_TIME] = chartLoadEndTime.toLocaleString();
                            chartLoadProperties[PropertyName.TIME_SPENT_IN_MS] = chartLoadEndTime - chartLoadStartTime;
                            chartLoadProperties[PropertyName.SUCCESS] = false;
                            trackEvent(Events.CHART_LOAD, chartId, chartLoadProperties);

                            if (chartErrorHandler) {
                                chartErrorHandler(selector, chartId, variables, errorText);
                            }
                        }
                    });
                    currentlyLoadingList[selector] = xhr;
                });
            });
        });
    }

    function get(selector) {
        return list[selector];
    }

    function invalidateChart(selector) {
        list[selector] = null;
        if (currentlyLoadingList[selector]) {
            var xhr = currentlyLoadingList[selector];
            currentlyLoadingList[selector] = null;
            xhr.abort();
        }
    }

    function onChartLoaded(callback) {
        chartLoadedHandler = callback;
        // fire callback for charts that have already been loaded
        for (var key in list) {
            if (list.hasOwnProperty(key)) {
                callback(key);
            }
        }
    }

    function onChartError(callback) {
        chartErrorHandler = callback;
        // fire callback for charts that have already errored
        for (var key in erroredList) {
            if (erroredList.hasOwnProperty(key)) {
                var errorObj = erroredList[key];
                callback(key, errorObj.chartId, errorObj.variables, errorObj.err);
            }
        }
    }

    function destroy() {
        for (var key in list) {
            if (list.hasOwnProperty(key)) {
                list[key].unload();
            }
        }

        list = [];
        for (var key in currentlyLoadingList) {
            if (currentlyLoadingList.hasOwnProperty(key)) {
                if (currentlyLoadingList[key]) {
                    var xhr = currentlyLoadingList[key];
                    currentlyLoadingList[key] = null;
                    xhr.abort();
                }
            }
        }
        currentlyLoadingList = [];
        console.log('charts destroy');
        chartLoadedHandler = null;
    }

    if (typeof charts.loading === 'undefined') {
        // charts library hasn't been loaded on this page ever before
        // kick off the bootstrap process
        bootstrapCharts();
    }
    else {
        // some other instance of embed.js has already kicked off the bootstrap process or the bootstrap process is complete
    }

    // populate public apis in charts, if they haven't already been populated
    if (!charts.loadChart) {
        charts.loadChart = loadChart;
        charts.updateChart = updateChart;
        charts.destroy = destroy;
        charts.get = get;
        charts.invalidateChart = invalidateChart;
        charts.onChartLoaded = onChartLoaded;
        charts.onChartError = onChartError;
        charts.exportToCSV = exportToCSV;
        charts.exportToPNG = exportToPNG;
        charts.trackEvent = trackEvent;
        charts.copyURLToClipboard = copyURLToClipboard;
        charts.chartMenuBtn = chartMenuBtn;
        charts.chartMenuOption = chartMenuOption;
    }
})(window, document);
charts.loadChart('#48', '48', '[]');
