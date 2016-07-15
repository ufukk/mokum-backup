

interface HttpDataProvider {
	fetch(url: string, complete: (data: any, isSuccessful: boolean) => void): void;
}

interface BackupReporter {
	report(message: string, reportType: string);
	error(message: string, errorType: string);
}

interface FeedWriter {
	writeAll(data: any[], complete: (result: any) => void): void;
}

class Config {
	static apiToken: string = "da2a9c2a-c344-4364-996d-937626060763";
	static apiTokenHeaderKey:string = "X-API-Token";
	static apiUrlPrefix = "https://mokum.place/";
	static initialServiceUrl = "https://mokum.place/api/v1/whoami.json";
}

class Backup {

	private entries: any[];

	private dataProvider:HttpDataProvider;

	private reporter: BackupReporter;

	private writer: FeedWriter;

	public constructor()
	{
		this.entries = new Array<any>();
	}

	public setDataProvider(dataProvider:HttpDataProvider): void {
		this.dataProvider = dataProvider;
	}

	public setReporter(reporter: BackupReporter) {
		this.reporter = reporter;
	}

	public setWriter(writer: FeedWriter) {
		this.writer = writer;
	}

	public readFeedUrl(url:string): void {
		this.reporter.report(`Starting to read: {url}...`, 'feed');
		this.dataProvider.fetch(url, this.processFeedData);
	}

	private buildAPIUrl(url: string): string {
		return Config.apiUrlPrefix + url;
	}

	public readInitialUrl(): void {
		this.dataProvider.fetch(Config.initialServiceUrl, this.processProfileData);
	}

	public processProfileData = (data: any, isSuccessful: boolean) => {
		if(isSuccessful) {
			console.log(data);
			this.reporter.report(`Profile read: ${data.user.name}`, 'profile');
			this.readFeedUrl(this.buildAPIUrl(`${data.user.name}.json`));
		}
	}

	public processFeedData = (data: any, isSuccessful: boolean) => {
		if(isSuccessful) {
			this.entries.push(data.entries);
		}
		if(data.precise_older_entries_url == null) {
			this.feedDataCompleted();
			return;
		} else {
			this.reporter.report(`Feed read ${data.entries.length} entries added to stack`, 'entries');
			this.readFeedUrl(this.buildAPIUrl(data.precise_older_entries_url));
		}
	}

	private feedDataCompleted = () => {
		this.reporter.report(`Feed data completed: total of ${this.entries.length} entries`, 'complete');
	}

	private writeEntries(): void {
		this.reporter.report(`Feed data is being written ...`, 'writer');
		this.writer.writeAll(this.entries, this.feedWritingComplete);
	}

	public feedWritingComplete = (result: any) => {
		this.reporter.report(`Feed data writing complete`, 'writer');
	}

	public result(): void {
		alert('xxxx');
	}

}