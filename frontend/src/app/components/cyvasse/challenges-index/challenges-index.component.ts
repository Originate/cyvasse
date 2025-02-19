import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { IChallenge } from "../../../shared/dtos/cyvasse/challenge";
import { Observable, of } from "rxjs";
import { ChallengeService } from "src/app/services/cyvasse/challenge.service";
import { AuthenticationService } from "src/app/services/authentication.service";
import { map } from "rxjs/operators";
import { doesHaveValue } from "src/app/shared/utilities/value_checker";
import { IUser } from "src/app/shared/dtos/authentication";
import { Router } from "@angular/router";
import { IGame } from "../../../shared/dtos/cyvasse/game";

@Component({
  selector: "app-challenges-index",
  templateUrl: "./challenges-index.component.html",
  styleUrls: ["./challenges-index.component.scss"],
})
export class ChallengesIndexComponent implements OnInit {
  loading: boolean;
  pageIndex: number;
  pageSize: number = 100;
  challengesDataSource = new MatTableDataSource<IChallenge>();
  total: number;
  displayedColumns: string[] = ["creatorId", "variantId", "actions"];
  userObservable: Observable<IUser | null> = of(null);
  userLoggedInObservable: Observable<boolean> = of(false);

  constructor(
    private readonly challengeService: ChallengeService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.challengeService
      .search({ pagination: { pageIndex: 0, pageSize: 100 } })
      .subscribe((result) => {
        this.loading = false;
        this.challengesDataSource.data = result.data;
        this.total = result.total;
      });
    this.userObservable = this.authenticationService.getUserSubject();
    this.userLoggedInObservable = this.authenticationService
      .getUserSubject()
      .pipe(map((x) => doesHaveValue(x)));
  }

  onAcceptChallenge(challenge: IChallenge): void {
    this.challengeService
      .accept(challenge.challengeId)
      .subscribe((game: IGame) => {
        this.router.navigate([`games/${game.gameId}`]);
      });
  }
}
