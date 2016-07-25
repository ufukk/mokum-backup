

class FeedWriterData {
	entries: any;
	user: any;
}

interface HttpDataProvider {
	fetch(url: string, complete: (data: any, isSuccessful: boolean) => void): void;
}

interface BackupReporter {
	report(message: string, reportType: string);
	error(message: string, errorType: string);
}

interface FeedWriter {
	writeAll(data: FeedWriterData, complete: (result: any) => void): void;
}

class Config {
	static apiToken: string = "da2a9c2a-c344-4364-996d-937626060763";
	static apiTokenHeaderKey:string = "X-API-Token";
	static apiUrlPrefix = "https://mokum.place/";
	static initialServiceUrl = "https://mokum.place/api/v1/whoami.json";
}

class Backup {

	private entries: any[] = new Array<any>();

	private userData: any;

	private dataProvider:HttpDataProvider;

	private reporter: BackupReporter;

	private writer: FeedWriter;

	public constructor()
	{
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
			this.userData = data.user;
			this.reporter.report(`Profile read: ${data.user.name}`, 'profile');
			this.readFeedUrl(this.buildAPIUrl(`${data.user.name}.json`));
		}
	}

	public processFeedData = (data: any, isSuccessful: boolean) => {
		if(isSuccessful) {
			console.log('pre - n' +  data.entries.length);			
			this.normalizeData(data);
			console.log('post - n' +  data.entries.length);			
			this.entries = this.entries.concat(data.entries);
			console.log('concat' +  this.entries.length);			
		}
		if(data.precise_older_entries_url == null) {
			this.feedDataCompleted();
			return;
		} else {
			this.reporter.report(`Feed read ${data.entries.length} entries added to stack`, 'entries');
			this.readFeedUrl(this.buildAPIUrl(data.precise_older_entries_url));
		}
	}

	private normalizeData = (data: any): any => {
		data.entries.forEach(e => {
			e.comments.forEach(c => {
				c.user = data.users[c.user_id];
			});
		});
	}

	private feedDataCompleted = () => {
		this.reporter.report(`Feed data completed: total of ${this.entries.length} entries`, 'complete');
		this.writeEntries();
	}

	private writeEntries(): void {
		this.reporter.report(`Feed data is being written ...`, 'writer');
		var data:FeedWriterData = new FeedWriterData();
		data.entries = this.entries;
		data.user = this.userData;
		this.writer.writeAll(data, this.feedWritingComplete);
	}

	public feedWritingComplete = (result: any) => {
		this.reporter.report(`Feed data writing complete`, 'writer');
	}

}