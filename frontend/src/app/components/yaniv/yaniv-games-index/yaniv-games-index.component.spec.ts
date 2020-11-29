import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { AppModule } from "src/app/app.module";
import { YanivGameService } from "src/app/services/yaniv/yaniv-game.service";
import { YanivGamesIndexComponent } from "./yaniv-games-index.component";

describe("YanivGamesIndexComponent", () => {
  let component: YanivGamesIndexComponent;
  let fixture: ComponentFixture<YanivGamesIndexComponent>;
  let mockGameService: Partial<YanivGameService>;

  beforeEach(async () => {
    mockGameService = {
      search: () => of({ data: [], total: 0 }),
    };
    await TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: YanivGameService, useValue: mockGameService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YanivGamesIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
