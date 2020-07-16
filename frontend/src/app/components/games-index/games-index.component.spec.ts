import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GamesIndexComponent } from "./games-index.component";
import { AppModule } from "src/app/app.module";

describe("GamesIndexComponent", () => {
  let component: GamesIndexComponent;
  let fixture: ComponentFixture<GamesIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamesIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
