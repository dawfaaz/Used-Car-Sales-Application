import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Car } from "../../models/car.model";
import { CarService } from "../../services/car.service";

@Component({
  selector: "app-car-details",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./car-details.component.html",
  styleUrl: "./car-details.component.css",
})
export class CarDetailsComponent implements OnInit {
  private readonly indianPriceFormatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  });

  car?: Car;
  errorMessage = "";

  constructor(
    private readonly route: ActivatedRoute,
    private readonly carService: CarService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const carId = Number(params.get("id"));
      if (!carId) {
        this.errorMessage = "Car not found.";
        return;
      }

      this.carService.getCar(carId).subscribe({
        next: (car) => (this.car = car),
        error: () => (this.errorMessage = "Car not found."),
      });
    });
  }

  formatPrice(price: number): string {
    return this.indianPriceFormatter.format(price);
  }
}
