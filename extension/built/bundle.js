var FeedWriterData = (function () {
    function FeedWriterData() {
    }
    return FeedWriterData;
}());
var Config = (function () {
    function Config() {
    }
    Config.apiToken = "da2a9c2a-c344-4364-996d-937626060763";
    Config.apiTokenHeaderKey = "X-API-Token";
    Config.apiUrlPrefix = "https://mokum.place/";
    Config.initialServiceUrl = "https://mokum.place/api/v1/whoami.json";
    return Config;
}());
var Backup = (function () {
    function Backup() {
        var _this = this;
        this.entries = new Array();
        this.processProfileData = function (data, isSuccessful) {
            if (isSuccessful) {
                console.log(data);
                _this.userData = data.user;
                _this.reporter.report("Profile read: " + data.user.name, 'profile');
                _this.readFeedUrl(_this.buildAPIUrl(data.user.name + ".json"));
            }
        };
        this.processFeedData = function (data, isSuccessful) {
            if (isSuccessful) {
                console.log('pre - n' + data.entries.length);
                _this.normalizeData(data);
                console.log('post - n' + data.entries.length);
                _this.entries = _this.entries.concat(data.entries);
                console.log('concat' + _this.entries.length);
            }
            if (data.precise_older_entries_url == null) {
                _this.feedDataCompleted();
                return;
            }
            else {
                _this.reporter.report("Feed read " + data.entries.length + " entries added to stack", 'entries');
                _this.readFeedUrl(_this.buildAPIUrl(data.precise_older_entries_url));
            }
        };
        this.normalizeData = function (data) {
            data.entries.forEach(function (e) {
                e.comments.forEach(function (c) {
                    c.user = data.users[c.user_id];
                });
            });
        };
        this.feedDataCompleted = function () {
            _this.reporter.report("Feed data completed: total of " + _this.entries.length + " entries", 'complete');
            _this.writeEntries();
        };
        this.feedWritingComplete = function (result) {
            _this.reporter.report("Feed data writing complete", 'writer');
        };
    }
    Backup.prototype.setDataProvider = function (dataProvider) {
        this.dataProvider = dataProvider;
    };
    Backup.prototype.setReporter = function (reporter) {
        this.reporter = reporter;
    };
    Backup.prototype.setWriter = function (writer) {
        this.writer = writer;
    };
    Backup.prototype.readFeedUrl = function (url) {
        this.reporter.report("Starting to read: {url}...", 'feed');
        this.dataProvider.fetch(url, this.processFeedData);
    };
    Backup.prototype.buildAPIUrl = function (url) {
        return Config.apiUrlPrefix + url;
    };
    Backup.prototype.readInitialUrl = function () {
        this.dataProvider.fetch(Config.initialServiceUrl, this.processProfileData);
    };
    Backup.prototype.writeEntries = function () {
        this.reporter.report("Feed data is being written ...", 'writer');
        var data = new FeedWriterData();
        data.entries = this.entries;
        data.user = this.userData;
        this.writer.writeAll(data, this.feedWritingComplete);
    };
    return Backup;
}());
/// <reference path="references/jquery.d.ts" />
/// <reference path="backup.ts" />
/// <reference path="references/mustache.d.ts" />
/// <reference path="references/chrome-app.d.ts" />
var JQueryHttpDataProvider = (function () {
    function JQueryHttpDataProvider() {
    }
    JQueryHttpDataProvider.prototype.fetch = function (url, complete) {
        var keyName = "{Config.apiTokenHeaderKey}";
        var headers = {};
        headers[Config.apiTokenHeaderKey] = Config.apiToken;
        $.ajax({
            type: 'GET',
            url: url,
            crossDomain: true,
            dataType: 'json',
            headers: headers,
            complete: function (response, responseType) {
                var isSuccessful = responseType == 'success';
                complete(response.responseJSON, isSuccessful);
            }
        });
    };
    return JQueryHttpDataProvider;
}());
var ConsoleFeedWriter = (function () {
    function ConsoleFeedWriter() {
    }
    ConsoleFeedWriter.prototype.writeAll = function (data, complete) {
        //
    };
    return ConsoleFeedWriter;
}());
var HtmlFeedWriter = (function () {
    function HtmlFeedWriter() {
        var _this = this;
        this.getFilePath = function () {
            return "backup.html";
        };
        this.getHtml = function (data, complete) {
            $.get('template.html', function (template) {
                complete(Mustache.render(template, data));
            });
        };
        this.writeToFile = function (content, complete) {
            chrome.fileSystem.chooseEntry({ type: 'saveFile', suggestedName: 'mokum-backup.html' }, function (entry) {
                chrome.fileSystem.getWritableEntry(entry, function (writableEntry) {
                    var fileEntry = writableEntry;
                    var blob = new Blob(new Array(content));
                    fileEntry.createWriter(function (writer) {
                        writer.write(blob);
                        complete(true, null);
                    }, function (error) {
                        console.log(error);
                        complete(false, error);
                    });
                });
            });
        };
        this.writeAll = function (data, complete) {
            var f = _this;
            console.log("entry count: " + data.entries.length);
            _this.getHtml(data, function (result) {
                f.writeToFile(result, complete);
            });
        };
    }
    return HtmlFeedWriter;
}());
var HtmlBackupReporter = (function () {
    function HtmlBackupReporter() {
        this.elId = '#report-feed';
    }
    HtmlBackupReporter.prototype.report = function (message, reportType) {
        $(this.elId).append('<div class="info" />', message);
        $(this.elId).append('<div>&nbsp;</div>');
    };
    HtmlBackupReporter.prototype.error = function (message, errorType) {
        $(this.elId).append('<div class="error" />', message);
        $(this.elId).append('<div>&nbsp;</div>');
    };
    return HtmlBackupReporter;
}());
var BrowserBackupRunner = (function () {
    function BrowserBackupRunner() {
        this.backupInstance = new Backup();
        this.backupInstance.setDataProvider(new JQueryHttpDataProvider());
        this.backupInstance.setReporter(new HtmlBackupReporter());
        this.backupInstance.setWriter(new HtmlFeedWriter());
    }
    BrowserBackupRunner.prototype.start = function () {
        this.backupInstance.readInitialUrl();
    };
    return BrowserBackupRunner;
}());
//# sourceMappingURL=bundle.js.map