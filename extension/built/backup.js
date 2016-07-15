var Config = (function () {
    function Config() {
    }
    Config.apiToken = "da2a9c2a-c344-4364-996d-937626060763";
    Config.apiTokenHeaderKey = "X-API-Token";
    Config.apiUrlPrefix = "https://mokum.place";
    Config.initialServiceUrl = "https://mokum.place/api/v1/whoami.json";
    return Config;
}());
var Backup = (function () {
    function Backup() {
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
    Backup.prototype.processProfileData = function (data, isSuccessful) {
        if (isSuccessful) {
            this.reporter.report("Profile read: {data.user.name}", 'profile');
            this.readFeedUrl(this.buildAPIUrl("{data.user.name}.json"));
        }
    };
    Backup.prototype.processFeedData = function (data, isSuccessful) {
        if (isSuccessful) {
            this.entries.push(data.entries);
        }
        if (data.precise_older_entries_url == null) {
            this.feedDataCompleted();
            return;
        }
        else {
            this.reporter.report("Feed read {data.entries.length} entries added to stack", 'entries');
            this.readFeedUrl(this.buildAPIUrl(data.precise_older_entries_url));
        }
    };
    Backup.prototype.feedDataCompleted = function () {
        this.reporter.report("Feed data completed: total of {this.entries.length} entries", 'complete');
    };
    Backup.prototype.writeEntries = function () {
        this.reporter.report("Feed data is being written ...", 'writer');
        this.writer.writeAll(this.entries, this.feedWritingComplete);
    };
    Backup.prototype.feedWritingComplete = function (result) {
        this.reporter.report("Feed data writing complete", 'writer');
    };
    Backup.prototype.result = function () {
        alert('xxxx');
    };
    return Backup;
}());
//# sourceMappingURL=backup.js.map