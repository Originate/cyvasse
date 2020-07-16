import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GameShowComponent } from "./game-show.component";
import { AppModule } from "src/app/app.module";

describe("GameShowComponent", () => {
  let component: GameShowComponent;
  let fixture: ComponentFixture<GameShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
