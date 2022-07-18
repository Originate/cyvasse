import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { AuthenticationService } from "src/app/services/authentication.service";
import { RummyGameService } from "src/app/services/rummy-game.service";
import { IUser } from "src/app/shared/dtos/authentication";
import {
  GameState,
  IGame,
  ISearchedGame,
} from "src/app/shared/dtos/rummy/game";
import { RummyNewGameDialogComponent } from "../rummy-new-game-dialog/rummy-new-game-dialog.component";

@Component({
  selector: "app-rummy-games-index",
  templateUrl: "./rummy-games-index.component.html",
  styleUrls: ["./rummy-games-index.component.scss"],
})
export class RummyGamesIndexComponent implements OnInit {
  loading: boolean;
  includeCompletedFormControl = new FormControl(false);
  gamesDataSource = new MatTableDataSource<ISearchedGame>();
  displayedColumns: string[] = ["hostUserId", "state", "created_at", "actions"];
  user: IUser | null;
  refreshSubscription: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private readonly gameService: RummyGameService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authenticationService
      .getUserSubject()
      .subscribe((x) => (this.user = x));
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.refreshGames();
    });
    this.includeCompletedFormControl.valueChanges.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.refreshGames();
    });
    this.refreshSubscription = timer(0, 5000).subscribe(() =>
      this.refreshGames()
    );
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription != null) {
      this.refreshSubscription.unsubscribe();
    }
  }

  refreshGames(): void {
    this.loading = true;
    this.gameService
      .search({
        filter: { includeCompleted: this.includeCompletedFormControl.value },
        pagination: {
          pageIndex: this.paginator.pageIndex,
          pageSize: this.paginator.pageSize,
        },
      })
      .subscribe((result) => {
        this.loading = false;
        this.gamesDataSource.data = result.data;
        this.paginator.length = result.total;
      });
  }

  create(): void {
    this.dialog
      .open(RummyNewGameDialogComponent, { data: { rematchForGameId: null } })
      .afterClosed()
      .subscribe((game: IGame) => {
        if (game != null) {
          this.navigateToGame(game.gameId);
        }
      });
  }

  join(gameId: number): void {
    this.gameService.join(gameId).subscribe(
      () => {
        this.navigateToGame(gameId);
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status === 422) {
          this.snackBar.open(errorResponse.error, undefined, {
            duration: 2500,
          });
        }
      }
    );
  }

  navigateToGame(gameId: number): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate([`rummy/games/${gameId}`]);
  }

  getHostUsername(game: ISearchedGame): string {
    const player = game.players.find((x) => x.userId === game.hostUserId);
    if (player == null) {
      throw new Error("Unable to find host");
    }
    return player.displayName;
  }

  getState(game: ISearchedGame): string {
    if (game.state === GameState.PLAYERS_JOINING) {
      return "Joinable";
    }
    if (game.state === GameState.COMPLETE) {
      return "Complete";
    }
    if (game.state === GameState.ABORTED) {
      return "Aborted";
    }
    return "Playing";
  }

  getCreatedTimestamp(game: ISearchedGame): number {
    return new Date(game.createdAt).valueOf();
  }

  canJoin(game: ISearchedGame): boolean {
    return (
      this.user != null &&
      game.state === GameState.PLAYERS_JOINING &&
      game.players.every((x) => x.userId !== this.user?.userId)
    );
  }

  couldJoinIfLoggedIn(game: ISearchedGame): boolean {
    return this.user == null && game.state === GameState.PLAYERS_JOINING;
  }

  isInGame(game: ISearchedGame): boolean {
    return (
      this.user != null &&
      game.players.some((x) => x.userId === this.user?.userId)
    );
  }
}
