import { TestBed } from '@angular/core/testing';

import { CodingCreatorService } from './coding-creator.service';

describe('CodingCreatorService', () => {
  let service: CodingCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodingCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
