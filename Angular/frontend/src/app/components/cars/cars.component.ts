import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CarService } from '../../services/car.service';
import { Car } from '../../models/car.model';
import { UiFeedbackService } from '../../services/ui-feedback.service';
import { switchMap } from 'rxjs';

const MAX_CAR_PRICE = 999_999_999;
const MAX_CAR_MILEAGE = 1_000_000;

const VEHICLE_CATALOG: Record<string, Record<string, string[]>> = {
  'Maruti Suzuki': {
    'Alto K10': ['STD', 'LXi', 'VXi', 'VXi+'],
    Baleno: ['Sigma', 'Delta', 'Zeta', 'Alpha'],
    Swift: ['LXi', 'VXi', 'ZXi', 'ZXi+'],
    'Wagon R': ['LXi', 'VXi', 'ZXi'],
  },
  Hyundai: {
    Creta: ['E', 'EX', 'S', 'SX', 'SX(O)'],
    'Grand i10': ['Era', 'Magna', 'Sportz', 'Asta'],
    i20: ['Era', 'Magna', 'Sportz', 'Asta'],
    Venue: ['E', 'S', 'SX', 'SX(O)'],
  },
  Tata: {
    Nexon: ['Smart', 'Pure', 'Creative', 'Fearless'],
    Punch: ['Pure', 'Adventure', 'Accomplished', 'Creative'],
    Tiago: ['XE', 'XM', 'XT', 'XZ'],
  },
  Honda: {
    Amaze: ['E', 'S', 'VX', 'ZX'],
    City: ['SV', 'V', 'VX', 'ZX'],
    Jazz: ['V', 'VX', 'ZX'],
  },
  Toyota: {
    'Glanza': ['E', 'S', 'G', 'V'],
    'Innova Crysta': ['GX', 'VX', 'ZX'],
    'Urban Cruiser Hyryder': ['E', 'S', 'G', 'V'],
  },
  Mahindra: {
    'Scorpio-N': ['Z2', 'Z4', 'Z6', 'Z8'],
    Thar: ['AX', 'LX'],
    'XUV 3XO': ['MX1', 'MX2', 'AX5', 'AX7'],
  },
  Kia: {
    Carens: ['Premium', 'Prestige', 'Luxury', 'Luxury+'],
    Seltos: ['HTE', 'HTK', 'HTX', 'GTX'],
    Sonet: ['HTE', 'HTK', 'HTX', 'GTX'],
  },
  Renault: {
    Kiger: ['RXE', 'RXL', 'RXT', 'RXZ'],
    Kwid: ['RXE', 'RXL', 'RXT', 'Climber'],
    Triber: ['Authentic', 'Evolution', 'Techno', 'Emotion'],
  },
  Nissan: {
    Magnite: ['Visia', 'Acenta', 'N-Connecta', 'Tekna'],
  },
  Volkswagen: {
    Taigun: ['Comfortline', 'Highline', 'Topline', 'GT'],
    Virtus: ['Comfortline', 'Highline', 'Topline', 'GT'],
  },
  Skoda: {
    Kushaq: ['Classic', 'Signature', 'Sportline', 'Prestige'],
    Slavia: ['Classic', 'Signature', 'Sportline', 'Prestige'],
  },
};

