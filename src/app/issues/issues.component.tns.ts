import { Component } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/combineLatest';

import { GithubService } from './../shared/github.service';
import { IssuesProcessor } from './../shared/issues-processor.service';
import { prompt } from 'ui/dialogs';

export interface Label {
    name: string;
    color: string;
}

export interface User {
    id: string;
    name: string;
    avatarUrl: string;
    avatarUrlThumb: string;
}
export interface Milestone {
    title: string;
}

export interface Issue {
    id: string;
    title: string;
    body: string;
    author: User;
    assignees: Array<User>;
    milestone?: Milestone;
    state: string;
    date: Date;
    dateClosed?: Date;
    count: number;
    created_at: string;
    labels: Array<Label>;
    assignee: string;
};

@Component({
    moduleId: module.id,
    selector: 'issues',
    templateUrl: './issues.template.html'
})
export class IssuesComponent {
    loading: boolean = true;
    filteredIssues$: Observable<Issue[]>;
  
    constructor(public githubService: GithubService, public issuesProcessor: IssuesProcessor) {
      const activeIssues = githubService
        .getGithubIssues({ pages: 2 })
        .map(data => this.issuesProcessor.process(data, 1).active);

      activeIssues.toPromise().then(() => this.loading = false);

      this.filteredIssues$ = Observable
        .combineLatest(activeIssues)
        .do(() => this.loading = true)
        .debounceTime(300)
        .do(() => this.loading = false)
        .map(([issues]) => {
          if (!issues) {
            return [];
          }

          return issues;
        });
    }
  }
