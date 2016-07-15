/// <reference path="jquery.d.ts" />
/// <reference path="backup.ts" />
var JQueryHttpDataProvider = (function () {
    function JQueryHttpDataProvider() {
    }
    JQueryHttpDataProvider.prototype.fetch = function (url, complete) {
        var keyName = "{Config.apiTokenHeaderKey}";
        var headers = { keyName: Config.apiToken };
        $.ajax({
            type: 'GET',
            url: url,
            headers: headers,
            complete: function (response, responseType) {
                var isSuccessful = responseType == 'success';
                complete(response, isSuccessful);
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
        this.backupInstance.setWriter(new ConsoleFeedWriter());
    }
    BrowserBackupRunner.prototype.start = function () {
        this.backupInstance.readInitialUrl();
    };
    return BrowserBackupRunner;
}());
//# sourceMappingURL=browser-backup.js.map