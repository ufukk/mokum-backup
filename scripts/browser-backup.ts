/// <reference path="references/jquery.d.ts" />
/// <reference path="backup.ts" />
/// <reference path="references/mustache.d.ts" />
/// <reference path="references/chrome-app.d.ts" />

class JQueryHttpDataProvider implements HttpDataProvider {
	public fetch(url, complete: (data: any, isSuccessful: boolean) => void): void {
		let keyName = `{Config.apiTokenHeaderKey}`
		let headers: any = {};
		headers[Config.apiTokenHeaderKey] = Config.apiToken;
		$.ajax({
			type: 'GET',
			url: url,
			crossDomain: true,
			dataType: 'json',
			headers: headers,
			complete: function(response, responseType) {
				let isSuccessful = responseType == 'success';
				complete(response.responseJSON, isSuccessful);
			}
		});
	}
}

class ConsoleFeedWriter implements FeedWriter {
	public writeAll(data: FeedWriterData, complete: (result: any) => void): void {
		//
	}
}

class HtmlFeedWriter implements FeedWriter {
	
	private getFilePath = (): string => {
		return "backup.html";
	}

	private getHtml = (data: any, complete: (result: string) => void) => {
		$.get('template.html', function(template) {
			complete(Mustache.render(template, data));
		});
	}

	private writeToFile = (content: string, complete: (isSuccessful:boolean, result: any) => void) => {
		chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName: 'mokum-backup.html'}, function(entry: Entry) {
			chrome.fileSystem.getWritableEntry(entry, function(writableEntry: Entry) {
				var fileEntry:FileEntry = <FileEntry>writableEntry;
				var blob:Blob = new Blob(new Array(content));
				fileEntry.createWriter(function(writer:FileWriter) {
					writer.write(blob);
					complete(true, null);
				}, function(error:Error) {
					console.log(error);
					complete(false, error);
				});
			});
		});
	}

	public writeAll = (data: FeedWriterData, complete: (isSuccessful: boolean, result: any) => void) => {
		var f = this;
		console.log("entry count: " + data.entries.length);
		this.getHtml(data, function(result: string) {
			f.writeToFile(result, complete);
		});
	}
}

class HtmlBackupReporter implements BackupReporter {

	private elId = '#report-feed';

	public report(message: string, reportType: string): void {
		$(this.elId).append('<div class="info" />',message);
		$(this.elId).append('<div>&nbsp;</div>');
	}

	public error(message: string, errorType: string) {
		$(this.elId).append('<div class="error" />', message);
		$(this.elId).append('<div>&nbsp;</div>');
	}

}

class BrowserBackupRunner {

	private backupInstance: Backup;

	constructor() {
		this.backupInstance = new Backup();
		this.backupInstance.setDataProvider(new JQueryHttpDataProvider());
		this.backupInstance.setReporter(new HtmlBackupReporter());
		this.backupInstance.setWriter(new HtmlFeedWriter());
	}

	public start(): void {
		this.backupInstance.readInitialUrl();
	}

}