const MODEL_INTRODUCTION_YEARS: Record<string, Record<string, number>> = {
  'Maruti Suzuki': {
    'Alto K10': 2010,
    Baleno: 2015,
    Swift: 2005,
    'Wagon R': 1999,
  },
  Hyundai: {
    Creta: 2015,
    'Grand i10': 2013,
    i20: 2008,
    Venue: 2019,
  },
  Tata: {
    Nexon: 2017,
    Punch: 2021,
    Tiago: 2016,
  },
  Honda: {
    Amaze: 2013,
    City: 1998,
    Jazz: 2009,
  },
  Toyota: {
    Glanza: 2019,
    'Innova Crysta': 2016,
    'Urban Cruiser Hyryder': 2022,
  },
  Mahindra: {
    'Scorpio-N': 2022,
    Thar: 2010,
    'XUV 3XO': 2024,
  },
  Kia: {
    Carens: 2022,
    Seltos: 2019,
    Sonet: 2020,
  },
  Renault: {
    Kiger: 2021,
    Kwid: 2015,
    Triber: 2019,
  },
  Nissan: {
    Magnite: 2020,
  },
  Volkswagen: {
    Taigun: 2021,
    Virtus: 2022,
  },
  Skoda: {
    Kushaq: 2021,
    Slavia: 2022,
  },
};

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarsComponent implements OnInit, OnDestroy {
  private readonly indianPriceFormatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  });

  cars: Car[] = [];
  pageNumber = 1;
  pageSize = 10;
  searchTerm = '';
  availabilityFilter: 'all' | 'available' | 'sold' = 'all';
  sortOption: 'default' | 'brand' | 'price-low' | 'price-high' = 'default';
  isLoading = false;
  isFormOpen = false;
  isSaving = false;
  showValidationErrors = false;
  errorMessage = '';
  imageErrorMessage = '';
  selectedImage?: File;
  imagePreviewUrl = '';
  priceInput = '';
  mileageInput = '';

  newCar: Car = this.createEmptyCar();
  editingId?: number;

  constructor(
    private readonly carService: CarService,
    private readonly feedback: UiFeedbackService,
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  ngOnDestroy(): void {
    this.revokeImagePreview();
  }

  get visibleCars(): Car[] {
    const startIndex = (this.pageNumber - 1) * this.pageSize;
    return this.filteredCars.slice(startIndex, startIndex + this.pageSize);
  }

  get filteredCars(): Car[] {
    const search = this.normalizeSearchTerm(this.searchTerm);
    const cars = search
      ? this.cars.filter((car) =>
          this.normalizeSearchTerm(
            [
              car.brand,
              car.model,
              car.variant,
              car.year,
              car.price,
              car.mileage,
              car.fuelType,
              car.transmission,
              car.registrationNumber,
              car.status,
            ].join(' '),
          ).includes(search),
        )
      : [...this.cars];

    const statusFilteredCars = cars.filter((car) => {
      const isAvailable = (car.status ?? 'Available').toLowerCase() === 'available';
      return this.availabilityFilter === 'all' ||
        (this.availabilityFilter === 'available' && isAvailable) ||
        (this.availabilityFilter === 'sold' && !isAvailable);
    });

    return statusFilteredCars.sort((left, right) => this.compareCars(left, right));
  }

  private isCarAvailable(car: Car): boolean {
    return (car.status ?? 'Available').toLowerCase() === 'available';
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCars.length / this.pageSize);
  }

  get firstRecordNumber(): number {
    return this.filteredCars.length === 0 ? 0 : (this.pageNumber - 1) * this.pageSize + 1;
  }

  get lastRecordNumber(): number {
    return Math.min(this.pageNumber * this.pageSize, this.filteredCars.length);
  }

  private normalizeSearchTerm(value: string | number | undefined): string {
    return String(value ?? '').toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
  }

  onSearchChange(): void {
    this.pageNumber = 1;
  }

  onSortChange(): void {
    this.pageNumber = 1;
  }

  onAvailabilityChange(): void {
    this.pageNumber = 1;
  }

  formatPrice(price: number): string {
    return this.indianPriceFormatter.format(price);
  }

  private compareCars(left: Car, right: Car): number {
    const leftAvailable = this.isCarAvailable(left);
    const rightAvailable = this.isCarAvailable(right);

    switch (this.sortOption) {
      case 'brand':
        return left.brand.localeCompare(right.brand, undefined, { sensitivity: 'base' });
      case 'price-low':
        return left.price - right.price;
      case 'price-high':
        return right.price - left.price;
      default:
        return Number(rightAvailable) - Number(leftAvailable);
    }
  }

  createEmptyCar(): Car {
    return {
      brand: '',
      model: '',
      variant: '',
      year: Number.NaN,
      price: Number.NaN,
      mileage: Number.NaN,
      fuelType: '',
      transmission: '',
      registrationNumber: '',
      imageUrl: ''
    };
  }

  get requiredFieldsFilled(): boolean {
    return Boolean(
      this.newCar.brand.trim() &&
        this.newCar.model.trim() &&
        this.newCar.variant?.trim() &&
        this.newCar.registrationNumber.trim() &&
        this.newCar.fuelType.trim() &&
        this.newCar.transmission.trim() &&
        this.yearIsValid &&
        this.priceIsValid &&
        this.mileageIsValid &&
        this.registrationNumberIsValid &&
        this.hasImage &&
        !this.imageErrorMessage,
    );
  }

  get yearIsValid(): boolean {
    return Number.isInteger(this.newCar.year) && this.newCar.year >= 1900 && this.newCar.year <= 2100;
  }

  get priceIsValid(): boolean {
    return Number.isFinite(this.newCar.price) &&
      this.newCar.price >= 1 &&
      this.newCar.price <= MAX_CAR_PRICE;
  }

  get mileageIsValid(): boolean {
    return Number.isInteger(this.newCar.mileage) &&
      this.newCar.mileage >= 0 &&
      this.newCar.mileage <= MAX_CAR_MILEAGE;
  }

  get registrationNumberIsValid(): boolean {
    const registrationNumber = this.newCar.registrationNumber.trim();
    return /^(?:[A-Z]{2}-\d{2}-[A-Z]{1,3}-\d{1,4}|\d{2}BH\d{4}[A-HJ-NP-Z]{1,2})$/i.test(
      registrationNumber,
    );
  }

  get hasImage(): boolean {
    return Boolean(this.selectedImage || this.newCar.imageUrl?.trim());
  }

  onGroupedNumberInput(event: Event, field: 'price' | 'mileage'): void {
    const input = event.target as HTMLInputElement;
    const digitsBeforeCaret = (input.value.slice(0, input.selectionStart ?? input.value.length).match(/\d/g) ?? []).length;
    const digits = input.value.replace(/\D/g, '');
    const formatted = this.formatIndianNumber(digits);

    if (field === 'price') {
      this.priceInput = formatted;
      this.newCar.price = digits ? Number(digits) : Number.NaN;
    } else {
      this.mileageInput = formatted;
      this.newCar.mileage = digits ? Number(digits) : Number.NaN;
    }

    input.value = formatted;
    let caretPosition = 0;
    let digitsSeen = 0;
    while (caretPosition < formatted.length && digitsSeen < digitsBeforeCaret) {
      if (/\d/.test(formatted[caretPosition])) digitsSeen++;
      caretPosition++;
    }
    input.setSelectionRange(caretPosition, caretPosition);
  }

  onRegistrationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const charactersBeforeCaret = (
      input.value.slice(0, input.selectionStart ?? input.value.length).match(/[A-Z0-9]/gi) ?? []
    ).length;
    const formatted = this.formatRegistrationNumber(input.value);

    this.newCar.registrationNumber = formatted;
    input.value = formatted;

    let caretPosition = 0;
    let charactersSeen = 0;
    while (caretPosition < formatted.length && charactersSeen < charactersBeforeCaret) {
      if (/[A-Z0-9]/i.test(formatted[caretPosition])) charactersSeen++;
      caretPosition++;
    }
    input.setSelectionRange(caretPosition, caretPosition);
  }

  private formatRegistrationNumber(value: string): string {
    const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (/^\d{1,2}/.test(compact)) {
      const year = compact.slice(0, 2);
      if (year.length < 2) return year;

      const bhRemainder = compact.slice(2).replace(/^BH?/, '');
      const digits = bhRemainder.replace(/\D/g, '').slice(0, 4);
      const letters = bhRemainder.replace(/[^A-Z]/g, '').slice(0, 2);
      return `${year}BH${digits}${letters}`;
    }

    const state = compact.match(/^[A-Z]{1,2}/)?.[0] ?? '';
    const afterState = compact.slice(state.length);
    const district = afterState.replace(/\D/g, '').slice(0, 2);
    const afterDistrict = afterState.replace(/^\d{0,2}/, '');
    const series = afterDistrict.replace(/[^A-Z]/g, '').slice(0, 3);
    const number = afterDistrict.replace(/\D/g, '').slice(0, 4);

    return [
      state,
      district && `${state.length === 2 ? '-' : ''}${district}`,
      series && `-${series}`,
      number && `-${number}`,
    ].join('');
  }

  private formatIndianNumber(digits: string): string {
    if (digits.length <= 3) return digits;
    const lastThreeDigits = digits.slice(-3);
    const precedingDigits = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return `${precedingDigits},${lastThreeDigits}`;
  }

  get brandOptions(): string[] {
    const options = Object.keys(VEHICLE_CATALOG);
    if (this.newCar.brand && !options.includes(this.newCar.brand)) {
      options.push(this.newCar.brand);
    }
    return options;
  }

  get modelOptions(): string[] {
    const options = Object.keys(VEHICLE_CATALOG[this.newCar.brand] ?? {});
    if (this.newCar.model && !options.includes(this.newCar.model)) {
      options.push(this.newCar.model);
    }
    return options;
  }

  get variantOptions(): string[] {
    const options =
      VEHICLE_CATALOG[this.newCar.brand]?.[this.newCar.model] ?? [];
    if (this.newCar.variant && !options.includes(this.newCar.variant)) {
      return [...options, this.newCar.variant];
    }
    return options;
  }

  get yearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    const introducedYear =
      MODEL_INTRODUCTION_YEARS[this.newCar.brand]?.[this.newCar.model] ??
      (this.editingId ? this.newCar.year : currentYear);
    const firstYear = Math.min(
      introducedYear,
      this.editingId ? this.newCar.year : introducedYear,
    );
    const lastYear = Math.max(
      currentYear,
      this.editingId ? this.newCar.year : currentYear,
    );

    return Array.from(
      { length: lastYear - firstYear + 1 },
      (_, index) => lastYear - index,
    );
  }

  toggleForm(): void {
    if (this.isFormOpen) {
      this.cancelForm();
      return;
    }

    this.isFormOpen = true;
  }

  onBrandChange(brand: string): void {
    this.newCar.brand = brand;
    this.newCar.model = '';
    this.newCar.variant = '';
    this.newCar.year = Number.NaN;
  }

  onModelChange(model: string): void {
    this.newCar.model = model;
    this.newCar.variant = '';
    this.newCar.year = Number.NaN;
  }

  cancelForm(): void {
    this.revokeImagePreview();
    this.newCar = this.createEmptyCar();
    this.priceInput = '';
    this.mileageInput = '';
    this.editingId = undefined;
    this.selectedImage = undefined;
    this.imageErrorMessage = '';
    this.showValidationErrors = false;
    this.isFormOpen = false;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const image = input.files?.[0];
    this.imageErrorMessage = '';

    if (!image) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(image.type)) {
      this.selectedImage = undefined;
      this.imageErrorMessage = 'Choose a JPG, PNG, or WebP image.';
      input.value = '';
      this.setImagePreview(this.newCar.imageUrl ?? '');
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      this.selectedImage = undefined;
      this.imageErrorMessage = 'The image must be 5 MB or smaller.';
      input.value = '';
      this.setImagePreview(this.newCar.imageUrl ?? '');
      return;
    }

    this.selectedImage = image;
    this.setImagePreview(URL.createObjectURL(image));
  }

  loadCars(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.carService.getCars().subscribe({
      next: cars => {
        this.cars = cars;
        this.pageNumber = Math.min(this.pageNumber, Math.max(this.totalPages, 1));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load cars. Check whether the backend API is running.';
        this.isLoading = false;
      }
    });
  }

  changePage(pageNumber: number): void {
    if (this.isLoading || pageNumber < 1 || pageNumber > this.totalPages) return;
    this.pageNumber = pageNumber;
  }

  changePageSize(pageSize: number): void {
    if (!Number.isInteger(pageSize) || pageSize < 1) return;
    this.pageSize = pageSize;
    this.pageNumber = 1;
  }

  editCar(car: Car): void {
    this.revokeImagePreview();
    this.newCar = {
      ...car,
      registrationNumber: this.formatRegistrationNumber(car.registrationNumber),
    };
    this.priceInput = this.formatIndianNumber(String(car.price));
    this.mileageInput = this.formatIndianNumber(String(car.mileage));
    this.editingId = car.carId;
    this.selectedImage = undefined;
    this.imageErrorMessage = '';
    this.imagePreviewUrl = car.imageUrl ?? '';
    this.showValidationErrors = false;
    this.isFormOpen = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveCar(): void {
    if (this.isSaving) return;
    this.showValidationErrors = true;
    if (!this.requiredFieldsFilled) return;

    const car = {
      ...this.newCar,
      brand: this.newCar.brand.trim(),
      model: this.newCar.model.trim(),
      variant: this.newCar.variant?.trim(),
      registrationNumber: this.newCar.registrationNumber.trim().toUpperCase(),
      fuelType: this.newCar.fuelType.trim(),
      transmission: this.newCar.transmission.trim(),
      imageUrl: this.newCar.imageUrl?.trim(),
    };
    const isEditing = this.editingId !== undefined;
    const saveCar = (imageUrl: string) => {
      const carWithImage = { ...car, imageUrl };
      return isEditing
        ? this.carService.updateCar(this.editingId!, carWithImage)
        : this.carService.addCar(carWithImage);
    };
    const request = this.selectedImage
      ? this.carService.uploadCarImage(this.selectedImage).pipe(
          switchMap(({ imageUrl }) => saveCar(imageUrl)),
        )
      : saveCar(car.imageUrl ?? '');

    this.isSaving = true;
    request.subscribe({
      next: () => {
        this.feedback.success(
          isEditing
            ? `${car.year} ${car.brand} ${car.model} was updated successfully.`
            : `${car.year} ${car.brand} ${car.model} was added to stock successfully.`,
        );
        this.cancelForm();
        this.isSaving = false;
        if (!isEditing) {
          this.searchTerm = '';
          this.pageNumber = 1;
        }
        this.loadCars();
      },
      error: (error) => {
        this.isSaving = false;
        this.feedback.error(this.getSaveErrorMessage(error));
      },
    });
  }

  private setImagePreview(url: string): void {
    this.revokeImagePreview();
    this.imagePreviewUrl = url;
  }

  private revokeImagePreview(): void {
    if (this.imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
    this.imagePreviewUrl = '';
  }

  private getSaveErrorMessage(error: { error?: unknown }): string {
    const details = error.error;
    if (typeof details === 'string' && details.trim()) return details;

    if (details && typeof details === 'object') {
      const response = details as { message?: unknown; title?: unknown };
      if (typeof response.message === 'string') return response.message;
      if (typeof response.title === 'string') return response.title;
    }

    return 'Unable to save the vehicle. Please check the details and try again.';
  }

  async deleteCar(id: number): Promise<void> {
    const confirmed = await this.feedback.confirm({
      title: 'Remove vehicle?',
      message: 'This vehicle will be removed from active inventory.',
      confirmLabel: 'Remove vehicle',
    });
    if (!confirmed) return;

    this.carService.deleteCar(id).subscribe({
      next: () => {
        if (this.visibleCars.length === 1 && this.pageNumber > 1) {
          this.pageNumber--;
        }
        this.feedback.success('Vehicle was removed from inventory.');
        this.loadCars();
      },
      error: (error) => this.feedback.error(this.getSaveErrorMessage(error)),
    });
  }
}
