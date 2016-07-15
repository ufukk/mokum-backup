/// <reference path="jquery.d.ts" />
/// <reference path="backup.ts" />

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
	public writeAll(data: any[], complete: (result: any) => void): void {
		//
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
		this.backupInstance.setWriter(new ConsoleFeedWriter());
	}

	public start(): void {
		this.backupInstance.readInitialUrl();
	}

}